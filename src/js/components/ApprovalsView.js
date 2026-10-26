/**
 * Componente: Bandeja de Revisión y Aprobación de Avances
 * Identidad Visual: Universidad Nacional de Colombia • Laboratorio de Geotecnia
 * 
 * Acceso Restringido: Exclusivo para Dirección y Coordinadores (Revisores Autorizados)
 */

window.GeoComponents = window.GeoComponents || {};

window.GeoComponents.renderApprovalsView = function(container, onLogReviewed, onRequestLogin) {
  const isReviewer = window.GeoAuth ? window.GeoAuth.isReviewer() : false;
  const currentReviewer = isReviewer ? window.GeoAuth.getCurrentUser() : null;

  // --- 1. BLOQUEO PARA ESTUDIANTES AUXILIARES / USUARIOS NO AUTENTICADOS ---
  if (!isReviewer || !currentReviewer) {
    container.innerHTML = `
      <div class="max-w-2xl mx-auto my-8 sm:my-14 animate-fadeIn">
        <div class="glass-card bg-white rounded-3xl border-2 border-unal-400/40 p-8 sm:p-10 text-center shadow-xl space-y-6">
          
          <div class="w-20 h-20 rounded-3xl bg-unal-50 text-unal-800 border-2 border-unal-300 flex items-center justify-center mx-auto shadow-md">
            <i data-lucide="shield-lock" class="w-10 h-10 text-unal-700"></i>
          </div>

          <div class="space-y-2">
            <span class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider">
              <i data-lucide="lock" class="w-3.5 h-3.5 text-amber-700"></i>
              <span>Apartado de Acceso Restringido</span>
            </span>

            <h1 class="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              Revisión y Aprobación de Avances
            </h1>

            <p class="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed pt-1">
              Este apartado está reservado exclusivamente para la <strong>Dirección y Coordinación</strong> del Laboratorio de Geotecnia (Prof. Julio Colmenares, Ing. Daniel Rodríguez e Ing. Edwin Prieto).
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-700 space-y-2 max-w-lg mx-auto">
            <div class="flex items-center space-x-2 text-unal-800 font-bold">
              <i data-lucide="info" class="w-4 h-4 text-unal-700 shrink-0"></i>
              <span>¿Eres estudiante auxiliar del laboratorio?</span>
            </div>
            <p class="text-slate-600">
              Puedes registrar tus horas y ensayos ejecutados libremente en el botón superior <strong>"Registrar Avance"</strong>, o consultar los proyectos en el <strong>"Tablero"</strong>. La validación formal de evidencias en Drive corresponde a los coordinadores.
            </p>
          </div>

          <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button id="btn-request-login-approvals" class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-sm shadow-lg shadow-unal-400/25 transition-all flex items-center justify-center space-x-2 transform active:scale-98">
              <i data-lucide="log-in" class="w-4 h-4 text-unal-900"></i>
              <span>Iniciar Sesión como Revisor</span>
            </button>
          </div>

        </div>
      </div>
    `;

    const loginBtn = container.querySelector('#btn-request-login-approvals');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        if (onRequestLogin) {
          onRequestLogin('Inicia sesión con tus credenciales institucionales de revisor para acceder a la bandeja de aprobación.');
        }
      });
    }

    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // --- 2. VISTA COMPLETA PARA REVISORES AUTORIZADOS ---
  let activeFilter = 'Pendiente';

  function render() {
    const logs = window.GeoStorage.getLogs();
    const projects = window.GeoStorage.getProjects();

    const pendingCount = logs.filter(l => l.status === 'Pendiente').length;
    const approvedCount = logs.filter(l => l.status === 'Aprobado').length;
    const adjustCount = logs.filter(l => l.status === 'Ajuste Solicitado').length;

    const filteredLogs = logs.filter(l => {
      if (activeFilter === 'all') return true;
      return l.status === activeFilter;
    });

    container.innerHTML = `
      <div class="space-y-6 animate-fadeIn">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2">
              <h1 class="text-2xl font-bold font-heading text-slate-900">Bandeja de Aprobación de Avances</h1>
              ${pendingCount > 0 ? `
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-unal-red border border-red-200">
                  ${pendingCount} pendientes
                </span>
              ` : `
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Al día
                </span>
              `}
            </div>
            <p class="text-xs sm:text-sm text-slate-500">Revisión técnica de actividades reportadas por los estudiantes y verificación de anexos en Google Drive</p>
          </div>

          <div class="flex items-center space-x-2.5 bg-unal-50 p-2 rounded-2xl border border-unal-200 text-xs">
            <div class="w-8 h-8 rounded-xl bg-unal-700 text-white flex items-center justify-center font-bold font-mono">
              ${currentReviewer.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span class="text-[10px] text-slate-500 uppercase font-bold block leading-none">Revisor Activo:</span>
              <span class="font-bold text-unal-950">${currentReviewer.name}</span>
            </div>
          </div>
        </div>

        <div class="glass-card p-3 rounded-2xl flex flex-wrap items-center gap-2 border border-slate-200">
          <button class="approval-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === 'Pendiente' ? 'bg-unal-400 text-unal-900 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}" data-filter="Pendiente">
            Pendientes (${pendingCount})
          </button>
          <button class="approval-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === 'Aprobado' ? 'bg-unal-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}" data-filter="Aprobado">
            Aprobados (${approvedCount})
          </button>
          <button class="approval-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === 'Ajuste Solicitado' ? 'bg-amber-100 text-amber-900 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}" data-filter="Ajuste Solicitado">
            Requieren Ajuste (${adjustCount})
          </button>
          <button class="approval-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === 'all' ? 'bg-unal-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}" data-filter="all">
            Todos (${logs.length})
          </button>
        </div>

        <div class="space-y-4">
          ${filteredLogs.length === 0 ? `
            <div class="glass-card p-12 text-center rounded-2xl border border-dashed border-slate-300">
              <i data-lucide="check-check" class="w-12 h-12 text-unal-500 mx-auto mb-3"></i>
              <p class="text-base font-semibold text-slate-800">No hay registros en esta categoría</p>
              <p class="text-xs text-slate-400 mt-1">Todos los avances correspondientes han sido revisados y validados.</p>
            </div>
          ` : filteredLogs.map(log => {
            const project = projects.find(p => p.id === log.projectId) || {};
            const activity = (project.activities || []).find(a => a.id === log.activityId) || {};
            const isPending = log.status === 'Pendiente';
            const isApproved = log.status === 'Aprobado';

            return `
              <div class="glass-card rounded-2xl border ${isPending ? 'border-unal-400 ring-1 ring-unal-300' : 'border-slate-200'} p-5 sm:p-6 transition-all hover:shadow-md">
                <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  
                  <div class="space-y-3 flex-1">
                    
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isPending ? 'bg-amber-100 text-amber-800' :
                        isApproved ? 'bg-unal-100 text-unal-800' : 'bg-red-100 text-unal-red'
                      }">
                        ${log.status}
                      </span>

                      <span class="text-xs font-bold text-slate-500 font-mono">[${project.code || 'PRJ'}] ${project.type || 'Proyecto'}</span>
                      <span class="text-xs text-slate-400">• Fecha: <strong>${window.GeoUtils.formatDateCO(log.date)}</strong></span>
                      <span class="text-xs text-slate-400">• Tiempo: <strong>${log.hoursWorked} hrs</strong></span>
                    </div>

                    <div>
                      <h3 class="text-base sm:text-lg font-bold text-slate-900">${project.name || 'Proyecto Geotécnico'}</h3>
                      <p class="text-xs font-semibold text-unal-700 mt-0.5">
                        Actividad: ${activity.name || 'Actividad General'} (Peso: ${activity.weight || 0}%)
                      </p>
                    </div>

                    <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div class="flex items-center space-x-2">
                        <span class="font-bold text-slate-800">Registrado por:</span>
                        <span class="px-2 py-0.5 rounded bg-white font-medium text-slate-700 border border-slate-200">${log.memberName}</span>
                        <span class="text-slate-400">|</span>
                        <span class="font-bold text-slate-800">Avance propuesto:</span>
                        <span class="font-mono font-bold text-unal-800 bg-unal-50 px-2 py-0.5 rounded border border-unal-200">${log.progressReported}%</span>
                      </div>
                      <p class="text-slate-700 leading-relaxed italic">"${log.notes}"</p>
                    </div>

                    ${(log.attachments && log.attachments.length > 0) ? `
                      <div class="space-y-1.5 pt-1">
                        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                          <i data-lucide="paperclip" class="w-3.5 h-3.5 text-unal-600"></i>
                          <span>Anexos en Google Drive (${log.attachments.length}):</span>
                        </span>
                        
                        <div class="flex flex-wrap gap-2">
                          ${log.attachments.map(att => `
                            <a href="${att.url || 'https://drive.google.com'}" target="_blank" class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-unal-50 hover:bg-unal-100 hover:border-unal-400 border border-unal-200 text-xs text-slate-700 transition-all">
                              <i data-lucide="${att.type === 'excel' ? 'file-spreadsheet' : att.type === 'pdf' ? 'file-text' : 'file'}" class="w-4 h-4 text-unal-700"></i>
                              <span class="font-medium truncate max-w-[200px]">${att.name}</span>
                              <span class="text-[10px] text-slate-400">(${att.size})</span>
                              <i data-lucide="external-link" class="w-3 h-3 text-slate-400"></i>
                            </a>
                          `).join('')}
                        </div>
                      </div>
                    ` : `
                      <p class="text-[11px] text-slate-400 italic">Sin anexos adjuntos</p>
                    `}

                    ${log.reviewComments ? `
                      <div class="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                        <strong>Comentarios de revisión:</strong> ${log.reviewComments} (${window.GeoUtils.formatDateCO(log.reviewDate)})
                      </div>
                    ` : ''}

                  </div>

                  ${isPending ? `
                    <div class="flex flex-row lg:flex-col items-center justify-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                      <button data-approve-log="${log.id}" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-unal-700 hover:bg-unal-800 text-white font-bold text-xs shadow-md shadow-unal-700/20 transition-all flex items-center justify-center space-x-2">
                        <i data-lucide="check" class="w-4 h-4 text-unal-400"></i>
                        <span>Aprobar Avance</span>
                      </button>

                      <button data-request-adjust="${log.id}" class="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-semibold text-xs border border-slate-300 transition-all flex items-center justify-center space-x-1.5">
                        <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
                        <span>Requerir Ajuste</span>
                      </button>

                      <button data-delete-log="${log.id}" title="Eliminar registro" class="w-full sm:w-auto px-3 py-2 rounded-xl text-slate-400 hover:text-unal-red hover:bg-red-50 text-xs transition-all flex items-center justify-center space-x-1">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        <span class="sm:hidden">Eliminar</span>
                      </button>
                    </div>
                  ` : `
                    <div class="flex flex-col items-end gap-1.5 shrink-0 text-right">
                      <div class="text-xs text-slate-400">
                        <span class="font-medium">Validado por:</span>
                        <p class="font-bold text-slate-700">${log.reviewedBy || currentReviewer.name}</p>
                        <p class="text-[11px]">${window.GeoUtils.formatDateCO(log.reviewDate)}</p>
                      </div>
                      <button data-delete-log="${log.id}" title="Eliminar este registro" class="p-1 rounded text-slate-300 hover:text-unal-red transition-colors">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    </div>
                  `}

                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;

    container.querySelectorAll('.approval-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-filter');
        render();
      });
    });

    container.querySelectorAll('[data-approve-log]').forEach(btn => {
      btn.addEventListener('click', () => {
        const logId = btn.getAttribute('data-approve-log');
        window.GeoStorage.reviewLog(logId, currentReviewer.name, true, `Aprobado por ${currentReviewer.name} (${currentReviewer.role}). Conforme a especificaciones.`);
        if (typeof confetti === 'function') {
          confetti({ particleCount: 50, spread: 45, origin: { y: 0.7 } });
        }
        render();
        if (onLogReviewed) onLogReviewed();
      });
    });

    container.querySelectorAll('[data-request-adjust]').forEach(btn => {
      btn.addEventListener('click', () => {
        const logId = btn.getAttribute('data-request-adjust');
        const reason = prompt('Indica las correcciones u observaciones técnicas para el estudiante:');
        if (reason && reason.trim() !== '') {
          window.GeoStorage.reviewLog(logId, currentReviewer.name, false, reason.trim());
          render();
          if (onLogReviewed) onLogReviewed();
        }
      });
    });

    container.querySelectorAll('[data-delete-log]').forEach(btn => {
      btn.addEventListener('click', () => {
        const logId = btn.getAttribute('data-delete-log');
        if (confirm('¿Estás seguro de que deseas eliminar este registro de avance reportado?')) {
          window.GeoStorage.deleteLog(logId);
          render();
          if (onLogReviewed) onLogReviewed();
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  render();
};
