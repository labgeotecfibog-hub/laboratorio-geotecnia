/**
 * Componente: Vista Principal del Tablero (Dashboard)
 * Identidad Visual: Universidad Nacional de Colombia • Laboratorio de Geotecnia
 */

window.GeoComponents = window.GeoComponents || {};

window.GeoComponents.renderDashboardView = function(container, onNavigate, onOpenQuickLog) {
  const projects = window.GeoStorage.getProjects();
  const logs = window.GeoStorage.getLogs();
  const members = window.GeoStorage.getMembers();

  const extensionProjects = projects.filter(p => p.type === 'Extensión');
  const researchProjects = projects.filter(p => p.type === 'Investigación');

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status !== 'Finalizado').length;
  const pendingLogs = logs.filter(l => l.status === 'Pendiente');
  const approvedLogs = logs.filter(l => l.status === 'Aprobado');

  const totalHours = logs.reduce((sum, l) => sum + (Number(l.hoursWorked) || 0), 0);

  const averageProgress = totalProjects > 0
    ? Math.round(projects.reduce((sum, p) => sum + window.GeoUtils.calculateProjectProgress(p), 0) / totalProjects)
    : 0;

  container.innerHTML = `
    <div class="space-y-8 animate-fadeIn">
      
      <!-- Welcome Hero Banner with Official UNAL Logos -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-unal-900 via-unal-800 to-unal-700 p-6 sm:p-8 text-white shadow-2xl border-2 border-unal-400/40">
        <div class="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div class="max-w-3xl space-y-3">
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-unal-400/20 border border-unal-400/40 text-unal-300 text-xs font-bold uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-unal-400 animate-ping"></span>
              <span>Universidad Nacional de Colombia • Sede Bogotá</span>
            </div>
            
            <h1 class="text-2xl sm:text-4xl font-extrabold font-heading tracking-tight text-white">
              Laboratorio de Geotecnia
            </h1>
            
            <p class="text-sm sm:text-base text-slate-200 font-normal leading-relaxed">
              Plataforma institucional de control y seguimiento a proyectos de <strong>Extensión Técnica</strong> (servicios a entidades y concesiones) e <strong>Investigación Científica</strong>. Monitoreo de ensayos con normas ASTM/NTC, avance porcentual automático y evidencias centralizadas en Google Drive.
            </p>
            
            <div class="pt-2 flex flex-wrap items-center gap-3">
              <button id="hero-quick-log-btn" class="px-5 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-sm shadow-lg shadow-unal-400/30 transition-all flex items-center space-x-2 transform active:scale-95">
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
                <span>Registrar Avance de Actividad</span>
              </button>
              
              <button id="hero-report-btn" class="px-4 py-2.5 rounded-xl bg-unal-800/90 hover:bg-unal-700/90 text-white font-semibold text-sm border border-unal-400/40 transition-all flex items-center space-x-2">
                <i data-lucide="file-spreadsheet" class="w-4 h-4 text-unal-400"></i>
                <span>Generar Informe Semanal</span>
              </button>
            </div>
          </div>

          <!-- Official Logos Display -->
          <div class="hidden lg:flex flex-col items-center justify-center p-4 bg-white/95 rounded-2xl shadow-xl border border-slate-200 shrink-0">
            <img src="./Diseno/logosimbolo_central_2c.png" alt="Logosímbolo Universidad Nacional de Colombia" class="h-28 w-auto object-contain">
            <span class="text-[10px] font-bold text-unal-700 mt-1 uppercase tracking-wider">Facultad de Ingeniería</span>
          </div>

        </div>

        <!-- Decorative Background Glow -->
        <div class="absolute -right-12 -bottom-12 w-72 h-72 bg-unal-400/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <!-- KPI Metrics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <!-- Proyectos Activos -->
        <div class="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-unal-400 transition-all">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Proyectos Activos</p>
              <h3 class="text-2xl font-black text-slate-800 mt-1">${activeProjects} <span class="text-sm font-normal text-slate-400">/ ${totalProjects}</span></h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-unal-50 text-unal-700 flex items-center justify-center font-bold border border-unal-200">
              <i data-lucide="folder-kanban" class="w-6 h-6"></i>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span><strong class="text-unal-700">${extensionProjects.length}</strong> Extensión</span>
            <span><strong class="text-unal-700">${researchProjects.length}</strong> Investigación</span>
          </div>
        </div>

        <!-- Avance Promedio -->
        <div class="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-unal-400 transition-all">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Avance Promedio</p>
              <h3 class="text-2xl font-black text-slate-800 mt-1">${averageProgress}%</h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200">
              <i data-lucide="trending-up" class="w-6 h-6"></i>
            </div>
          </div>
          <div class="mt-4 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div class="bg-gradient-to-r from-unal-400 to-unal-600 h-2.5 rounded-full transition-all duration-700" style="width: ${averageProgress}%"></div>
          </div>
        </div>

        <!-- Bandeja de Revisión -->
        <div class="glass-card p-5 rounded-2xl relative overflow-hidden cursor-pointer group hover:border-unal-red transition-all" id="kpi-approvals-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Bandeja de Revisión</p>
              <h3 class="text-2xl font-black text-slate-800 mt-1 flex items-center space-x-2">
                <span>${pendingLogs.length}</span>
                ${pendingLogs.length > 0 ? `
                  <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-unal-red border border-red-200">
                    Pendientes
                  </span>
                ` : `
                  <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-unal-100 text-unal-700 border border-unal-200">
                    Al día
                  </span>
                `}
              </h3>
            </div>
            <div class="w-12 h-12 rounded-xl ${pendingLogs.length > 0 ? 'bg-red-50 text-unal-red' : 'bg-unal-50 text-unal-700'} flex items-center justify-center font-bold">
              <i data-lucide="check-circle-2" class="w-6 h-6"></i>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>Clic para validar anexos</span>
            <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform"></i>
          </div>
        </div>

        <!-- Horas Totales Lab -->
        <div class="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-unal-400 transition-all">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Horas Totales Lab</p>
              <h3 class="text-2xl font-black text-slate-800 mt-1">${totalHours.toFixed(1)} <span class="text-sm font-normal text-slate-400">hrs</span></h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <i data-lucide="clock" class="w-6 h-6"></i>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span><strong>${members.length}</strong> integrantes activos</span>
            <span><strong>${approvedLogs.length}</strong> ensayos validados</span>
          </div>
        </div>

      </div>

      <!-- Main Section: Projects Status & Recent Logs -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left 2 Cols: Projects Overview -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold font-heading text-slate-800">Estado de Proyectos en Ejecución</h2>
              <p class="text-xs text-slate-500">Cálculo ponderado automático según avance de actividades ($WBS$)</p>
            </div>
            <button id="view-all-projects-btn" class="text-xs font-bold text-unal-700 hover:text-unal-900 flex items-center space-x-1">
              <span>Ver todos los proyectos</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <div class="space-y-4">
            ${projects.map(p => {
              const progress = window.GeoUtils.calculateProjectProgress(p);
              const health = window.GeoUtils.getProjectHealth(p);
              const completedActs = (p.activities || []).filter(a => a.progress >= 100).length;
              const totalActs = (p.activities || []).length;

              return `
                <div class="glass-card p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div class="space-y-1">
                      <div class="flex items-center space-x-2">
                        <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold ${p.type === 'Extensión' ? 'bg-blue-100 text-blue-800' : 'bg-unal-100 text-unal-800'}">
                          ${p.type}
                        </span>
                        <span class="font-mono text-xs font-bold text-slate-500">${p.code}</span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${health.badgeClass}">
                          ${health.status}
                        </span>
                      </div>
                      <h3 class="font-bold text-slate-900 text-base leading-snug">${p.name}</h3>
                      <p class="text-xs text-slate-500">Entidad: <span class="font-medium text-slate-700">${p.client || 'Universidad Nacional de Colombia'}</span> • Límite: <span class="font-medium text-slate-700">${window.GeoUtils.formatDateCO(p.deadline)}</span></p>
                    </div>

                    <div class="text-right shrink-0 mt-2 sm:mt-0">
                      <div class="text-2xl font-black font-mono text-slate-900">${progress}%</div>
                      <span class="text-[11px] text-slate-400">${completedActs} de ${totalActs} actividades listas</span>
                    </div>
                  </div>

                  <div class="mt-4 w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                    <div class="h-full rounded-full bg-gradient-to-r ${progress >= 80 ? 'from-unal-500 to-unal-400' : progress >= 40 ? 'from-amber-500 to-amber-400' : 'from-blue-600 to-blue-400'} transition-all duration-700" style="width: ${progress}%"></div>
                  </div>

                  <div class="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    ${(p.activities || []).slice(0, 2).map(a => `
                      <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span class="truncate pr-2">${a.name}</span>
                        <span class="font-bold font-mono text-slate-800 shrink-0">${a.progress}%</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Right 1 Col: Recent Activity -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold font-heading text-slate-800">Últimos Registros</h2>
            <span class="text-xs text-slate-400 font-medium">${logs.length} en total</span>
          </div>

          <div class="glass-card rounded-2xl p-4 divide-y divide-slate-100 border border-slate-200">
            ${logs.slice(0, 5).map(l => {
              const proj = projects.find(p => p.id === l.projectId) || {};
              const act = (proj.activities || []).find(a => a.id === l.activityId) || {};
              const isPending = l.status === 'Pendiente';

              return `
                <div class="py-3.5 first:pt-0 last:pb-0 space-y-2">
                  <div class="flex items-start justify-between">
                    <div>
                      <span class="font-semibold text-slate-900 text-xs">${l.memberName}</span>
                      <p class="text-[11px] text-slate-500 truncate max-w-[180px]">[${proj.code || 'PRJ'}] ${act.name || 'Actividad'}</p>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-unal-100 text-unal-800'}">
                      ${l.status}
                    </span>
                  </div>

                  <p class="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg italic">
                    "${l.notes}"
                  </p>

                  <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>${window.GeoUtils.formatDateCO(l.date)} • <strong>${l.hoursWorked} hrs</strong></span>
                    ${(l.attachments && l.attachments.length > 0) ? `
                      <span class="text-unal-700 font-medium flex items-center space-x-1">
                        <i data-lucide="paperclip" class="w-3 h-3"></i>
                        <span>${l.attachments.length} anexo(s)</span>
                      </span>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>

    </div>
  `;

  container.querySelector('#hero-quick-log-btn').addEventListener('click', onOpenQuickLog);
  container.querySelector('#hero-report-btn').addEventListener('click', () => onNavigate('weekly-report'));
  container.querySelector('#view-all-projects-btn').addEventListener('click', () => onNavigate('projects'));
  container.querySelector('#kpi-approvals-card').addEventListener('click', () => onNavigate('approvals'));

  if (window.lucide) window.lucide.createIcons();
};
