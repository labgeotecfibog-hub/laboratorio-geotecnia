/**
 * Componente: Vista de Prácticas de Laboratorio de Docencia
 * Identidad Institucional: Universidad Nacional de Colombia • Laboratorio de Geotecnia
 * 
 * Registra y gestiona las prácticas académicas a realizar con:
 * - Asignatura / Clase
 * - Ensayos geotécnicos que se realizarán
 * - Profesor a cargo
 * - Horario y Día de la semana
 * - Asignación de personal auxiliar del laboratorio
 * - Checklist de preparación previa de muestras y equipos
 */

window.GeoComponents = window.GeoComponents || {};

window.GeoComponents.renderLabPracticesView = function(container) {
  if (!container) return;

  const storage = window.GeoStorage;
  const isReviewer = window.GeoAuth ? window.GeoAuth.isReviewer() : false;

  let activeDay = 'all';
  let activeSubject = 'all';
  let searchTerm = '';
  let editingPractice = null;
  let isModalOpen = false;
  let editingProfessorPractice = null;
  let isProfModalOpen = false;

  // Lista de ensayos geotécnicos estándar comunes para autocompletado rápido
  const COMMON_GEOTECH_TESTS = [
    'Granulometría por Tamizado (ASTM D422 / I.N.V. E-123)',
    'Límites de Atterberg: Líquido y Plástico (ASTM D4318 / I.N.V. E-125 / E-126)',
    'Determinación del Contenido de Humedad (ASTM D2216)',
    'Gravedad Específica de los Sólidos GS (ASTM D854 / I.N.V. E-128)',
    'Compactación Proctor Modificado (ASTM D1557 / I.N.V. E-142)',
    'Relación de Soporte de California - CBR en Laboratorio (ASTM D1883)',
    'Ensayo de Corte Directo Consolidado Drenado (ASTM D3080 / I.N.V. E-154)',
    'Compresión Inconfinada en Suelos Cohesivos (ASTM D2166 / I.N.V. E-152)',
    'Consolidación Unidimensional Edométrica (ASTM D2435 / I.N.V. E-151)',
    'Ensayo Triaxial Estándar UU / CU / CD (ASTM D2850 / D4767)',
    'Carga Puntual en Rocas - Point Load Test (ASTM D5731)',
    'Esclerometría con Martillo Schmidt en Roca (ASTM D5873)'
  ];

  function getFilteredPractices() {
    let practices = storage.getLabPractices();

    if (activeDay !== 'all') {
      practices = practices.filter(p => p.dayOfWeek === activeDay);
    }

    if (activeSubject !== 'all') {
      practices = practices.filter(p => p.subject === activeSubject);
    }

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      practices = practices.filter(p => 
        (p.subject && p.subject.toLowerCase().includes(q)) ||
        (p.professor && p.professor.toLowerCase().includes(q)) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.tests && p.tests.some(t => t.toLowerCase().includes(q)))
      );
    }

    return practices;
  }

  function render() {
    const allPractices = storage.getLabPractices();
    const filteredPractices = getFilteredPractices();
    const members = storage.getMembers().filter(m => m.active);

    // Métricas
    const totalCount = allPractices.length;
    const totalStudents = allPractices.reduce((sum, p) => sum + (Number(p.studentCount) || 0), 0);
    const assignedStaffSet = new Set();
    allPractices.forEach(p => (p.assignedStaff || []).forEach(id => assignedStaffSet.add(id)));
    const totalStaffCount = assignedStaffSet.size;

    // Obtener asignaturas únicas para el filtro
    const subjects = Array.from(new Set(allPractices.map(p => p.subject).filter(Boolean)));

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Header Principal Institucional -->
        <div class="bg-gradient-to-r from-unal-800 via-unal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-unal-600/30">
          <div class="absolute right-0 top-0 bottom-0 w-1/3 bg-cover bg-right opacity-10 pointer-events-none" style="background-image: url('./Diseno/Fondo_circulos.png');"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2 max-w-2xl">
              <div class="flex items-center space-x-2">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-unal-400/20 text-unal-300 border border-unal-400/40 flex items-center space-x-1.5">
                  <i data-lucide="graduation-cap" class="w-3.5 h-3.5 text-unal-400"></i>
                  <span>Docencia Universitaria • Pregrado y Posgrado UNAL</span>
                </span>
                <span class="text-xs text-slate-300 font-mono">Edificio 407</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                Prácticas de Laboratorio de Geotecnia
              </h1>
              <p class="text-slate-300 text-sm leading-relaxed">
                Programación académica y logística de ensayos geotécnicos para docencia. Consulta la asignatura, los ensayos que se realizarán, el profesor titular, el horario y los auxiliares asignados para la preparación de probetas y equipos.
              </p>
            </div>

            <!-- Botones de Acción -->
            <div class="flex flex-wrap items-center gap-2.5 shrink-0">
              <button id="btn-new-practice" class="px-4 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center space-x-1.5 transform active:scale-95">
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
                <span>Nueva Práctica</span>
              </button>
            </div>
          </div>
        </div>

        <!-- KPIs de Prácticas Académicas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Prácticas Programadas</span>
              <span class="p-2 rounded-xl bg-unal-50 text-unal-800">
                <i data-lucide="calendar" class="w-4 h-4"></i>
              </span>
            </div>
            <div class="text-3xl font-extrabold text-slate-900 font-heading">${totalCount}</div>
            <p class="text-[11px] text-slate-400">Grupos académicos activos en el semestre</p>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Estudiantes Atendidos</span>
              <span class="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <i data-lucide="users" class="w-4 h-4"></i>
              </span>
            </div>
            <div class="text-3xl font-extrabold text-emerald-600 font-heading">${totalStudents}</div>
            <p class="text-[11px] text-slate-400">Cupos de ingeniería civil y agrícola</p>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Personal Auxiliar Asignado</span>
              <span class="p-2 rounded-xl bg-blue-50 text-blue-700">
                <i data-lucide="user-check" class="w-4 h-4"></i>
              </span>
            </div>
            <div class="text-3xl font-extrabold text-blue-600 font-heading">${totalStaffCount}</div>
            <p class="text-[11px] text-slate-400">Estudiantes auxiliares en apoyo docente</p>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Ensayos Geotécnicos</span>
              <span class="p-2 rounded-xl bg-amber-50 text-amber-700">
                <i data-lucide="flask-conical" class="w-4 h-4"></i>
              </span>
            </div>
            <div class="text-3xl font-extrabold text-amber-600 font-heading">
              ${allPractices.reduce((sum, p) => sum + (p.tests ? p.tests.length : 0), 0)}
            </div>
            <p class="text-[11px] text-slate-400">Protocolos experimentales a ejecutar</p>
          </div>

        </div>

        <!-- Filtros y Búsqueda -->
        <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <!-- Tabs por Día de la Semana -->
            <div class="flex flex-wrap items-center gap-1.5" id="day-filter-tabs">
              <button class="day-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeDay === 'all' ? 'bg-unal-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-day="all">
                Todos los Días
              </button>
              <button class="day-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeDay === 'Lunes' ? 'bg-unal-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-day="Lunes">
                Lunes
              </button>
              <button class="day-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeDay === 'Martes' ? 'bg-unal-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-day="Martes">
                Martes
              </button>
              <button class="day-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeDay === 'Miércoles' ? 'bg-unal-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-day="Miércoles">
                Miércoles
              </button>
              <button class="day-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeDay === 'Jueves' ? 'bg-unal-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-day="Jueves">
                Jueves
              </button>
              <button class="day-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeDay === 'Viernes' ? 'bg-unal-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-day="Viernes">
                Viernes
              </button>
              <button class="day-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeDay === 'Sábado' ? 'bg-unal-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-day="Sábado">
                Sábado
              </button>
            </div>

            <!-- Filtro por Asignatura y Búsqueda -->
            <div class="flex flex-wrap items-center gap-2">
              <select id="practice-subject-select" class="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-unal-400 bg-white">
                <option value="all" ${activeSubject === 'all' ? 'selected' : ''}>Todas las Asignaturas</option>
                ${subjects.map(s => `
                  <option value="${s}" ${activeSubject === s ? 'selected' : ''}>${s}</option>
                `).join('')}
              </select>

              <div class="relative flex-1 sm:w-64">
                <i data-lucide="search" class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input type="text" id="practice-search-input" value="${searchTerm}" placeholder="Buscar clase, ensayo o profesor..." class="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-unal-400">
              </div>
            </div>

          </div>
        </div>

        <!-- Listado de Tarjetas de Prácticas de Laboratorio -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          ${filteredPractices.length === 0 ? `
            <div class="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <div class="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <i data-lucide="book-x" class="w-6 h-6"></i>
              </div>
              <h3 class="font-bold text-slate-700 text-base">No se encontraron prácticas de laboratorio</h3>
              <p class="text-xs text-slate-400 max-w-md mx-auto">No hay prácticas registradas para el día o los criterios seleccionados.</p>
            </div>
          ` : filteredPractices.map(practice => {
            const assignedStaffMembers = (practice.assignedStaff || []).map(id => members.find(m => m.id === id)).filter(Boolean);
            const checklist = practice.preparationChecklist || [];
            const completedItems = checklist.filter(i => i.done).length;
            const prepProgress = checklist.length > 0 ? Math.round((completedItems / checklist.length) * 100) : 0;

            // Estado de la práctica
            let statusBadge = '';
            if (practice.status === 'Completada') {
              statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✅ Realizada</span>';
            } else if (practice.status === 'En Ejecución') {
              statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 animate-pulse">🔴 En Curso</span>';
            } else if (practice.status === 'Lista para Iniciar') {
              statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">✨ Lista para Iniciar</span>';
            } else if (practice.status === 'En Preparación de Material') {
              statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">⏳ En Preparación</span>';
            } else {
              statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">📅 Programada</span>';
            }

            return `
              <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5">
                
                <!-- Cabecera de la Práctica -->
                <div class="space-y-3">
                  
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-unal-50 text-unal-800 border border-unal-200">
                          ${practice.code || 'Grupo UNAL'}
                        </span>
                        <span class="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-1">
                          <i data-lucide="users" class="w-3 h-3 text-slate-400"></i>
                          <span>${practice.studentCount || 20} estudiantes</span>
                        </span>
                      </div>
                      <h3 class="text-lg font-extrabold text-slate-900 font-heading leading-tight pt-1">
                        ${practice.subject}
                      </h3>
                    </div>

                    <div class="shrink-0">
                      ${statusBadge}
                    </div>
                  </div>

                  <!-- Día, Horario y Salón -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                    <div class="flex items-center space-x-2">
                      <div class="w-7 h-7 rounded-lg bg-white text-unal-800 flex items-center justify-center shadow-xs border border-slate-200">
                        <i data-lucide="calendar" class="w-3.5 h-3.5 text-unal-600"></i>
                      </div>
                      <div>
                        <div class="font-bold text-slate-800">${practice.dayOfWeek}</div>
                        <div class="text-[11px] text-slate-500 font-mono">${practice.timeSlot}</div>
                      </div>
                    </div>

                    <div class="flex items-center space-x-2">
                      <div class="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center shadow-xs border border-slate-200">
                        <i data-lucide="map-pin" class="w-3.5 h-3.5 text-amber-600"></i>
                      </div>
                      <div class="truncate">
                        <div class="font-bold text-slate-800 truncate">${practice.location || 'Laboratorio Ed. 407'}</div>
                        <div class="text-[11px] text-slate-500 truncate">Próxima: ${practice.date || 'Semanal'}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Profesor a Cargo (Asignable a mano) -->
                  <div class="flex items-center justify-between text-xs py-2 px-3 bg-slate-50/90 rounded-2xl border border-slate-200/80">
                    <div class="flex items-center space-x-2.5 min-w-0">
                      <span class="w-7 h-7 rounded-xl bg-unal-800 text-unal-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        <i data-lucide="graduation-cap" class="w-4 h-4 text-unal-400"></i>
                      </span>
                      <div class="min-w-0">
                        <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Profesor Titular de la Clase:</span>
                        <div class="flex items-center space-x-1.5 flex-wrap">
                          <strong class="text-slate-900 font-bold truncate max-w-[210px]" title="${practice.professor || 'Sin asignar'}">
                            ${practice.professor || 'Sin profesor asignado'}
                          </strong>
                          <button type="button" class="btn-quick-edit-prof text-unal-700 hover:text-unal-900 hover:bg-unal-100 px-1.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all" data-practice-id="${practice.id}" title="Asignar o cambiar profesor a mano">
                            <i data-lucide="pencil" class="w-3 h-3 text-unal-700"></i>
                            <span class="underline">Asignar a mano</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    ${practice.professorEmail ? `
                      <a href="mailto:${practice.professorEmail}" title="${practice.professorEmail}" class="text-unal-700 hover:text-unal-900 hover:underline flex items-center space-x-1 text-[11px] font-semibold shrink-0 ml-2">
                        <i data-lucide="mail" class="w-3.5 h-3.5"></i>
                        <span class="hidden sm:inline">Correo</span>
                      </a>
                    ` : ''}
                  </div>

                  <!-- Ensayos que se realizarán -->
                  <div class="space-y-1.5 pt-1">
                    <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                      <i data-lucide="flask-conical" class="w-3 h-3 text-unal-500"></i>
                      <span>Ensayos a Realizar:</span>
                    </span>
                    <div class="flex flex-wrap gap-1.5">
                      ${(practice.tests || []).map(test => `
                        <span class="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200/80 flex items-center space-x-1">
                          <i data-lucide="check" class="w-3 h-3 text-emerald-600 shrink-0"></i>
                          <span>${test}</span>
                        </span>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Checklist de Preparación de Muestras e Insumos -->
                  ${checklist.length > 0 ? `
                    <div class="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      <div class="flex items-center justify-between text-xs font-bold">
                        <span class="text-slate-700 flex items-center space-x-1">
                          <i data-lucide="check-square" class="w-3.5 h-3.5 text-unal-500"></i>
                          <span>Alistamiento de Muestras y Equipos</span>
                        </span>
                        <span class="text-unal-800 font-mono text-[11px]">${completedItems}/${checklist.length} listos (${prepProgress}%)</span>
                      </div>
                      
                      <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-unal-500 h-1.5 rounded-full transition-all duration-300" style="width: ${prepProgress}%"></div>
                      </div>

                      <div class="space-y-1 pt-1">
                        ${checklist.map((item, idx) => `
                          <label class="flex items-start space-x-2 text-xs text-slate-700 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                            <input type="checkbox" class="chk-prep-item mt-0.5 rounded border-slate-300 text-unal-600 focus:ring-unal-400" data-practice-id="${practice.id}" data-item-idx="${idx}" ${item.done ? 'checked' : ''}>
                            <span class="${item.done ? 'line-through text-slate-400' : 'font-medium'}">${item.item}</span>
                          </label>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}

                  <!-- Notas del Docente -->
                  ${practice.notes ? `
                    <p class="text-[11px] text-slate-500 italic bg-amber-50/50 border border-amber-200/50 p-2.5 rounded-xl">
                      <strong>Nota de Bioseguridad:</strong> ${practice.notes}
                    </p>
                  ` : ''}

                </div>

                <!-- Personal Auxiliar Asignado & Acciones -->
                <div class="space-y-3 pt-3 border-t border-slate-100">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div class="flex items-center space-x-2">
                      <span class="text-slate-400 font-medium">Auxiliares asignados:</span>
                      <div class="flex -space-x-1.5 overflow-hidden">
                        ${assignedStaffMembers.map(m => window.GeoUtils.renderMemberAvatar(m, 'sm')).join('')}
                      </div>
                      <span class="text-slate-700 font-semibold truncate max-w-[200px]" title="${assignedStaffMembers.map(m => m.name).join(', ')}">
                        ${assignedStaffMembers.map(m => m.initials || m.name.split(' ')[0]).join(', ') || 'Sin asignar'}
                      </span>
                    </div>

                    <!-- Selector rápido de estado -->
                    <select class="sel-practice-status px-2.5 py-1 rounded-xl border border-slate-300 text-[11px] font-bold text-slate-700 bg-white" data-practice-id="${practice.id}">
                      <option value="Programada" ${practice.status === 'Programada' ? 'selected' : ''}>Programada</option>
                      <option value="En Preparación de Material" ${practice.status === 'En Preparación de Material' ? 'selected' : ''}>En Preparación</option>
                      <option value="Lista para Iniciar" ${practice.status === 'Lista para Iniciar' ? 'selected' : ''}>Lista para Iniciar</option>
                      <option value="En Ejecución" ${practice.status === 'En Ejecución' ? 'selected' : ''}>En Ejecución</option>
                      <option value="Completada" ${practice.status === 'Completada' ? 'selected' : ''}>Completada</option>
                    </select>
                  </div>

                  <div class="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button class="btn-edit-practice px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all flex items-center space-x-1 border border-slate-200" data-practice-id="${practice.id}">
                      <i data-lucide="edit" class="w-3.5 h-3.5 text-unal-600"></i>
                      <span>Editar Práctica</span>
                    </button>
                    ${isReviewer ? `
                      <button class="btn-delete-practice px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center space-x-1" data-practice-id="${practice.id}">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        <span>Eliminar</span>
                      </button>
                    ` : ''}
                  </div>
                </div>

              </div>
            `;
          }).join('')}
        </div>

      </div>

      <!-- Modal de Creación / Edición de Práctica (Docencia) -->
      <div id="modal-edit-practice" class="${isModalOpen ? 'fixed' : 'hidden'} inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-unal-500">Gestión Académica de Docencia</span>
              <h3 class="text-xl font-extrabold text-slate-900 font-heading">
                ${editingPractice && editingPractice.id ? 'Editar Práctica de Laboratorio' : 'Nueva Práctica de Laboratorio'}
              </h3>
            </div>
            <button id="btn-close-practice-modal" class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="form-edit-practice" class="space-y-4">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Asignatura / Clase *</label>
                <input type="text" id="prac-subject" required value="${editingPractice ? editingPractice.subject || '' : ''}" placeholder="Ej: Mecánica de Suelos Básica" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Código / Grupo *</label>
                <input type="text" id="prac-code" required value="${editingPractice ? editingPractice.code || '' : ''}" placeholder="Ej: 2015945 - Grupo 01" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Profesor / Docente Titular (Asignar a mano) *</label>
                <input type="text" id="prac-professor" required value="${editingPractice ? editingPractice.professor || '' : ''}" placeholder="Escribir nombre del profesor titular de la clase" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">
                <span class="text-[10px] text-slate-400 block">Docente titular de la asignatura (externo al equipo de planta del laboratorio).</span>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Correo del Profesor</label>
                <input type="email" id="prac-email" value="${editingPractice ? editingPractice.professorEmail || '' : ''}" placeholder="profesor@unal.edu.co" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">
                <span class="text-[10px] text-slate-400 block">Contacto institucional para temas de la práctica.</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Día de la Semana *</label>
                <select id="prac-day" required class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-unal-400">
                  <option value="Lunes" ${editingPractice && editingPractice.dayOfWeek === 'Lunes' ? 'selected' : ''}>Lunes</option>
                  <option value="Martes" ${editingPractice && editingPractice.dayOfWeek === 'Martes' ? 'selected' : ''}>Martes</option>
                  <option value="Miércoles" ${editingPractice && editingPractice.dayOfWeek === 'Miércoles' ? 'selected' : ''}>Miércoles</option>
                  <option value="Jueves" ${editingPractice && editingPractice.dayOfWeek === 'Jueves' ? 'selected' : ''}>Jueves</option>
                  <option value="Viernes" ${editingPractice && editingPractice.dayOfWeek === 'Viernes' ? 'selected' : ''}>Viernes</option>
                  <option value="Sábado" ${editingPractice && editingPractice.dayOfWeek === 'Sábado' ? 'selected' : ''}>Sábado</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Horario *</label>
                <input type="text" id="prac-time" required value="${editingPractice ? editingPractice.timeSlot || '' : '08:00 - 11:00 AM'}" placeholder="08:00 - 11:00 AM" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">No. Estudiantes</label>
                <input type="number" id="prac-students" min="1" value="${editingPractice ? editingPractice.studentCount || 20 : 20}" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Ubicación / Aula *</label>
                <input type="text" id="prac-location" required value="${editingPractice ? editingPractice.location || '' : 'Mesas 1 y 2 - Aula Principal Ed. 407'}" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Fecha Próxima</label>
                <input type="date" id="prac-date" value="${editingPractice ? editingPractice.date || '' : ''}" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">
              </div>
            </div>

            <!-- Ensayos a Realizar (Texto separado por líneas o sugerencias) -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-700">Ensayos que se realizarán (un ensayo por línea) *</label>
              <textarea id="prac-tests" rows="3" required placeholder="Granulometría por Tamizado (ASTM D422)&#10;Límites de Atterberg (ASTM D4318)&#10;Contenido de Humedad (ASTM D2216)" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">${editingPractice && editingPractice.tests ? editingPractice.tests.join('\n') : ''}</textarea>
              
              <!-- Chips rápidos de ensayos comunes -->
              <div class="pt-1">
                <span class="text-[10px] text-slate-400 block mb-1">Agregar ensayo sugerido:</span>
                <div class="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  ${COMMON_GEOTECH_TESTS.slice(0, 6).map(t => `
                    <button type="button" class="btn-quick-add-test px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700" data-test="${t}">
                      + ${t.split('(')[0].trim()}
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Asignación de Personal Auxiliar -->
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-700">Personal Auxiliar Asignado</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                ${members.map(m => {
                  const isChecked = editingPractice && editingPractice.assignedStaff && editingPractice.assignedStaff.includes(m.id);
                  return `
                    <label class="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer p-1 rounded hover:bg-slate-200/60">
                      <input type="checkbox" name="prac-assigned" value="${m.id}" ${isChecked ? 'checked' : ''} class="rounded border-slate-300 text-unal-500 focus:ring-unal-400">
                      <span class="truncate">${m.name.split(' ')[0]} ${m.name.split(' ').slice(-1)[0]}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Instrucciones de Bioseguridad y Notas -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-700">Notas de Bioseguridad / Instrucciones</label>
              <input type="text" id="prac-notes" value="${editingPractice ? editingPractice.notes || '' : ''}" placeholder="Ej: Bata blanca cerrada y gafas de seguridad obligatorias" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">
            </div>

            <div class="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button type="button" id="btn-cancel-practice-modal" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">
                Cancelar
              </button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5">
                <i data-lucide="save" class="w-4 h-4"></i>
                <span>Guardar Práctica</span>
              </button>
            </div>

          </form>

        </div>
      </div>

      <!-- Modal Rápido: Asignar Profesor a Mano -->
      <div id="modal-quick-professor" class="${isProfModalOpen ? 'fixed' : 'hidden'} inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center space-x-2.5">
              <span class="w-9 h-9 rounded-2xl bg-unal-800 text-unal-300 flex items-center justify-center shadow-xs">
                <i data-lucide="graduation-cap" class="w-5 h-5 text-unal-400"></i>
              </span>
              <div>
                <h3 class="text-base font-extrabold text-slate-900 font-heading">
                  Asignar Profesor a Mano
                </h3>
                <p class="text-xs text-slate-500 truncate max-w-[240px]">${editingProfessorPractice ? (editingProfessorPractice.subject || 'Práctica de Laboratorio') : ''}</p>
              </div>
            </div>
            <button id="btn-close-prof-modal" class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="form-quick-professor" class="space-y-4">
            <div class="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 space-y-1">
              <div class="font-bold flex items-center space-x-1">
                <i data-lucide="info" class="w-3.5 h-3.5 text-amber-600"></i>
                <span>Docentes de Cátedra Externos</span>
              </div>
              <p>Los profesores que dictan las materias no pertenecen a la nómina fija del laboratorio. Puedes ingresar y cambiar libremente a mano el nombre del profesor titular de la clase.</p>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-700">Nombre del Profesor Titular *</label>
              <input type="text" id="quick-prof-name" required value="${editingProfessorPractice ? (editingProfessorPractice.professor || '') : ''}" placeholder="Ej: Prof. Carlos Alberto Vega / Ing. Roberto Pérez" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-700">Correo Electrónico (Opcional)</label>
              <input type="email" id="quick-prof-email" value="${editingProfessorPractice ? (editingProfessorPractice.professorEmail || '') : ''}" placeholder="profesor@unal.edu.co" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-unal-400">
            </div>

            <div class="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button type="button" id="btn-cancel-prof-modal" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">
                Cancelar
              </button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5">
                <i data-lucide="check" class="w-4 h-4"></i>
                <span>Guardar Profesor</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    // Listeners de filtro por día
    container.querySelectorAll('.day-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeDay = btn.getAttribute('data-day');
        render();
      });
    });

    // Filtro por asignatura
    const subjectSelect = container.querySelector('#practice-subject-select');
    if (subjectSelect) {
      subjectSelect.addEventListener('change', (e) => {
        activeSubject = e.target.value;
        render();
      });
    }

    // Búsqueda
    const searchInput = container.querySelector('#practice-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        render();
      });
    }

    // Toggle checklist items
    container.querySelectorAll('.chk-prep-item').forEach(chk => {
      chk.addEventListener('change', () => {
        const practiceId = chk.getAttribute('data-practice-id');
        const itemIdx = parseInt(chk.getAttribute('data-item-idx'), 10);
        storage.togglePracticeChecklistItem(practiceId, itemIdx);
        render();
      });
    });

    // Cambio rápido de estado
    container.querySelectorAll('.sel-practice-status').forEach(sel => {
      sel.addEventListener('change', () => {
        const practiceId = sel.getAttribute('data-practice-id');
        storage.updatePracticeStatus(practiceId, sel.value);
        render();
      });
    });

    // Listeners del modal rápido de profesor a mano
    container.querySelectorAll('.btn-quick-edit-prof').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const practiceId = btn.getAttribute('data-practice-id');
        editingProfessorPractice = allPractices.find(p => p.id === practiceId);
        isProfModalOpen = true;
        render();
        setTimeout(() => {
          const input = container.querySelector('#quick-prof-name');
          if (input) input.focus();
        }, 50);
      });
    });

    const btnCloseProf = container.querySelector('#btn-close-prof-modal');
    const btnCancelProf = container.querySelector('#btn-cancel-prof-modal');
    if (btnCloseProf) btnCloseProf.addEventListener('click', () => { isProfModalOpen = false; editingProfessorPractice = null; render(); });
    if (btnCancelProf) btnCancelProf.addEventListener('click', () => { isProfModalOpen = false; editingProfessorPractice = null; render(); });

    const formQuickProf = container.querySelector('#form-quick-professor');
    if (formQuickProf) {
      formQuickProf.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!editingProfessorPractice) return;
        const profName = container.querySelector('#quick-prof-name').value;
        const profEmail = container.querySelector('#quick-prof-email').value;
        storage.updatePracticeProfessor(editingProfessorPractice.id, profName, profEmail);
        isProfModalOpen = false;
        editingProfessorPractice = null;
        render();
      });
    }

    // Acciones: Nueva práctica
    const btnNew = container.querySelector('#btn-new-practice');
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        editingPractice = { assignedStaff: [], tests: [] };
        isModalOpen = true;
        render();
      });
    }

    // Acciones: Editar práctica
    container.querySelectorAll('.btn-edit-practice').forEach(btn => {
      btn.addEventListener('click', () => {
        const practiceId = btn.getAttribute('data-practice-id');
        editingPractice = JSON.parse(JSON.stringify(allPractices.find(p => p.id === practiceId)));
        isModalOpen = true;
        render();
      });
    });

    // Revisor actions: Eliminar práctica
    container.querySelectorAll('.btn-delete-practice').forEach(btn => {
      btn.addEventListener('click', () => {
        const practiceId = btn.getAttribute('data-practice-id');
        if (confirm('¿Estás seguro de que deseas eliminar esta práctica de laboratorio?')) {
          storage.deleteLabPractice(practiceId);
          render();
        }
      });
    });

    // Cerrar modal
    const btnClose = container.querySelector('#btn-close-practice-modal');
    const btnCancel = container.querySelector('#btn-cancel-practice-modal');
    if (btnClose) btnClose.addEventListener('click', () => { isModalOpen = false; render(); });
    if (btnCancel) btnCancel.addEventListener('click', () => { isModalOpen = false; render(); });

    // Botones rápidos para agregar ensayos
    container.querySelectorAll('.btn-quick-add-test').forEach(btn => {
      btn.addEventListener('click', () => {
        const testToAdd = btn.getAttribute('data-test');
        const textarea = container.querySelector('#prac-tests');
        if (textarea) {
          const current = textarea.value.trim();
          textarea.value = current ? `${current}\n${testToAdd}` : testToAdd;
        }
      });
    });

    // Submit práctica
    const practiceForm = container.querySelector('#form-edit-practice');
    if (practiceForm) {
      practiceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const subject = container.querySelector('#prac-subject').value;
        const code = container.querySelector('#prac-code').value;
        const professor = container.querySelector('#prac-professor').value;
        const professorEmail = container.querySelector('#prac-email').value;
        const dayOfWeek = container.querySelector('#prac-day').value;
        const timeSlot = container.querySelector('#prac-time').value;
        const studentCount = parseInt(container.querySelector('#prac-students').value, 10) || 20;
        const location = container.querySelector('#prac-location').value;
        const date = container.querySelector('#prac-date').value;
        const notes = container.querySelector('#prac-notes').value;

        const tests = container.querySelector('#prac-tests').value
          .split('\n')
          .map(t => t.trim())
          .filter(Boolean);

        const assignedCheckboxes = container.querySelectorAll('input[name="prac-assigned"]:checked');
        const assignedStaff = Array.from(assignedCheckboxes).map(cb => cb.value);

        if (editingPractice && editingPractice.id) {
          storage.updateLabPractice({
            ...editingPractice,
            subject,
            code,
            professor,
            professorEmail,
            dayOfWeek,
            timeSlot,
            studentCount,
            location,
            date,
            notes,
            tests,
            assignedStaff
          });
        } else {
          // Si es nueva práctica, generar checklist inicial inteligente basado en los ensayos
          const initialChecklist = [
            { item: 'Cuarteo y secado de muestras de suelo en horno a 110°C', done: false },
            { item: 'Alistamiento e inspección de equipos y recipientes tarados', done: false },
            { item: 'Verificación de balanzas analíticas y formatos de toma de datos', done: false }
          ];

          storage.addLabPractice({
            subject,
            code,
            professor,
            professorEmail,
            dayOfWeek,
            timeSlot,
            studentCount,
            location,
            date,
            notes,
            tests,
            assignedStaff,
            preparationChecklist: initialChecklist
          });
        }

        isModalOpen = false;
        editingPractice = null;
        render();
      });
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  render();
};
