/**
 * Componente: Vista de Gestión de Proyectos
 * Identidad Visual: Universidad Nacional de Colombia • Laboratorio de Geotecnia
 */

window.GeoComponents = window.GeoComponents || {};

window.GeoComponents.renderProjectsView = function(container, onOpenQuickLog) {
  let filterType = 'all';
  let searchTerm = '';

  const members = window.GeoStorage.getMembers();

  function render() {
    const allProjects = window.GeoStorage.getProjects();
    const filteredProjects = allProjects.filter(p => {
      const matchType = filterType === 'all' || p.type === filterType;
      const matchSearch = searchTerm === '' || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.client && p.client.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchType && matchSearch;
    });

    container.innerHTML = `
      <div class="space-y-6 animate-fadeIn">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold font-heading text-slate-900">Proyectos del Laboratorio</h1>
            <p class="text-xs sm:text-sm text-slate-500">Gestión de proyectos de extensión técnica e investigación con desglose de actividades ($WBS$)</p>
          </div>

          <div class="flex items-center space-x-3">
            <button id="btn-create-project" class="px-4 py-2.5 rounded-xl bg-unal-800 hover:bg-unal-700 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2">
              <i data-lucide="folder-plus" class="w-4 h-4 text-unal-400"></i>
              <span>Nuevo Proyecto</span>
            </button>
          </div>
        </div>

        <div class="glass-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200">
          
          <div class="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl">
            <button class="filter-tab px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}" data-type="all">
              Todos (${allProjects.length})
            </button>
            <button class="filter-tab px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'Extensión' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}" data-type="Extensión">
              Extensión (${allProjects.filter(p => p.type === 'Extensión').length})
            </button>
            <button class="filter-tab px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'Investigación' ? 'bg-white text-unal-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}" data-type="Investigación">
              Investigación (${allProjects.filter(p => p.type === 'Investigación').length})
            </button>
          </div>

          <div class="relative w-full sm:w-72">
            <input type="text" id="project-search-input" value="${searchTerm}" placeholder="Buscar por código, nombre o cliente..." class="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-unal-400 focus:ring-2 focus:ring-unal-400/20 outline-none transition-all">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
          </div>

        </div>

        <div class="space-y-4">
          ${filteredProjects.length === 0 ? `
            <div class="glass-card p-12 text-center rounded-2xl border border-dashed border-slate-300">
              <i data-lucide="folder-x" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
              <p class="text-base font-semibold text-slate-700">No se encontraron proyectos</p>
              <p class="text-xs text-slate-400 mt-1">Prueba cambiando los filtros o crea un nuevo proyecto.</p>
            </div>
          ` : filteredProjects.map(p => {
            const progress = window.GeoUtils.calculateProjectProgress(p);
            const health = window.GeoUtils.getProjectHealth(p);
            const totalWeight = (p.activities || []).reduce((sum, a) => sum + (Number(a.weight) || 0), 0);

            return `
              <div class="glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                
                <div class="p-5 sm:p-6 bg-white border-b border-slate-100">
                  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    <div class="space-y-2 max-w-2xl">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="px-2.5 py-0.5 rounded-lg text-xs font-bold ${p.type === 'Extensión' ? 'bg-blue-100 text-blue-800' : 'bg-unal-100 text-unal-800'}">
                          ${p.type}
                        </span>
                        <span class="font-mono text-xs font-bold text-slate-600 px-2 py-0.5 bg-slate-100 rounded-md">${p.code}</span>
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${health.badgeClass}">
                          ${health.status}
                        </span>
                        ${p.driveFolderName ? `
                          <a href="https://drive.google.com" target="_blank" title="Abrir carpeta en Google Drive" class="inline-flex items-center space-x-1 text-xs text-unal-800 hover:text-unal-900 font-medium px-2 py-0.5 bg-unal-50 rounded-md border border-unal-300">
                            <i data-lucide="folder-symlink" class="w-3 h-3 text-unal-700"></i>
                            <span>Drive: ${p.driveFolderName.substring(0, 20)}...</span>
                          </a>
                        ` : ''}
                      </div>

                      <h3 class="text-lg sm:text-xl font-bold font-heading text-slate-900 leading-snug">${p.name}</h3>
                      <p class="text-xs text-slate-600 leading-relaxed">${p.description}</p>
                      
                      <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span><strong>Cliente/Entidad:</strong> ${p.client || 'Universidad Nacional de Colombia'}</span>
                        <span><strong>Fecha Límite:</strong> ${window.GeoUtils.formatDateCO(p.deadline)}</span>
                        <span><strong>Actividades:</strong> ${(p.activities || []).length} definidas</span>
                      </div>
                    </div>

                    <div class="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div class="text-left lg:text-right">
                        <div class="text-3xl font-black font-mono text-slate-900">${progress}%</div>
                        <span class="text-xs text-slate-500 font-medium">Avance Ponderado</span>
                      </div>
                      
                      <div class="flex flex-wrap items-center gap-2">
                        <button data-quick-log-project="${p.id}" class="px-3.5 py-2 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5">
                          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                          <span>Reportar Avance</span>
                        </button>

                        <button data-config-tasks-project="${p.id}" title="Configurar y ajustar actividades WBS del proyecto" class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs transition-all flex items-center space-x-1.5">
                          <i data-lucide="sliders" class="w-3.5 h-3.5 text-unal-700"></i>
                          <span>Tareas WBS</span>
                        </button>

                        <button data-edit-project="${p.id}" title="Editar detalles generales del proyecto" class="px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 shadow-2xs transition-all flex items-center space-x-1">
                          <i data-lucide="edit-3" class="w-3.5 h-3.5 text-slate-600"></i>
                          <span>Editar</span>
                        </button>

                        <button data-delete-project="${p.id}" title="Eliminar proyecto" class="p-2 rounded-xl text-slate-400 hover:text-unal-red hover:bg-red-50 border border-transparent hover:border-red-200 transition-all">
                          <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                      </div>
                    </div>

                  </div>

                  <div class="mt-4 w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                    <div class="h-full rounded-full bg-gradient-to-r ${progress >= 80 ? 'from-unal-500 to-unal-400' : progress >= 40 ? 'from-amber-500 to-amber-400' : 'from-blue-600 to-blue-400'} transition-all duration-700" style="width: ${progress}%"></div>
                  </div>
                </div>

                <div class="p-5 bg-slate-50/70 space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                      <i data-lucide="list-checks" class="w-4 h-4 text-unal-700"></i>
                      <span>Desglose de Actividades y Pesos Porcentuales (WBS)</span>
                    </h4>
                    <div class="flex items-center space-x-3">
                      <span class="text-xs font-mono font-semibold ${totalWeight === 100 ? 'text-unal-700' : 'text-amber-700'}">
                        Peso Total: ${totalWeight}% ${totalWeight !== 100 ? '(Ajustar a 100%)' : ''}
                      </span>
                      <button data-config-tasks-project="${p.id}" class="inline-flex items-center space-x-1.5 text-xs text-unal-800 hover:text-unal-900 font-bold px-2.5 py-1 bg-unal-100 hover:bg-unal-200 rounded-lg border border-unal-300 transition-colors shadow-2xs">
                        <i data-lucide="edit-3" class="w-3 h-3 text-unal-700"></i>
                        <span>Ajustar / Agregar Tareas</span>
                      </button>
                    </div>
                  </div>

                  <div class="divide-y divide-slate-200 rounded-xl bg-white border border-slate-200 overflow-hidden text-xs">
                    ${(p.activities || []).map((act, index) => {
                      const assignedMembers = members.filter(m => (act.assignedTo || []).includes(m.id));
                      const isComplete = act.progress >= 100;

                      return `
                        <div class="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                          <div class="space-y-1 flex-1">
                            <div class="flex items-center space-x-2">
                              <span class="font-bold text-slate-800">${index + 1}. ${act.name}</span>
                              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isComplete ? 'bg-unal-100 text-unal-800' : 'bg-slate-100 text-slate-700'}">
                                ${act.status || 'En Ejecución'}
                              </span>
                            </div>
                            <p class="text-[11px] text-slate-500"><strong>Entregable:</strong> ${act.deliverables || 'N/A'}</p>
                            
                            <div class="flex items-center space-x-2 pt-0.5">
                              <span class="text-slate-400">Asignado a:</span>
                              <div class="flex -space-x-1.5 overflow-hidden">
                                ${assignedMembers.map(m => window.GeoUtils.renderMemberAvatar(m, 'sm')).join('')}
                              </div>
                              <span class="text-slate-600 font-medium">${assignedMembers.map(m => m.name.split(' ')[0]).join(', ') || 'Sin asignar'}</span>
                            </div>
                          </div>

                          <div class="flex items-center space-x-4 shrink-0 justify-between sm:justify-end">
                            <div class="text-right">
                              <span class="text-[10px] uppercase font-bold text-slate-400">Peso</span>
                              <div class="font-mono font-bold text-slate-800 text-xs">${act.weight}%</div>
                            </div>

                            <div class="w-32">
                              <div class="flex justify-between text-[11px] font-bold mb-1">
                                <span class="text-slate-500">Avance</span>
                                <span class="text-unal-800 font-mono">${act.progress}%</span>
                              </div>
                              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div class="bg-unal-400 h-2 rounded-full transition-all" style="width: ${act.progress}%"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>

              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;

    container.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        filterType = tab.getAttribute('data-type');
        render();
      });
    });

    const searchInput = container.querySelector('#project-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        render();
      });
    }

    container.querySelectorAll('[data-quick-log-project]').forEach(btn => {
      btn.addEventListener('click', () => {
        onOpenQuickLog();
      });
    });

    container.querySelectorAll('[data-config-tasks-project]').forEach(btn => {
      btn.addEventListener('click', () => {
        const projId = btn.getAttribute('data-config-tasks-project');
        const project = window.GeoStorage.getProjectById(projId);
        if (project && window.GeoComponents.renderProjectTasksModal) {
          window.GeoComponents.renderProjectTasksModal(
            true,
            project,
            () => render(),
            () => render()
          );
        }
      });
    });

    container.querySelectorAll('[data-edit-project]').forEach(btn => {
      btn.addEventListener('click', () => {
        const projId = btn.getAttribute('data-edit-project');
        const project = window.GeoStorage.getProjectById(projId);
        if (project) {
          openEditProjectModal(project);
        }
      });
    });

    container.querySelectorAll('[data-delete-project]').forEach(btn => {
      btn.addEventListener('click', () => {
        const projId = btn.getAttribute('data-delete-project');
        const project = window.GeoStorage.getProjectById(projId);
        if (project) {
          const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar permanentemente el proyecto "${project.name}" (${project.code})?\n\nEsta acción borrará también sus actividades y registros asociados.`);
          if (confirmDelete) {
            window.GeoStorage.deleteProject(projId);
            render();
          }
        }
      });
    });

    container.querySelector('#btn-create-project').addEventListener('click', () => {
      openCreateProjectModal();
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function openCreateProjectModal() {
    const modalHost = document.getElementById('quick-log-modal-container');
    let activities = [
      { name: 'Revisión preliminar, muestreo y calibración de equipos', weight: 25, deliverables: 'Fichas de muestreo', progress: 0 },
      { name: 'Ejecución de ensayos geotécnicos de laboratorio', weight: 45, deliverables: 'Curvas y lecturas de ensayos', progress: 0 },
      { name: 'Procesamiento de datos y modelación geotécnica', weight: 20, deliverables: 'Memorias de cálculo', progress: 0 },
      { name: 'Elaboración y emisión de informe técnico final', weight: 10, deliverables: 'Informe final firmado', progress: 0 }
    ];

    function renderModal() {
      const totalWeight = activities.reduce((sum, a) => sum + (Number(a.weight) || 0), 0);

      modalHost.innerHTML = `
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div class="glass-card bg-white rounded-2xl shadow-2xl max-w-3xl w-full border-2 border-unal-400/40 overflow-hidden">
            
            <div class="bg-gradient-to-r from-unal-900 via-unal-800 to-unal-700 p-5 text-white flex items-center justify-between border-b-2 border-unal-400">
              <div class="flex items-center space-x-3">
                <img src="./Diseno/Escudo_color.png" alt="Escudo UNAL" class="h-10 w-auto object-contain bg-white/90 p-1 rounded-lg">
                <div>
                  <h3 class="text-base sm:text-lg font-bold font-heading text-white">Crear Nuevo Proyecto Geotécnico</h3>
                  <p class="text-xs text-unal-300">Universidad Nacional de Colombia • Facultad de Ingeniería</p>
                </div>
              </div>
              <button id="btn-close-prj-modal" class="text-slate-300 hover:text-white p-1 rounded-lg">
                <i data-lucide="x" class="w-6 h-6"></i>
              </button>
            </div>

            <form id="new-project-form" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="sm:col-span-2">
                  <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Nombre del Proyecto *</label>
                  <input type="text" id="new-prj-name" required placeholder="Ej: Estudio Geotécnico y Capacidad Portante..." class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400">
                </div>

                <div>
                  <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Tipo de Proyecto *</label>
                  <select id="new-prj-type" required class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400 font-semibold">
                    <option value="Extensión">Extensión (Servicios/Consultoría)</option>
                    <option value="Investigación">Investigación Científica</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Cliente / Entidad Financiadora *</label>
                  <input type="text" id="new-prj-client" required placeholder="Ej: Invías, MinCiencias, Concesión..." class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400">
                </div>

                <div>
                  <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Fecha Límite de Entrega *</label>
                  <input type="date" id="new-prj-deadline" required class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Descripción y Objetivos</label>
                <textarea id="new-prj-desc" rows="2" placeholder="Resumen de los ensayos requeridos y alcance..." class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400"></textarea>
              </div>

              <div class="pt-3 border-t border-slate-200 space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800">Actividades y Pesos Porcentuales (WBS)</h4>
                    <p class="text-[11px] text-slate-500">Los pesos deben sumar exactamente 100%</p>
                  </div>
                  <span class="text-xs font-bold font-mono px-2 py-1 rounded-md ${totalWeight === 100 ? 'bg-unal-100 text-unal-800' : 'bg-red-100 text-unal-red'}">
                    Suma: ${totalWeight}%
                  </span>
                </div>

                <div class="space-y-2" id="activities-builder-list">
                  ${activities.map((a, i) => `
                    <div class="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                      <span class="font-bold text-slate-400 w-5">${i + 1}.</span>
                      <input type="text" data-act-idx="${i}" data-field="name" value="${a.name}" placeholder="Nombre de la actividad" class="flex-1 rounded-lg border border-slate-300 p-1.5 text-xs">
                      <div class="flex items-center space-x-1">
                        <input type="number" data-act-idx="${i}" data-field="weight" value="${a.weight}" min="1" max="100" class="w-14 rounded-lg border border-slate-300 p-1.5 text-xs text-center font-bold">
                        <span class="text-slate-500 font-bold">%</span>
                      </div>
                      <button type="button" data-del-act="${i}" class="text-unal-red hover:text-red-700 p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </div>
                  `).join('')}
                </div>

                <button type="button" id="btn-add-activity-row" class="text-xs font-bold text-unal-700 hover:text-unal-900 flex items-center space-x-1">
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                  <span>Agregar otra actividad</span>
                </button>
              </div>

              <div class="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button type="button" id="btn-cancel-prj" class="px-4 py-2 text-sm font-semibold text-slate-600">Cancelar</button>
                <button type="submit" class="px-6 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-sm shadow-md transition-all">
                  Crear Proyecto
                </button>
              </div>

            </form>

          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      modalHost.querySelectorAll('[data-act-idx]').forEach(input => {
        input.addEventListener('input', (e) => {
          const idx = Number(e.target.getAttribute('data-act-idx'));
          const field = e.target.getAttribute('data-field');
          activities[idx][field] = field === 'weight' ? Number(e.target.value) : e.target.value;
          const currentTotal = activities.reduce((sum, a) => sum + (Number(a.weight) || 0), 0);
          const badge = modalHost.querySelector('.font-mono.px-2');
          if (badge) {
            badge.textContent = `Suma: ${currentTotal}%`;
            badge.className = `text-xs font-bold font-mono px-2 py-1 rounded-md ${currentTotal === 100 ? 'bg-unal-100 text-unal-800' : 'bg-red-100 text-unal-red'}`;
          }
        });
      });

      modalHost.querySelectorAll('[data-del-act]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-del-act'));
          activities.splice(idx, 1);
          renderModal();
        });
      });

      modalHost.querySelector('#btn-add-activity-row').addEventListener('click', () => {
        activities.push({ name: 'Nueva actividad técnica', weight: 10, deliverables: 'Entregable', progress: 0 });
        renderModal();
      });

      modalHost.querySelector('#btn-close-prj-modal').addEventListener('click', () => modalHost.innerHTML = '');
      modalHost.querySelector('#btn-cancel-prj').addEventListener('click', () => modalHost.innerHTML = '');

      modalHost.querySelector('#new-project-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const finalWeight = activities.reduce((sum, a) => sum + (Number(a.weight) || 0), 0);
        if (finalWeight !== 100) {
          alert(`La suma de los pesos de las actividades es de ${finalWeight}%. Debe sumar exactamente 100%.`);
          return;
        }

        const name = modalHost.querySelector('#new-prj-name').value.trim();
        const type = modalHost.querySelector('#new-prj-type').value;
        const client = modalHost.querySelector('#new-prj-client').value.trim();
        const deadline = modalHost.querySelector('#new-prj-deadline').value;
        const description = modalHost.querySelector('#new-prj-desc').value.trim();

        const formattedActs = activities.map((a, i) => ({
          id: `ACT-NEW-${Date.now()}-${i + 1}`,
          name: a.name,
          weight: Number(a.weight),
          progress: 0,
          status: 'Pendiente',
          assignedTo: [],
          deadline: deadline,
          deliverables: a.deliverables || 'Entregable de laboratorio'
        }));

        window.GeoStorage.addProject({
          name,
          type,
          client,
          deadline,
          description,
          directorId: 'MEM-001',
          startDate: new Date().toISOString().split('T')[0],
          activities: formattedActs
        });

        modalHost.innerHTML = '';
        render();
      });
    }

    renderModal();
  }

  function openEditProjectModal(project) {
    const modalHost = document.getElementById('quick-log-modal-container');
    if (!modalHost) return;

    modalHost.innerHTML = `
      <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
        <div class="glass-card bg-white rounded-2xl shadow-2xl max-w-2xl w-full border-2 border-unal-400/40 overflow-hidden">
          
          <div class="bg-gradient-to-r from-unal-900 via-unal-800 to-unal-700 p-5 text-white flex items-center justify-between border-b-2 border-unal-400">
            <div class="flex items-center space-x-3">
              <img src="./Diseno/Escudo_color.png" alt="Escudo UNAL" class="h-10 w-auto object-contain bg-white/90 p-1 rounded-lg">
              <div>
                <div class="flex items-center space-x-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-unal-400 text-unal-900">${project.code}</span>
                  <h3 class="text-base sm:text-lg font-bold font-heading text-white">Editar Información del Proyecto</h3>
                </div>
                <p class="text-xs text-unal-300">Universidad Nacional de Colombia • Laboratorio de Geotecnia</p>
              </div>
            </div>
            <button id="btn-close-edit-prj-modal" class="text-slate-300 hover:text-white p-1 rounded-lg">
              <i data-lucide="x" class="w-6 h-6"></i>
            </button>
          </div>

          <form id="edit-project-form" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Nombre del Proyecto *</label>
                <input type="text" id="edit-prj-name" required value="${project.name || ''}" class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400">
              </div>

              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Tipo de Proyecto *</label>
                <select id="edit-prj-type" required class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400 font-semibold">
                  <option value="Extensión" ${project.type === 'Extensión' ? 'selected' : ''}>Extensión (Servicios/Consultoría)</option>
                  <option value="Investigación" ${project.type === 'Investigación' ? 'selected' : ''}>Investigación Científica</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Cliente / Entidad Financiadora *</label>
                <input type="text" id="edit-prj-client" required value="${project.client || ''}" class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400">
              </div>

              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Fecha Límite de Entrega *</label>
                <input type="date" id="edit-prj-deadline" required value="${project.deadline || ''}" class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Carpeta de Google Drive Asociada</label>
              <input type="text" id="edit-prj-drive-folder" value="${project.driveFolderName || ''}" placeholder="Ej: EXT-01_Anillo_Vial" class="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono outline-none focus:border-unal-400">
              <p class="text-[11px] text-slate-400 mt-1">Nombre de la subcarpeta del proyecto dentro de Google Drive</p>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Descripción y Objetivos</label>
              <textarea id="edit-prj-desc" rows="3" class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400">${project.description || ''}</textarea>
            </div>

            <div class="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button type="button" id="btn-delete-from-edit" class="text-xs font-bold text-unal-red hover:underline flex items-center space-x-1">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                <span>Eliminar este proyecto</span>
              </button>

              <div class="flex items-center space-x-3">
                <button type="button" id="btn-cancel-edit-prj" class="px-4 py-2 text-sm font-semibold text-slate-600">Cancelar</button>
                <button type="submit" class="px-6 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-sm shadow-md transition-all">
                  Guardar Cambios
                </button>
              </div>
            </div>

          </form>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    modalHost.querySelector('#btn-close-edit-prj-modal').addEventListener('click', () => modalHost.innerHTML = '');
    modalHost.querySelector('#btn-cancel-edit-prj').addEventListener('click', () => modalHost.innerHTML = '');

    modalHost.querySelector('#btn-delete-from-edit').addEventListener('click', () => {
      if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el proyecto "${project.name}"?`)) {
        window.GeoStorage.deleteProject(project.id);
        modalHost.innerHTML = '';
        render();
      }
    });

    modalHost.querySelector('#edit-project-form').addEventListener('submit', (e) => {
      e.preventDefault();
      project.name = modalHost.querySelector('#edit-prj-name').value.trim();
      project.type = modalHost.querySelector('#edit-prj-type').value;
      project.client = modalHost.querySelector('#edit-prj-client').value.trim();
      project.deadline = modalHost.querySelector('#edit-prj-deadline').value;
      project.driveFolderName = modalHost.querySelector('#edit-prj-drive-folder').value.trim();
      project.description = modalHost.querySelector('#edit-prj-desc').value.trim();

      window.GeoStorage.updateProject(project);
      modalHost.innerHTML = '';
      render();
    });
  }

  render();
};

