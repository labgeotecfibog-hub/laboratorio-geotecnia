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
              <span>Enviar al Director por Correo</span>
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

          <!-- Section 4: Aportes por Integrante -->
          <div class="space-y-3 pt-2">
            <h2 class="text-sm font-bold font-heading uppercase tracking-wider text-unal-900 border-b-2 border-unal-700 pb-1.5">
              3. Resumen de Aportes por Integrante del Laboratorio
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              ${reportData.memberContributions.map(m => `
                <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span class="font-bold text-slate-900 text-sm block">${m.name}</span>
                  <p class="text-[11px] text-slate-500">${m.role} • <span class="font-semibold text-unal-700">${m.category}</span></p>
                  <div class="flex items-center justify-between pt-1.5 border-t border-slate-200 text-[11px]">
                    <span class="font-semibold text-unal-800">${m.totalHours} hrs dedicadas</span>
                    <span class="text-slate-600">${m.activitiesCount} actividades</span>
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
    const modalHost = document.getElementById('quick-log-modal-container');
    if (!modalHost) return;

    const data = window.GeoReport.getWeeklyReportData(week, year);

    modalHost.innerHTML = `
      <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div class="glass-card bg-white rounded-2xl shadow-2xl max-w-xl w-full border-2 border-unal-400/40 overflow-hidden">
          
          <!-- Encabezado Institucional -->
          <div class="bg-gradient-to-r from-unal-900 via-unal-800 to-unal-700 p-5 text-white flex items-center justify-between border-b-2 border-unal-400">
            <div class="flex items-center space-x-3">
              <img src="./Diseno/Escudo_color.png" alt="Escudo UNAL" class="h-10 w-auto object-contain bg-white/90 p-1 rounded-lg">
              <div>
                <h3 class="text-base sm:text-lg font-bold font-heading text-white">Enviar Informe al Director del Laboratorio</h3>
                <p class="text-xs text-unal-300">Semana No. ${week} (${data.dateRange}) • UNAL Sede Bogotá</p>
              </div>
            </div>
            <button id="btn-close-email-modal" class="text-slate-300 hover:text-white p-1 rounded-lg">
              <i data-lucide="x" class="w-6 h-6"></i>
            </button>
          </div>

          <!-- Formulario de Envío -->
          <form id="send-report-email-form" class="p-6 space-y-4 text-xs">
            
            <!-- Banner de Automatización Programada -->
            <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-1">
              <div class="flex items-center space-x-2 font-bold text-xs">
                <i data-lucide="clock" class="w-4 h-4 text-emerald-700 shrink-0"></i>
                <span>Envío Automático Semanal Programado</span>
              </div>
              <p class="text-[11px] text-emerald-800 leading-relaxed">
                Este informe está configurado para transmitirse <strong>automáticamente todos los viernes a las 17:00 (5:00 PM)</strong> mediante el activador de Google Apps Script. Puedes usar este botón para enviarlo de inmediato de forma manual o previa.
              </p>
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Destinatario Principal (Director) *</label>
              <input type="email" id="email-to-director" required value="jecolmenaresm@unal.edu.co" class="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-unal-400">
              <span class="text-[10px] text-slate-500 font-medium">Prof. Julio Esteban Colmenares Montañez, Ph.D. • Director</span>
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Con Copia (CC: Coordinadores e Institucional)</label>
              <input type="text" id="email-cc-coordinators" value="dfrodriguezr@unal.edu.co, eaprietos@unal.edu.co, labgeotec_fibog@unal.edu.co" class="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-700 outline-none focus:border-unal-400">
              <span class="text-[10px] text-slate-500 font-medium">Ing. Daniel Felipe Rodríguez R., Ing. Edwin Alexander Prieto S., Laboratorio de Geotecnia</span>
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Asunto del Correo</label>
              <input type="text" id="email-subject" value="[Informe Semanal] Lab. Geotecnia UNAL - Semana ${week} (${data.dateRange})" class="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-unal-400">
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Notas u Observaciones de Coordinación (Opcional)</label>
              <textarea id="email-notes" rows="3" placeholder="Ej: Profesor Julio, se culminaron los ensayos de anillo vial y se remitieron los planos a Pinzuar para la cámara de succión..." class="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-700 outline-none focus:border-unal-400"></textarea>
            </div>

            <div id="email-send-status" class="hidden p-3 rounded-xl text-xs font-semibold"></div>

            <div class="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button type="button" id="btn-cancel-email-modal" class="px-4 py-2 font-semibold text-slate-600">Cancelar</button>
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

    const form = modalHost.querySelector('#send-report-email-form');
    const submitBtn = modalHost.querySelector('#btn-submit-send-email');
    const statusDiv = modalHost.querySelector('#email-send-status');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const to = modalHost.querySelector('#email-to-director').value.trim();
      const cc = modalHost.querySelector('#email-cc-coordinators').value.trim();
      const subject = modalHost.querySelector('#email-subject').value.trim();
      const customNotes = modalHost.querySelector('#email-notes').value.trim();

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Enviando al Director...</span>`;
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
        statusDiv.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-emerald-700 shrink-0"></i><span>${result.message || '¡Informe enviado exitosamente al Director!'}</span>`;
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

