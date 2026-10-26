/**
 * Componente: Vista de Tareas Recurrentes (Aseo, Orden, Mantenimiento Rutinario)
 * Identidad Institucional: Universidad Nacional de Colombia • Laboratorio de Geotecnia
 * 
 * Características clave:
 * - No manejan porcentaje acumulado de completado (0-100%) porque se repiten cíclicamente semana a semana.
 * - Estados por ciclo: "Pendiente", "En Proceso", "Cumplida".
 * - Registro histórico de ejecuciones por semana con observaciones y responsable.
 * - Abierto para que los estudiantes auxiliares reporten cumplimiento; gestión técnica para revisores.
 */

window.GeoComponents = window.GeoComponents || {};

window.GeoComponents.renderRecurringTasksView = function(container) {
  if (!container) return;

  const storage = window.GeoStorage;
  const isReviewer = window.GeoAuth ? window.GeoAuth.isReviewer() : false;
  const currentUser = isReviewer ? window.GeoAuth.getCurrentUser() : null;

  let activeCategory = 'all';
  let activeStatus = 'all';
  let searchTerm = '';
  let selectedTaskForLog = null;
  let editingTask = null;
  let isEditModalOpen = false;
  let isLogModalOpen = false;

  function getFilteredTasks() {
    let tasks = storage.getRecurringTasks();

    if (activeCategory !== 'all') {
      tasks = tasks.filter(t => t.category === activeCategory);
    }

    if (activeStatus !== 'all') {
      tasks = tasks.filter(t => t.status === activeStatus);
    }

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      tasks = tasks.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.area && t.area.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    return tasks;
  }

  function render() {
    const allTasks = storage.getRecurringTasks();
    const filteredTasks = getFilteredTasks();
    const members = storage.getMembers().filter(m => m.active);

    const completedCount = allTasks.filter(t => t.status === 'Cumplida').length;
    const pendingCount = allTasks.filter(t => t.status === 'Pendiente').length;
    const inProgressCount = allTasks.filter(t => t.status === 'En Proceso').length;
    const totalCount = allTasks.length;
    const weeklyRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const currentWeek = window.GeoUtils ? window.GeoUtils.getISOWeekNumber(new Date()) : 43;
    const weekRange = window.GeoUtils ? window.GeoUtils.getWeekDateRange(currentWeek) : { label: 'Semana Actual' };

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Header Principal Institucional -->
        <div class="bg-gradient-to-r from-unal-800 via-unal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-unal-600/30">
          <div class="absolute right-0 top-0 bottom-0 w-1/3 bg-cover bg-right opacity-10 pointer-events-none" style="background-image: url('./Diseno/Fondo_circulos.png');"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2 max-w-2xl">
              <div class="flex items-center space-x-2">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-unal-400/20 text-unal-300 border border-unal-400/40 flex items-center space-x-1.5">
                  <i data-lucide="repeat" class="w-3.5 h-3.5 text-unal-400"></i>
                  <span>Ciclo Semanal #${currentWeek} • ${weekRange.label}</span>
                </span>
                <span class="text-xs text-slate-300 font-mono">Sin porcentaje acumulativo (Recurrentes)</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                Rutinas Operativas, Aseo y Orden del Laboratorio
              </h1>
              <p class="text-slate-300 text-sm leading-relaxed">
                Control semanal del protocolo 5S, mantenimiento preventivo de equipos y alistamiento de espacios en el Laboratorio de Geotecnia (Edificio 407). Las tareas se renuevan periódicamente y quedan registradas con fecha y auxiliar responsable.
              </p>
            </div>

            <!-- Botones de Acción -->
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              ${isReviewer ? `
                <button id="btn-new-recurring-task" class="px-4 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center space-x-1.5">
                  <i data-lucide="plus" class="w-4 h-4"></i>
                  <span>Nueva Rutina</span>
                </button>
                <button id="btn-reset-weekly-cycle" title="Reinicia el estado de todas las rutinas a 'Pendiente' para la nueva semana" class="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold border border-white/20 transition-all flex items-center space-x-1.5">
                  <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-unal-300"></i>
                  <span>Nuevo Ciclo Semanal</span>
                </button>
              ` : `
                <div class="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/10 text-xs text-slate-200">
                  <div class="font-bold text-unal-300 flex items-center space-x-1 mb-0.5">
                    <i data-lucide="check-circle" class="w-3.5 h-3.5 text-unal-400"></i>
                    <span>Modo Auxiliares Activo</span>
                  </div>
                  <span>Puedes marcar las tareas que ejecutes en tu turno de laboratorio.</span>
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Indicadores de Cumplimiento Semanal (KPIs) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- KPI 1: Cumplimiento de la Semana -->
          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Cumplimiento Semanal</span>
              <span class="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <i data-lucide="award" class="w-4 h-4"></i>
              </span>
            </div>
            <div class="flex items-baseline space-x-2">
              <span class="text-3xl font-extrabold text-slate-900 font-heading">${weeklyRate}%</span>
              <span class="text-xs text-slate-500">(${completedCount} de ${totalCount} cumplidas)</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div class="bg-emerald-500 h-2 rounded-full transition-all duration-500" style="width: ${weeklyRate}%"></div>
            </div>
          </div>

          <!-- KPI 2: Tareas Pendientes -->
          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Pendientes esta Semana</span>
              <span class="p-2 rounded-xl bg-amber-50 text-amber-700">
                <i data-lucide="clock" class="w-4 h-4"></i>
              </span>
            </div>
            <div class="flex items-baseline space-x-2">
              <span class="text-3xl font-extrabold text-amber-600 font-heading">${pendingCount}</span>
              <span class="text-xs text-slate-500">rutinas por ejecutar</span>
            </div>
            <p class="text-[11px] text-slate-400">Prioridad para turnos de cierre y mantenimiento</p>
          </div>

          <!-- KPI 3: En Proceso -->
          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">En Ejecución</span>
              <span class="p-2 rounded-xl bg-blue-50 text-blue-700">
                <i data-lucide="play-circle" class="w-4 h-4"></i>
              </span>
            </div>
            <div class="flex items-baseline space-x-2">
              <span class="text-3xl font-extrabold text-blue-600 font-heading">${inProgressCount}</span>
              <span class="text-xs text-slate-500">en turno actual</span>
            </div>
            <p class="text-[11px] text-slate-400">Actividades iniciadas en el laboratorio</p>
          </div>

          <!-- KPI 4: Total de Rutinas Parametrizadas -->
          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Catálogo de Rutinas</span>
              <span class="p-2 rounded-xl bg-slate-100 text-slate-700">
                <i data-lucide="layers" class="w-4 h-4"></i>
              </span>
            </div>
            <div class="flex items-baseline space-x-2">
              <span class="text-3xl font-extrabold text-slate-800 font-heading">${totalCount}</span>
              <span class="text-xs text-slate-500">rutinas estándar</span>
            </div>
            <p class="text-[11px] text-slate-400">Protocolos 5S, Tamices, Balanzas y Seguridad</p>
          </div>

        </div>

        <!-- Filtros y Búsqueda -->
        <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <!-- Tabs de Categoría -->
            <div class="flex flex-wrap items-center gap-1.5" id="category-filter-tabs">
              <button class="cat-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeCategory === 'all' ? 'bg-unal-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-cat="all">
                Todas (${allTasks.length})
              </button>
              <button class="cat-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeCategory === 'Aseo y Orden' ? 'bg-unal-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-cat="Aseo y Orden">
                🧹 Aseo y Orden
              </button>
              <button class="cat-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeCategory === 'Mantenimiento y Equipos' ? 'bg-unal-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-cat="Mantenimiento y Equipos">
                ⚙️ Mantenimiento
              </button>
              <button class="cat-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeCategory === 'Calibración y Verificación' ? 'bg-unal-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-cat="Calibración y Verificación">
                ⚖️ Calibración
              </button>
              <button class="cat-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeCategory === 'Seguridad y Bioseguridad' ? 'bg-unal-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-cat="Seguridad y Bioseguridad">
                🦺 Seguridad
              </button>
              <button class="cat-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeCategory === 'Gestión de Muestras y Residuos' ? 'bg-unal-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-cat="Gestión de Muestras y Residuos">
                📦 Muestras
              </button>
            </div>

            <!-- Filtro por Estado y Búsqueda -->
            <div class="flex flex-wrap items-center gap-2">
              <select id="recurring-status-select" class="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-unal-400 bg-white">
                <option value="all" ${activeStatus === 'all' ? 'selected' : ''}>Todos los Estados</option>
                <option value="Pendiente" ${activeStatus === 'Pendiente' ? 'selected' : ''}>⏳ Pendientes esta semana</option>
                <option value="En Proceso" ${activeStatus === 'En Proceso' ? 'selected' : ''}>🔵 En Ejecución</option>
                <option value="Cumplida" ${activeStatus === 'Cumplida' ? 'selected' : ''}>✅ Cumplidas esta semana</option>
              </select>

              <div class="relative flex-1 sm:w-64">
                <i data-lucide="search" class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input type="text" id="recurring-search-input" value="${searchTerm}" placeholder="Buscar rutina o área..." class="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-unal-400">
              </div>
            </div>

          </div>
        </div>

        <!-- Grid de Tarjetas de Rutinas Recurrentes -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          ${filteredTasks.length === 0 ? `
            <div class="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <div class="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <i data-lucide="clipboard-list" class="w-6 h-6"></i>
              </div>
              <h3 class="font-bold text-slate-700 text-base">No se encontraron tareas recurrentes</h3>
              <p class="text-xs text-slate-400 max-w-md mx-auto">No hay rutinas que coincidan con la categoría o término de búsqueda seleccionado.</p>
            </div>
          ` : filteredTasks.map(task => {
            const assignedMembers = (task.assignedTo || []).map(id => members.find(m => m.id === id)).filter(Boolean);
            
            // Colores temáticos según categoría
            let catBadge = 'bg-slate-100 text-slate-700 border-slate-200';
            let catIcon = 'layers';
            if (task.category === 'Aseo y Orden') {
              catBadge = 'bg-teal-50 text-teal-800 border-teal-200';
              catIcon = 'sparkles';
            } else if (task.category === 'Mantenimiento y Equipos') {
              catBadge = 'bg-blue-50 text-blue-800 border-blue-200';
              catIcon = 'wrench';
            } else if (task.category === 'Calibración y Verificación') {
              catBadge = 'bg-purple-50 text-purple-800 border-purple-200';
              catIcon = 'scale';
            } else if (task.category === 'Seguridad y Bioseguridad') {
              catBadge = 'bg-amber-50 text-amber-800 border-amber-200';
              catIcon = 'shield-alert';
            } else if (task.category === 'Gestión de Muestras y Residuos') {
              catBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
              catIcon = 'box';
            }

            // Estado de la semana
            let statusBadge = '';
            let cardBorder = 'border-slate-200';
            if (task.status === 'Cumplida') {
              statusBadge = `
                <span class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-600"></i>
                  <span>Cumplida esta Semana</span>
                </span>
              `;
              cardBorder = 'border-emerald-300 bg-gradient-to-b from-white to-emerald-50/20';
            } else if (task.status === 'En Proceso') {
              statusBadge = `
                <span class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                  <i data-lucide="loader" class="w-3.5 h-3.5 text-blue-600 animate-spin"></i>
                  <span>En Ejecución</span>
                </span>
              `;
              cardBorder = 'border-blue-300';
            } else {
              statusBadge = `
                <span class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-600"></i>
                  <span>Pendiente esta Semana</span>
                </span>
              `;
              cardBorder = 'border-slate-200 hover:border-slate-300';
            }

            return `
              <div class="bg-white rounded-3xl p-6 border ${cardBorder} shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5">
                
                <!-- Cabecera de la Tarjeta -->
                <div class="space-y-3">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold border ${catBadge} flex items-center space-x-1">
                        <i data-lucide="${catIcon}" class="w-3 h-3"></i>
                        <span>${task.category}</span>
                      </span>
                      <span class="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 flex items-center space-x-1" title="Frecuencia">
                        <i data-lucide="calendar" class="w-3 h-3 text-slate-400"></i>
                        <span>${task.frequency}</span>
                      </span>
                    </div>

                    <div class="shrink-0">
                      ${statusBadge}
                    </div>
                  </div>

                  <div>
                    <h3 class="text-base sm:text-lg font-extrabold text-slate-900 font-heading leading-snug">
                      ${task.title}
                    </h3>
                    <div class="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                      <i data-lucide="map-pin" class="w-3.5 h-3.5 text-unal-400 shrink-0"></i>
                      <span class="font-medium">${task.area || 'Laboratorio de Geotecnia'}</span>
                    </div>
                  </div>

                  <p class="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    ${task.description}
                  </p>
                </div>

                <!-- Personal Asignado & Último Registro -->
                <div class="space-y-3 pt-2 border-t border-slate-100">
                  
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div class="flex items-center space-x-2">
                      <span class="text-slate-400 font-medium">Asignado a:</span>
                      <div class="flex -space-x-1.5 overflow-hidden">
                        ${assignedMembers.map(m => window.GeoUtils.renderMemberAvatar(m, 'sm')).join('')}
                      </div>
                      <span class="text-slate-700 font-semibold truncate max-w-[200px]" title="${assignedMembers.map(m => m.name).join(', ')}">
                        ${assignedMembers.map(m => m.initials || m.name.split(' ')[0]).join(', ') || 'Todo el equipo'}
                      </span>
                    </div>

                    ${task.lastCompletedDate ? `
                      <span class="text-[11px] text-slate-500 font-mono">
                        Última: ${window.GeoUtils ? window.GeoUtils.formatDateCO(task.lastCompletedDate) : task.lastCompletedDate}
                      </span>
                    ` : `
                      <span class="text-[11px] text-amber-600 font-medium">Sin ejecuciones previas</span>
                    `}
                  </div>

                  ${task.lastNotes ? `
                    <div class="bg-emerald-50/60 border border-emerald-200/60 p-2.5 rounded-xl text-[11px] text-emerald-900 space-y-0.5">
                      <div class="font-bold flex items-center space-x-1 text-emerald-800">
                        <i data-lucide="check" class="w-3 h-3 text-emerald-600"></i>
                        <span>Reportado por: ${task.lastCompletedByName || 'Auxiliar'}</span>
                      </div>
                      <p class="italic text-emerald-950">"${task.lastNotes}"</p>
                    </div>
                  ` : ''}

                  <!-- Botones de Acción de la Fila -->
                  <div class="flex items-center justify-between gap-2 pt-2">
                    <button class="btn-log-task text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${task.status === 'Cumplida' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-unal-400 hover:bg-unal-300 text-unal-900 shadow-sm'}" data-task-id="${task.id}">
                      <i data-lucide="${task.status === 'Cumplida' ? 'edit-3' : 'check-circle'}" class="w-4 h-4"></i>
                      <span>${task.status === 'Cumplida' ? 'Actualizar Reporte' : 'Marcar como Cumplida'}</span>
                    </button>

                    <div class="flex items-center space-x-1">
                      ${isReviewer ? `
                        <button class="btn-edit-task p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all" title="Editar rutina" data-task-id="${task.id}">
                          <i data-lucide="settings" class="w-4 h-4"></i>
                        </button>
                        <button class="btn-delete-task p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Eliminar rutina" data-task-id="${task.id}">
                          <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                      ` : ''}
                    </div>
                  </div>

                </div>

              </div>
            `;
          }).join('')}
        </div>

      </div>

      <!-- Modal de Registro de Ejecución / Cumplimiento -->
      <div id="modal-log-recurring" class="${isLogModalOpen ? 'fixed' : 'hidden'} inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        ${selectedTaskForLog ? `
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-unal-500">Registro de Cumplimiento</span>
                <h3 class="text-lg font-extrabold text-slate-900 font-heading">
                  ${selectedTaskForLog.title}
                </h3>
              </div>
              <button id="btn-close-log-modal" class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <form id="form-log-recurring" class="space-y-4">
              
              <!-- Responsable que lo realizó -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Auxiliar que ejecutó la tarea *</label>
                <select id="log-member-id" required class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-unal-400 bg-white">
                  ${members.map(m => `
                    <option value="${m.id}" ${(selectedTaskForLog.assignedTo && selectedTaskForLog.assignedTo.includes(m.id)) ? 'selected' : ''}>
                      ${m.name} (${m.role})
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- Fecha de Ejecución -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Fecha de Realización *</label>
                <input type="date" id="log-date" required value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-unal-400">
              </div>

              <!-- Notas / Observaciones del Estado del Laboratorio -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Observaciones y Estado del Área *</label>
                <textarea id="log-notes" rows="3" required placeholder="Ej: Mesas limpiadas con desinfectante, pisos trapeados y mallas de tamices guardadas en su estante..." class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">${selectedTaskForLog.lastNotes || ''}</textarea>
              </div>

              <!-- Enlace Opcional a Evidencia en Drive / Fotografía -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Enlace a Evidencia Fotográfica / Drive (Opcional)</label>
                <div class="relative">
                  <i data-lucide="link" class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input type="url" id="log-evidence-url" placeholder="https://drive.google.com/..." class="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">
                </div>
              </div>

              <!-- Botones de Acción -->
              <div class="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" id="btn-cancel-log-modal" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">
                  Cancelar
                </button>
                <button type="submit" class="px-5 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5">
                  <i data-lucide="check" class="w-4 h-4"></i>
                  <span>Confirmar Cumplimiento</span>
                </button>
              </div>

            </form>

          </div>
        ` : ''}
      </div>

      <!-- Modal de Creación / Edición de Rutina (Revisores) -->
      <div id="modal-edit-recurring" class="${isEditModalOpen ? 'fixed' : 'hidden'} inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-unal-500">Gestión Institucional de Rutinas</span>
              <h3 class="text-lg font-extrabold text-slate-900 font-heading">
                ${editingTask && editingTask.id ? 'Editar Tarea Recurrente' : 'Nueva Tarea Recurrente'}
              </h3>
            </div>
            <button id="btn-close-edit-modal" class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="form-edit-recurring" class="space-y-4">
            
            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-700">Título de la Rutina *</label>
              <input type="text" id="edit-title" required value="${editingTask ? editingTask.title || '' : ''}" placeholder="Ej: Calibración y verificación de balanzas analíticas..." class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Categoría *</label>
                <select id="edit-category" required class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-unal-400">
                  <option value="Aseo y Orden" ${editingTask && editingTask.category === 'Aseo y Orden' ? 'selected' : ''}>🧹 Aseo y Orden</option>
                  <option value="Mantenimiento y Equipos" ${editingTask && editingTask.category === 'Mantenimiento y Equipos' ? 'selected' : ''}>⚙️ Mantenimiento y Equipos</option>
                  <option value="Calibración y Verificación" ${editingTask && editingTask.category === 'Calibración y Verificación' ? 'selected' : ''}>⚖️ Calibración y Verificación</option>
                  <option value="Seguridad y Bioseguridad" ${editingTask && editingTask.category === 'Seguridad y Bioseguridad' ? 'selected' : ''}>🦺 Seguridad y Bioseguridad</option>
                  <option value="Gestión de Muestras y Residuos" ${editingTask && editingTask.category === 'Gestión de Muestras y Residuos' ? 'selected' : ''}>📦 Gestión de Muestras</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Frecuencia *</label>
                <input type="text" id="edit-frequency" required value="${editingTask ? editingTask.frequency || '' : 'Semanal (Viernes al cierre)'}" placeholder="Ej: Semanal (Viernes al cierre)" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-700">Área / Sector del Laboratorio *</label>
              <input type="text" id="edit-area" required value="${editingTask ? editingTask.area || '' : 'Ed. 407 - Aula Central'}" placeholder="Ej: Mesas de Granito, Aula Central y Pasillos..." class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-700">Descripción y Protocolo Paso a Paso *</label>
              <textarea id="edit-description" rows="3" required placeholder="Instrucciones detalladas de cómo se realiza la rutina..." class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">${editingTask ? editingTask.description || '' : ''}</textarea>
            </div>

            <!-- Asignación de Auxiliares Responsables -->
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-700">Auxiliares Responsables del Turno</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                ${members.map(m => {
                  const isChecked = editingTask && editingTask.assignedTo && editingTask.assignedTo.includes(m.id);
                  return `
                    <label class="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer p-1 rounded hover:bg-slate-200/60">
                      <input type="checkbox" name="edit-assigned" value="${m.id}" ${isChecked ? 'checked' : ''} class="rounded border-slate-300 text-unal-500 focus:ring-unal-400">
                      <span class="truncate">${m.name.split(' ')[0]} ${m.name.split(' ').slice(-1)[0]}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button type="button" id="btn-cancel-edit-modal" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">
                Cancelar
              </button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5">
                <i data-lucide="save" class="w-4 h-4"></i>
                <span>Guardar Rutina</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    `;

    // Listeners de pestañas de categoría
    container.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-cat');
        render();
      });
    });

    // Listener de filtro por estado
    const statusSelect = container.querySelector('#recurring-status-select');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        activeStatus = e.target.value;
        render();
      });
    }

    // Listener de búsqueda
    const searchInput = container.querySelector('#recurring-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        render();
      });
    }

    // Listener para marcar como cumplida
    container.querySelectorAll('.btn-log-task').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.getAttribute('data-task-id');
        selectedTaskForLog = allTasks.find(t => t.id === taskId);
        isLogModalOpen = true;
        render();
      });
    });

    // Cerrar modal de log
    const btnCloseLog = container.querySelector('#btn-close-log-modal');
    const btnCancelLog = container.querySelector('#btn-cancel-log-modal');
    if (btnCloseLog) btnCloseLog.addEventListener('click', () => { isLogModalOpen = false; render(); });
    if (btnCancelLog) btnCancelLog.addEventListener('click', () => { isLogModalOpen = false; render(); });

    // Submit log form
    const logForm = container.querySelector('#form-log-recurring');
    if (logForm) {
      logForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const memberId = container.querySelector('#log-member-id').value;
        const notes = container.querySelector('#log-notes').value;
        const evidenceUrl = container.querySelector('#log-evidence-url').value;

        storage.completeRecurringTask(selectedTaskForLog.id, memberId, notes, evidenceUrl);

        if (window.confetti) {
          window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        }

        isLogModalOpen = false;
        selectedTaskForLog = null;
        render();
      });
    }

    // Revisor actions: Nueva rutina
    const btnNew = container.querySelector('#btn-new-recurring-task');
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        editingTask = { assignedTo: [] };
        isEditModalOpen = true;
        render();
      });
    }

    // Revisor actions: Reiniciar ciclo semanal
    const btnReset = container.querySelector('#btn-reset-weekly-cycle');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('¿Deseas reiniciar el ciclo semanal? Todas las rutinas pasarán a estado "Pendiente" para el nuevo turno de la semana.')) {
          storage.resetRecurringCycle();
          render();
        }
      });
    }

    // Revisor actions: Editar rutina
    container.querySelectorAll('.btn-edit-task').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.getAttribute('data-task-id');
        editingTask = JSON.parse(JSON.stringify(allTasks.find(t => t.id === taskId)));
        isEditModalOpen = true;
        render();
      });
    });

    // Revisor actions: Eliminar rutina
    container.querySelectorAll('.btn-delete-task').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.getAttribute('data-task-id');
        if (confirm('¿Estás seguro de que deseas eliminar esta rutina de mantenimiento?')) {
          storage.deleteRecurringTask(taskId);
          render();
        }
      });
    });

    // Cerrar modal de edición
    const btnCloseEdit = container.querySelector('#btn-close-edit-modal');
    const btnCancelEdit = container.querySelector('#btn-cancel-edit-modal');
    if (btnCloseEdit) btnCloseEdit.addEventListener('click', () => { isEditModalOpen = false; render(); });
    if (btnCancelEdit) btnCancelEdit.addEventListener('click', () => { isEditModalOpen = false; render(); });

    // Submit edit form
    const editForm = container.querySelector('#form-edit-recurring');
    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = container.querySelector('#edit-title').value;
        const category = container.querySelector('#edit-category').value;
        const frequency = container.querySelector('#edit-frequency').value;
        const area = container.querySelector('#edit-area').value;
        const description = container.querySelector('#edit-description').value;

        const assignedCheckboxes = container.querySelectorAll('input[name="edit-assigned"]:checked');
        const assignedTo = Array.from(assignedCheckboxes).map(cb => cb.value);

        if (editingTask && editingTask.id) {
          storage.updateRecurringTask({
            ...editingTask,
            title,
            category,
            frequency,
            area,
            description,
            assignedTo
          });
        } else {
          storage.addRecurringTask({
            title,
            category,
            frequency,
            area,
            description,
            assignedTo
          });
        }

        isEditModalOpen = false;
        editingTask = null;
        render();
      });
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  render();
};
