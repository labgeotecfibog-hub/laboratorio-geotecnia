/**
 * Componente: Generador y Visualizador del Informe Semanal Institucional
 * Identidad Oficial: Universidad Nacional de Colombia • Laboratorio de Geotecnia
 */

window.GeoComponents = window.GeoComponents || {};

window.GeoComponents.renderWeeklyReportView = function(container) {
  let selectedWeek = window.GeoUtils.getISOWeekNumber(new Date());
  let selectedYear = new Date().getFullYear();

  function render() {
    const reportData = window.GeoReport.getWeeklyReportData(selectedWeek, selectedYear);

    const currentWeek = window.GeoUtils.getISOWeekNumber(new Date());
    const weekOptions = [];
    for (let w = currentWeek; w >= Math.max(1, currentWeek - 8); w--) {
      weekOptions.push(w);
    }

    container.innerHTML = `
      <div class="space-y-6 animate-fadeIn">
        
        <!-- Controls Bar -->
        <div class="glass-card p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200">
          
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-unal-400 text-unal-900 flex items-center justify-center font-bold shadow-md shadow-unal-400/30">
              <i data-lucide="calendar" class="w-5 h-5"></i>
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Periodo del Informe</label>
              <select id="select-report-week" class="font-bold text-sm text-slate-900 bg-transparent outline-none cursor-pointer border-b-2 border-unal-400 pb-0.5">
                ${weekOptions.map(w => `
                  <option value="${w}" ${w === selectedWeek ? 'selected' : ''}>
                    Semana No. ${w} (${selectedYear})
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <button id="btn-send-email-report" class="px-4 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-xs shadow-md shadow-unal-400/25 transition-all flex items-center space-x-2">
              <i data-lucide="mail" class="w-4 h-4 text-unal-900"></i>
              <span>Enviar Informe por Correo</span>
            </button>

            <button id="btn-export-excel" class="px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center space-x-1.5">
              <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
              <span>Excel (.xlsx)</span>
            </button>

            <button id="btn-export-pdf" class="px-3.5 py-2.5 rounded-xl bg-unal-800 hover:bg-unal-700 text-white font-bold text-xs shadow-md shadow-unal-800/30 transition-all flex items-center space-x-1.5">
              <i data-lucide="file-text" class="w-4 h-4 text-unal-400"></i>
              <span>PDF Oficial</span>
            </button>

            <button id="btn-print-report" class="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition-all" title="Imprimir">
              <i data-lucide="printer" class="w-4 h-4"></i>
            </button>
          </div>

        </div>

        <!-- Printable Official Report Document -->
        <div id="institutional-report-document" class="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-6 sm:p-10 space-y-8 max-w-5xl mx-auto text-slate-800">
          
          <!-- Official UNAL Document Header -->
          <div class="border-b-4 border-unal-800 pb-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              
              <!-- Left: Logosymbol & Hierarchy -->
              <div class="flex items-center space-x-4">
                <img src="./Diseno/Escudo_color.png" alt="Escudo UNAL" class="h-20 w-auto object-contain shrink-0">
                <div class="space-y-0.5">
                  <span class="text-[10px] font-extrabold tracking-widest text-unal-700 uppercase block">
                    UNIVERSIDAD NACIONAL DE COLOMBIA
                  </span>
                  <h1 class="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight leading-tight">
                    INFORME SEMANAL DE AVANCE
                  </h1>
                  <p class="text-xs font-bold text-slate-600">
                    Facultad de Ingeniería • Departamento de Ingeniería Civil y Agrícola
                  </p>
                  <p class="text-xs font-bold text-unal-700">
                    Laboratorio de Geotecnia (Extensión e Investigación)
                  </p>
                </div>
              </div>

              <!-- Right: Document Metadata -->
              <div class="text-left sm:text-right text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
                <p><span class="font-bold text-slate-800">Código:</span> <span class="font-mono text-unal-800 font-bold">INF-GEO-2026-S${selectedWeek}</span></p>
                <p><span class="font-bold text-slate-800">Periodo:</span> Semana ${reportData.weekNumber} (${reportData.dateRange})</p>
                <p><span class="font-bold text-slate-800">Fecha de Emisión:</span> ${reportData.generatedAt}</p>
                <p><span class="font-bold text-slate-800">Proyectos Activos:</span> ${reportData.activeProjectsCount}</p>
              </div>

            </div>
          </div>

          <!-- Section 1: Executive KPI Metrics -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-unal-50/50 p-4 rounded-xl border border-unal-200 text-center">
            <div>
              <p class="text-[11px] font-bold uppercase text-slate-500">Proyectos Totales</p>
              <h4 class="text-xl font-black text-slate-900 mt-0.5">${reportData.totalProjects}</h4>
            </div>
            <div>
              <p class="text-[11px] font-bold uppercase text-slate-500">Horas Semanales</p>
              <h4 class="text-xl font-black text-unal-700 mt-0.5">${reportData.totalWeeklyHours.toFixed(1)} hrs</h4>
            </div>
            <div>
              <p class="text-[11px] font-bold uppercase text-slate-500">Actividades Validadas</p>
              <h4 class="text-xl font-black text-emerald-700 mt-0.5">${reportData.totalWeeklyLogs}</h4>
            </div>
            <div>
              <p class="text-[11px] font-bold uppercase text-slate-500">Integrantes Activos</p>
              <h4 class="text-xl font-black text-slate-900 mt-0.5">${reportData.memberContributions.length}</h4>
            </div>
          </div>

          <!-- Section 2: Resumen Consolidado de Proyectos -->
          <div class="space-y-3">
            <h2 class="text-sm font-bold font-heading uppercase tracking-wider text-unal-900 border-b-2 border-unal-700 pb-1.5 flex items-center justify-between">
              <span>1. Estado y Avance Consolidado de Proyectos</span>
              <span class="text-xs font-normal text-slate-500 lowercase">(${reportData.projectSummaries.length} proyectos registrados)</span>
            </h2>

            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left border-collapse">
                <thead>
                  <tr class="bg-unal-800 text-white font-bold">
                    <th class="p-2.5 rounded-l-lg">Código</th>
                    <th class="p-2.5">Proyecto</th>
                    <th class="p-2.5">Tipo</th>
                    <th class="p-2.5">Entidad / Cliente</th>
                    <th class="p-2.5 text-center">% Avance Actual</th>
                    <th class="p-2.5 text-center">Horas Semana</th>
                    <th class="p-2.5 rounded-r-lg text-center">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 text-slate-700">
                  ${reportData.projectSummaries.map(p => `
                    <tr class="hover:bg-slate-50">
                      <td class="p-2.5 font-mono font-bold text-slate-900">${p.code}</td>
                      <td class="p-2.5 font-medium text-slate-900 max-w-xs">${p.name}</td>
                      <td class="p-2.5">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.type === 'Extensión' ? 'bg-blue-100 text-blue-800' : 'bg-unal-100 text-unal-800'}">
                          ${p.type}
                        </span>
                      </td>
                      <td class="p-2.5 text-slate-600">${p.client || 'N/A'}</td>
                      <td class="p-2.5 text-center font-mono font-bold text-unal-700">${p.currentProgress}%</td>
                      <td class="p-2.5 text-center font-mono font-semibold">${p.weeklyHours} hrs</td>
                      <td class="p-2.5 text-center">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'En Ejecución' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}">
                          ${p.status}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            ${(window.GeoUtils && window.GeoUtils.getAllOverdueTasks(window.GeoStorage.getProjects()).length > 0) ? `
              <!-- Alerta de Compromisos y Tareas Atrasadas -->
              <div class="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs space-y-2">
                <div class="flex items-center space-x-2 text-rose-800 font-bold">
                  <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-600"></i>
                  <span>Alerta de Control de Cronograma: Tareas con Fecha Límite Vencida</span>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-xs text-left border-collapse bg-white rounded-lg overflow-hidden border border-rose-200">
                    <thead class="bg-rose-100 text-rose-900 font-bold text-[11px]">
                      <tr>
                        <th class="p-2">Proyecto</th>
                        <th class="p-2">Actividad Atrasada</th>
                        <th class="p-2">Fecha Límite</th>
                        <th class="p-2 text-center">Días de Retraso</th>
                        <th class="p-2 text-center">% Avance</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-rose-100 text-[11px]">
                      ${window.GeoUtils.getAllOverdueTasks(window.GeoStorage.getProjects()).map(o => `
                        <tr class="hover:bg-rose-50/50">
                          <td class="p-2 font-mono font-bold text-slate-800">${o.project.code}</td>
                          <td class="p-2 font-medium text-slate-900">${o.activity.name}</td>
                          <td class="p-2 text-rose-700 font-bold">${window.GeoUtils.formatDateCO(o.activity.deadline || o.project.deadline)}</td>
                          <td class="p-2 text-center font-bold text-rose-600">+${o.delayDays} días</td>
                          <td class="p-2 text-center font-mono font-bold text-slate-800">${o.activity.progress}%</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Section 3: Desglose de Actividades y Anexos en Google Drive -->
          <div class="space-y-4 pt-2">
            <h2 class="text-sm font-bold font-heading uppercase tracking-wider text-unal-900 border-b-2 border-unal-700 pb-1.5 flex items-center justify-between">
              <span>2. Detalle de Actividades Ejecutadas y Anexos en Google Drive</span>
              <span class="text-xs font-normal text-emerald-700 font-semibold flex items-center space-x-1">
                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                <span>Ensayos y tareas validadas</span>
              </span>
            </h2>

            <div class="space-y-4">
              ${reportData.projectSummaries.filter(p => p.hasActivityThisWeek).length === 0 ? `
                <div class="p-6 rounded-xl bg-slate-50 text-center text-slate-500 text-xs border border-dashed border-slate-300">
                  No se registraron actividades aprobadas durante esta semana para los proyectos.
                </div>
              ` : reportData.projectSummaries.filter(p => p.hasActivityThisWeek).map(p => `
                <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <div class="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span class="font-bold text-slate-900 text-sm">[${p.code}] ${p.name}</span>
                    <span class="text-xs font-mono font-bold text-unal-700">${p.currentProgress}% completado</span>
                  </div>

                  <div class="space-y-2.5">
                    ${p.workedActivities.map(act => `
                      <div class="bg-white p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span class="font-bold text-slate-800">📌 ${act.activityName}</span>
                          <span class="text-[11px] text-slate-500 font-medium">Por: <strong>${act.memberName}</strong> • ${window.GeoUtils.formatDateCO(act.date)} (${act.hours} hrs)</span>
                        </div>

                        <p class="text-slate-600 italic">"${act.notes}"</p>

                        ${(act.attachments && act.attachments.length > 0) ? `
                          <div class="flex flex-wrap items-center gap-2 pt-1">
                            <span class="text-[10px] font-bold uppercase text-slate-500">Anexos en Google Drive:</span>
                            ${act.attachments.map(att => `
                              <a href="${att.url || 'https://drive.google.com'}" target="_blank" class="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-unal-50 text-unal-800 hover:bg-unal-100 border border-unal-300 text-[11px] font-medium transition-colors">
                                <i data-lucide="file-text" class="w-3 h-3 text-unal-700"></i>
                                <span>${att.name}</span>
                                <i data-lucide="external-link" class="w-2.5 h-2.5 text-unal-600"></i>
                              </a>
                            `).join('')}
                          </div>
                        ` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Section 3: Detalle de Labores y Ensayos por Integrante -->
          <div class="space-y-4 pt-2">
            <div class="border-b-2 border-unal-700 pb-1.5 flex items-center justify-between">
              <h2 class="text-sm font-bold font-heading uppercase tracking-wider text-unal-900">
                3. Detalle de Labores y Ensayos Desarrollados por Integrante
              </h2>
              <span class="text-xs font-semibold text-slate-500">${reportData.memberContributions.length} integrantes activos en la semana</span>
            </div>

            <div class="space-y-3">
              ${reportData.memberContributions.length === 0 ? `
                <div class="p-6 rounded-xl bg-slate-50 text-center text-slate-500 text-xs border border-dashed border-slate-300">
                  No se registraron horas ni avances técnicos aprobados por integrantes para esta semana.
                </div>
              ` : reportData.memberContributions.map(m => `
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
                    <div>
                      <span class="font-bold text-slate-900 text-sm block">${m.name}</span>
                      <p class="text-[11px] text-slate-500">${m.role} • <span class="font-semibold text-unal-700">${m.category}</span></p>
                    </div>
                    <div class="text-left sm:text-right">
                      <span class="px-2.5 py-1 rounded-md bg-unal-100 text-unal-900 font-bold font-mono text-xs">
                        ${m.totalHours.toFixed(1)} hrs dedicadas
                      </span>
                    </div>
                  </div>

                  <!-- Lista detallada de tareas realizadas -->
                  <div class="space-y-2">
                    <p class="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Actividades reportadas en el periodo:</p>
                    <div class="grid grid-cols-1 gap-2">
                      ${m.tasks.map(t => `
                        <div class="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
                          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span class="font-bold text-slate-800">
                              <span class="font-mono text-unal-800">[${t.projectCode}]</span> ${t.projectName} &mdash; <span class="text-slate-700 font-semibold">${t.activityName}</span>
                            </span>
                            <span class="text-[11px] font-mono text-slate-500">
                              ${t.date} &bull; <strong class="text-emerald-700">${t.hours} hrs</strong> &bull; <span class="font-bold text-slate-700">${t.progressReported}% avance</span>
                            </span>
                          </div>
                          
                          <p class="text-slate-700 italic bg-slate-50/60 p-2 rounded border border-slate-100 text-[11px]">
                            &ldquo;${t.notes}&rdquo;
                          </p>

                          ${(t.attachments && t.attachments.length > 0) ? `
                            <div class="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span class="text-[10px] font-bold text-slate-500">Anexos:</span>
                              ${t.attachments.map(att => `
                                <a href="${att.url || 'https://drive.google.com'}" target="_blank" class="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold hover:bg-emerald-100">
                                  <span>${att.name}</span>
                                </a>
                              `).join('')}
                            </div>
                          ` : ''}

                          ${t.reviewComments ? `
                            <p class="text-[10px] text-slate-500 italic">
                              Revisión técnica: &ldquo;${t.reviewComments}&rdquo;
                            </p>
                          ` : ''}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Institutional Signatures Footer -->
          <div class="pt-10 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs text-slate-600">
            <div class="space-y-1">
              <div class="w-48 border-b border-slate-400 mx-auto mb-1"></div>
              <p class="font-bold text-slate-900">Prof. Julio Esteban Colmenares Montañez, Ph.D.</p>
              <p class="text-[11px] text-slate-500">Director del Laboratorio de Geotecnia</p>
              <p class="text-[10px] text-unal-700 font-semibold">Universidad Nacional de Colombia</p>
            </div>

            <div class="space-y-1">
              <div class="w-48 border-b border-slate-400 mx-auto mb-1"></div>
              <p class="font-bold text-slate-900">Ing. Daniel Felipe Rodríguez Ramírez</p>
              <p class="text-[11px] text-slate-500">Coordinador de Laboratorio e Investigación</p>
              <p class="text-[10px] text-unal-700 font-semibold">Universidad Nacional de Colombia</p>
            </div>

            <div class="space-y-1">
              <div class="w-48 border-b border-slate-400 mx-auto mb-1"></div>
              <p class="font-bold text-slate-900">Ing. Edwin Alexander Prieto Saavedra</p>
              <p class="text-[11px] text-slate-500">Coordinador de Laboratorio y Operaciones</p>
              <p class="text-[10px] text-unal-700 font-semibold">Universidad Nacional de Colombia</p>
            </div>
          </div>

        </div>

      </div>
    `;

    container.querySelector('#select-report-week').addEventListener('change', (e) => {
      selectedWeek = Number(e.target.value);
      render();
    });

    container.querySelector('#btn-export-excel').addEventListener('click', () => {
      window.GeoReport.exportToExcel(selectedWeek, selectedYear);
    });

    container.querySelector('#btn-export-pdf').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      window.GeoReport.exportToPDF('institutional-report-document', selectedWeek, selectedYear, btn);
    });

    container.querySelector('#btn-print-report').addEventListener('click', () => {
      window.print();
    });

    container.querySelector('#btn-send-email-report').addEventListener('click', () => {
      openSendEmailModal(selectedWeek, selectedYear);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function openSendEmailModal(week, year) {
    const modalHost = document.getElementById('general-modal-container') || document.getElementById('quick-log-modal-container');
    if (!modalHost) return;

    const data = window.GeoReport.getWeeklyReportData(week, year);
    const members = (window.GeoStorage.getMembers() || []).filter(m => m && m.email);
    const savedPref = window.GeoStorage.getReportRecipientsPref ? window.GeoStorage.getReportRecipientsPref() : {
      to: 'jecolmenaresm@unal.edu.co',
      cc: 'dafrodriguezram@unal.edu.co, eaprietos@unal.edu.co, labgeotec_fibog@unal.edu.co',
      remember: true
    };

    modalHost.innerHTML = `
      <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div class="glass-card bg-white rounded-2xl shadow-2xl max-w-2xl w-full border-2 border-unal-400/40 overflow-hidden my-6">
          
          <!-- Encabezado Institucional -->
          <div class="bg-gradient-to-r from-unal-900 via-unal-800 to-unal-700 p-5 text-white flex items-center justify-between border-b-2 border-unal-400">
            <div class="flex items-center space-x-3">
              <img src="./Diseno/Escudo_color.png" alt="Escudo UNAL" class="h-10 w-auto object-contain bg-white/90 p-1 rounded-lg">
              <div>
                <h3 class="text-base sm:text-lg font-bold font-heading text-white">Enviar Informe Semanal por Correo</h3>
                <p class="text-xs text-unal-300">Semana No. ${week} (${data.dateRange}) • Selecciona los destinatarios de entrega</p>
              </div>
            </div>
            <button id="btn-close-email-modal" class="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <i data-lucide="x" class="w-6 h-6"></i>
            </button>
          </div>

          <!-- Formulario de Envío -->
          <form id="send-report-email-form" class="p-6 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
            
            <!-- Banner de Automatización Programada -->
            <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-1">
              <div class="flex items-center space-x-2 font-bold text-xs">
                <i data-lucide="clock" class="w-4 h-4 text-emerald-700 shrink-0"></i>
                <span>Envío Programado y Manual</span>
              </div>
              <p class="text-[11px] text-emerald-800 leading-relaxed">
                Este informe se envía automáticamente todos los viernes a las 17:00. Usa este módulo para remitir el informe en cualquier momento eligiendo libremente los destinatarios requeridos.
              </p>
            </div>

            <!-- 1. SELECCIÓN DE DESTINATARIO PRINCIPAL (PARA / TO) -->
            <div class="space-y-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div class="flex items-center justify-between">
                <label class="block font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                  1. Destinatario Principal (Para / To) <span class="text-red-500">*</span>
                </label>
                <span class="text-[10px] text-slate-500 font-medium">Receptor oficial del informe</span>
              </div>

              <!-- Quick role buttons -->
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="text-[10px] font-bold text-slate-500 uppercase mr-1">Rápido:</span>
                <button type="button" class="btn-quick-to px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all" data-email="jecolmenaresm@unal.edu.co">
                  👑 Director (Prof. Colmenares)
                </button>
                <button type="button" class="btn-quick-to px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all" data-email="dafrodriguezram@unal.edu.co">
                  🔬 Coord. Daniel
                </button>
                <button type="button" class="btn-quick-to px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all" data-email="eaprietos@unal.edu.co">
                  ⚙️ Coord. Edwin
                </button>
                <button type="button" class="btn-quick-to px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all" data-email="labgeotec_fibog@unal.edu.co">
                  🏛️ Lab Geotecnia
                </button>
              </div>

              <!-- Selector desplegable de integrantes y campo manual -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label class="block text-[10px] font-semibold text-slate-500 mb-1">Elegir de la lista:</label>
                  <select id="select-primary-recipient" class="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-unal-400">
                    <option value="">-- Seleccionar integrante o rol --</option>
                    <optgroup label="Dirección y Coordinación">
                      <option value="jecolmenaresm@unal.edu.co">Prof. Julio Esteban Colmenares (Director)</option>
                      <option value="dafrodriguezram@unal.edu.co">Ing. Daniel Felipe Rodríguez (Coordinador)</option>
                      <option value="eaprietos@unal.edu.co">Ing. Edwin Alexander Prieto (Coordinador)</option>
                      <option value="labgeotec_fibog@unal.edu.co">Laboratorio de Geotecnia (Institucional)</option>
                    </optgroup>
                    <optgroup label="Equipo e Investigadores del Laboratorio">
                      ${members.map(m => `
                        <option value="${m.email}">${m.name} (${m.role})</option>
                      `).join('')}
                    </optgroup>
                    <option value="__custom__">✏️ Escribir otro correo a mano...</option>
                  </select>
                </div>

                <div>
                  <label class="block text-[10px] font-semibold text-slate-500 mb-1">Correo principal asignado (o editar a mano):</label>
                  <input type="email" id="email-to-director" required value="${savedPref.to || 'jecolmenaresm@unal.edu.co'}" placeholder="ejemplo@unal.edu.co" class="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-unal-400">
                </div>
              </div>
            </div>

            <!-- 2. SELECCIÓN DE DESTINATARIOS CON COPIA (CC) -->
            <div class="space-y-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div class="flex items-center justify-between">
                <label class="block font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                  2. Con Copia (CC: Coordinadores, Personal o Institucional)
                </label>
                <span class="text-[10px] text-slate-500 font-medium">Receptores en copia informativa</span>
              </div>

              <!-- Quick action chips for CC -->
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="text-[10px] font-bold text-slate-500 uppercase mr-1">Añadir grupo:</span>
                <button type="button" id="btn-cc-coordinators" class="px-2 py-1 rounded-lg text-[11px] font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-all">
                  + Coordinadores
                </button>
                <button type="button" id="btn-cc-lab" class="px-2 py-1 rounded-lg text-[11px] font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-all">
                  + Lab Institucional
                </button>
                <button type="button" id="btn-cc-director" class="px-2 py-1 rounded-lg text-[11px] font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-all">
                  + Director
                </button>
                <button type="button" id="btn-cc-all-members" class="px-2 py-1 rounded-lg text-[11px] font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-all">
                  + Todos los Integrantes (${members.length})
                </button>
                <button type="button" id="btn-cc-clear" class="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-all ml-auto">
                  Limpiar CC
                </button>
              </div>

              <!-- Selector individual para añadir integrantes a CC -->
              <div class="flex items-center gap-2 pt-1">
                <select id="select-cc-add-member" class="flex-1 rounded-xl border border-slate-300 bg-white p-2 text-xs font-medium text-slate-800 outline-none focus:border-unal-400">
                  <option value="">-- Añadir integrante específico a CC --</option>
                  <optgroup label="Integrantes del Laboratorio">
                    ${members.map(m => `
                      <option value="${m.email}">${m.name} (${m.email})</option>
                    `).join('')}
                  </optgroup>
                  <optgroup label="Dirección e Institucional">
                    <option value="jecolmenaresm@unal.edu.co">Prof. Julio Esteban Colmenares (Director)</option>
                    <option value="dafrodriguezram@unal.edu.co">Ing. Daniel Felipe Rodríguez (Coordinador)</option>
                    <option value="eaprietos@unal.edu.co">Ing. Edwin Alexander Prieto (Coordinador)</option>
                    <option value="labgeotec_fibog@unal.edu.co">Laboratorio Institucional</option>
                  </optgroup>
                </select>
                <button type="button" id="btn-add-member-to-cc" class="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs shrink-0 transition-all">
                  + Añadir a CC
                </button>
              </div>

              <!-- Badges visuales de correos en CC con botón eliminar -->
              <div>
                <label class="block text-[10px] font-semibold text-slate-500 mb-1">Destinatarios seleccionados en copia:</label>
                <div id="cc-badges-container" class="flex flex-wrap gap-1.5 p-2 bg-white rounded-xl border border-slate-200 min-h-[36px]">
                  <!-- Se actualiza dinámicamente -->
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-semibold text-slate-500 mb-1">Lista completa de correos CC (separados por coma, editable a mano):</label>
                <input type="text" id="email-cc-coordinators" value="${savedPref.cc || 'dafrodriguezram@unal.edu.co, eaprietos@unal.edu.co, labgeotec_fibog@unal.edu.co'}" placeholder="correo1@unal.edu.co, correo2@unal.edu.co" class="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-700 outline-none focus:border-unal-400">
              </div>
            </div>

            <!-- 3. ASUNTO DEL CORREO -->
            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Asunto del Correo</label>
              <input type="text" id="email-subject" value="[Informe Semanal] Lab. Geotecnia UNAL - Semana ${week} (${data.dateRange})" class="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-unal-400">
            </div>

            <!-- 4. NOTAS U OBSERVACIONES -->
            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Notas u Observaciones de Coordinación (Opcional)</label>
              <textarea id="email-notes" rows="3" placeholder="Ej: Se remite el consolidado de avances y ensayos realizados durante la semana..." class="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-700 outline-none focus:border-unal-400"></textarea>
            </div>

            <!-- 5. RECORDAR SELECCIÓN -->
            <div class="flex items-center space-x-2 pt-1">
              <input type="checkbox" id="check-remember-recipients" ${savedPref.remember !== false ? 'checked' : ''} class="w-4 h-4 rounded text-unal-800 border-slate-300 focus:ring-unal-400 cursor-pointer">
              <label for="check-remember-recipients" class="text-xs text-slate-700 font-medium cursor-pointer">
                Recordar estos destinatarios para los próximos informes
              </label>
            </div>

            <div id="email-send-status" class="hidden p-3 rounded-xl text-xs font-semibold"></div>

            <div class="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button type="button" id="btn-cancel-email-modal" class="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800">Cancelar</button>
              <button type="submit" id="btn-submit-send-email" class="px-5 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-xs sm:text-sm shadow-md flex items-center space-x-2 transition-all">
                <i data-lucide="send" class="w-4 h-4 text-unal-900"></i>
                <span>Enviar Correo Ahora</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    modalHost.querySelector('#btn-close-email-modal').addEventListener('click', () => modalHost.innerHTML = '');
    modalHost.querySelector('#btn-cancel-email-modal').addEventListener('click', () => modalHost.innerHTML = '');

    const inputTo = modalHost.querySelector('#email-to-director');
    const selectTo = modalHost.querySelector('#select-primary-recipient');
    const quickToBtns = modalHost.querySelectorAll('.btn-quick-to');

    function updateQuickToStyles(currentEmail) {
      const emailClean = (currentEmail || '').trim().toLowerCase();
      quickToBtns.forEach(btn => {
        if (btn.getAttribute('data-email').toLowerCase() === emailClean) {
          btn.className = 'btn-quick-to px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all bg-unal-100 border-unal-400 text-unal-900 shadow-sm';
        } else {
          btn.className = 'btn-quick-to px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all bg-white border-slate-300 text-slate-700 hover:bg-slate-100';
        }
      });

      // Synchronize dropdown
      let matched = false;
      Array.from(selectTo.options).forEach(opt => {
        if (opt.value && opt.value.toLowerCase() === emailClean) {
          selectTo.value = opt.value;
          matched = true;
        }
      });
      if (!matched && emailClean) {
        selectTo.value = '__custom__';
      }
    }

    quickToBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.getAttribute('data-email');
        inputTo.value = email;
        updateQuickToStyles(email);
      });
    });

    selectTo.addEventListener('change', () => {
      if (selectTo.value === '__custom__') {
        inputTo.focus();
        inputTo.select();
      } else if (selectTo.value) {
        inputTo.value = selectTo.value;
        updateQuickToStyles(selectTo.value);
      }
    });

    inputTo.addEventListener('input', () => {
      updateQuickToStyles(inputTo.value);
    });

    updateQuickToStyles(inputTo.value);

    // CC Management and synchronization
    const inputCc = modalHost.querySelector('#email-cc-coordinators');
    const ccBadgesContainer = modalHost.querySelector('#cc-badges-container');

    function getCcList() {
      return inputCc.value
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);
    }

    function setCcList(list) {
      const unique = [];
      const seen = new Set();
      list.forEach(e => {
        const lower = e.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          unique.push(e);
        }
      });
      inputCc.value = unique.join(', ');
      renderCcBadges();
    }

    function renderCcBadges() {
      const list = getCcList();
      if (list.length === 0) {
        ccBadgesContainer.innerHTML = '<span class="text-[11px] text-slate-400 italic py-0.5">Ningún destinatario en copia (CC vacío)</span>';
        return;
      }
      ccBadgesContainer.innerHTML = list.map(email => `
        <span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 text-[11px] font-semibold">
          <span>${email}</span>
          <button type="button" class="btn-remove-cc text-slate-400 hover:text-red-700 ml-1 font-bold text-xs leading-none" data-email="${email}">&times;</button>
        </span>
      `).join('');

      ccBadgesContainer.querySelectorAll('.btn-remove-cc').forEach(btn => {
        btn.addEventListener('click', () => {
          const toRemove = btn.getAttribute('data-email').toLowerCase();
          const current = getCcList().filter(e => e.toLowerCase() !== toRemove);
          setCcList(current);
        });
      });
    }

    inputCc.addEventListener('input', renderCcBadges);
    renderCcBadges();

    // Preset group buttons for CC
    modalHost.querySelector('#btn-cc-coordinators').addEventListener('click', () => {
      const current = getCcList();
      ['dafrodriguezram@unal.edu.co', 'eaprietos@unal.edu.co'].forEach(e => current.push(e));
      setCcList(current);
    });

    modalHost.querySelector('#btn-cc-lab').addEventListener('click', () => {
      const current = getCcList();
      current.push('labgeotec_fibog@unal.edu.co');
      setCcList(current);
    });

    modalHost.querySelector('#btn-cc-director').addEventListener('click', () => {
      const current = getCcList();
      current.push('jecolmenaresm@unal.edu.co');
      setCcList(current);
    });

    modalHost.querySelector('#btn-cc-all-members').addEventListener('click', () => {
      const current = getCcList();
      members.forEach(m => {
        if (m.email) current.push(m.email);
      });
      setCcList(current);
    });

    modalHost.querySelector('#btn-cc-clear').addEventListener('click', () => {
      setCcList([]);
    });

    // Individual member addition to CC
    const selectCcAdd = modalHost.querySelector('#select-cc-add-member');
    modalHost.querySelector('#btn-add-member-to-cc').addEventListener('click', () => {
      if (selectCcAdd.value) {
        const current = getCcList();
        current.push(selectCcAdd.value);
        setCcList(current);
        selectCcAdd.value = '';
      }
    });

    const form = modalHost.querySelector('#send-report-email-form');
    const submitBtn = modalHost.querySelector('#btn-submit-send-email');
    const statusDiv = modalHost.querySelector('#email-send-status');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const to = inputTo.value.trim();
      const cc = inputCc.value.trim();
      const subject = modalHost.querySelector('#email-subject').value.trim();
      const customNotes = modalHost.querySelector('#email-notes').value.trim();
      const remember = modalHost.querySelector('#check-remember-recipients').checked;

      if (!to) {
        alert('Por favor especifica un destinatario principal.');
        inputTo.focus();
        return;
      }

      if (remember && window.GeoStorage.saveReportRecipientsPref) {
        window.GeoStorage.saveReportRecipientsPref({ to, cc, remember: true });
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Enviando Informe...</span>`;
      if (window.lucide) window.lucide.createIcons();

      const result = await window.GeoReport.sendWeeklyReportEmail(week, year, {
        to,
        cc,
        subject,
        customNotes
      });

      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i data-lucide="send" class="w-4 h-4"></i><span>Enviar Correo Ahora</span>`;
      if (window.lucide) window.lucide.createIcons();

      statusDiv.classList.remove('hidden');
      if (result && result.success) {
        statusDiv.className = 'p-3 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center space-x-2';
        statusDiv.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-emerald-700 shrink-0"></i><span>${result.message || '¡Informe enviado exitosamente!'}</span>`;
        if (typeof confetti === 'function') {
          confetti({ particleCount: 70, spread: 55, origin: { y: 0.6 } });
        }
        setTimeout(() => {
          modalHost.innerHTML = '';
        }, 2500);
      } else {
        statusDiv.className = 'p-3 rounded-xl bg-red-100 text-unal-red border border-red-300 flex items-center space-x-2';
        statusDiv.innerHTML = `<i data-lucide="alert-triangle" class="w-4 h-4 text-unal-red shrink-0"></i><span>${result.message || 'No se pudo enviar el correo. Verifica la URL del Webhook en Configuración.'}</span>`;
      }
      if (window.lucide) window.lucide.createIcons();
    });
  }

  render();
};

