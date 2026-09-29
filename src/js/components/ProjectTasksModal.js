/**
 * Componente Modal: Configuración y Gestión de Tareas (WBS) de Proyectos Creados
 * Identidad Institucional: Universidad Nacional de Colombia • Laboratorio de Geotecnia
 */

window.GeoComponents = window.GeoComponents || {};

window.GeoComponents.renderProjectTasksModal = function(isOpen, project, onClose, onSave) {
  const modalContainer = document.getElementById('quick-log-modal-container');
  if (!modalContainer) return;

  if (!isOpen || !project) {
    modalContainer.innerHTML = '';
    return;
  }

  // Clonar las actividades para permitir edición sin mutar antes de guardar
  let activities = JSON.parse(JSON.stringify(project.activities || []));
  const members = window.GeoStorage.getMembers().filter(m => m.active);

  function getTotalWeight() {
    return activities.reduce((sum, a) => sum + (Number(a.weight) || 0), 0);
  }

  function distributeEvenly() {
    const n = activities.length;
    if (n === 0) return;
    const base = Math.floor(100 / n);
    const remainder = 100 % n;
    activities.forEach((a, i) => {
      a.weight = base + (i < remainder ? 1 : 0);
    });
    renderModal();
  }

  function normalizeWeights() {
    const currentTotal = getTotalWeight();
    const n = activities.length;
    if (n === 0) return;

    if (currentTotal === 0) {
      distributeEvenly();
      return;
    }

    let allocated = 0;
    activities.forEach((a, i) => {
      if (i === n - 1) {
        a.weight = Math.max(1, 100 - allocated);
      } else {
        const prop = Math.round((Number(a.weight) / currentTotal) * 100);
        const w = Math.max(1, prop);
        a.weight = w;
        allocated += w;
      }
    });

    // Ajustar si la suma difiere ligeramente de 100 debido a redondeo
    const finalDiff = 100 - getTotalWeight();
    if (finalDiff !== 0 && activities.length > 0) {
      activities[0].weight = Math.max(1, activities[0].weight + finalDiff);
    }

    renderModal();
  }

  function addActivity() {
    const remaining = Math.max(0, 100 - getTotalWeight());
    const defaultWeight = remaining > 0 ? remaining : 10;

    activities.push({
      id: `ACT-${project.code || 'PRJ'}-${Date.now()}-${activities.length + 1}`,
      name: '',
      weight: defaultWeight,
      progress: 0,
      status: 'Pendiente',
      assignedTo: [],
      deadline: project.deadline || new Date().toISOString().split('T')[0],
      deliverables: ''
    });
    renderModal();

    // Enfocar el último input agregado
    setTimeout(() => {
      const inputs = modalContainer.querySelectorAll('.act-name-input');
      if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
      }
    }, 100);
  }

  function removeActivity(index) {
    if (activities.length <= 1) {
      alert('El proyecto debe contar con al menos una actividad técnica en su desglose (WBS).');
      return;
    }

    const act = activities[index];
    const confirmMsg = act.progress > 0
      ? `La actividad "${act.name || 'Sin nombre'}" tiene un avance de ${act.progress}%. ¿Estás seguro de que deseas eliminarla del proyecto?`
      : `¿Deseas eliminar la actividad #${index + 1}?`;

    if (confirm(confirmMsg)) {
      activities.splice(index, 1);
      renderModal();
    }
  }

  function moveActivity(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= activities.length) return;
    const temp = activities[index];
    activities[index] = activities[targetIndex];
    activities[targetIndex] = temp;
    renderModal();
  }

  function toggleAssignee(actIndex, memberId) {
    const act = activities[actIndex];
    if (!act.assignedTo) act.assignedTo = [];
    const idx = act.assignedTo.indexOf(memberId);
    if (idx >= 0) {
      act.assignedTo.splice(idx, 1);
    } else {
      act.assignedTo.push(memberId);
    }
    renderModal();
  }

  function renderModal() {
    const totalWeight = getTotalWeight();
    const isBalanced = totalWeight === 100;
    const weightDiff = 100 - totalWeight;

    modalContainer.innerHTML = `
      <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
        <div class="glass-card bg-white rounded-3xl shadow-2xl max-w-4xl w-full border-2 border-unal-400/40 overflow-hidden flex flex-col max-h-[92vh]">
          
          <!-- Encabezado Institucional UNAL -->
          <div class="bg-gradient-to-r from-unal-900 via-unal-800 to-unal-700 p-5 text-white flex items-center justify-between border-b-2 border-unal-400 shrink-0">
            <div class="flex items-center space-x-3.5">
              <img src="./Diseno/Escudo_color.png" alt="Escudo UNAL" class="h-11 w-auto object-contain bg-white/95 p-1 rounded-xl shadow-sm">
              <div>
                <div class="flex items-center space-x-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-unal-400 text-unal-900">
                    ${project.code}
                  </span>
                  <span class="text-xs text-unal-300 font-semibold">• Configuración WBS y Tareas</span>
                </div>
                <h3 class="text-base sm:text-lg font-bold font-heading text-white leading-tight line-clamp-1" title="${project.name}">
                  ${project.name}
                </h3>
              </div>
            </div>

            <button id="btn-close-tasks-modal" class="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-unal-700/60 transition-all">
              <i data-lucide="x" class="w-6 h-6"></i>
            </button>
          </div>

          <!-- Barra de Control y Balanceo WBS -->
          <div class="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div class="flex items-center space-x-3">
              <div class="flex items-center space-x-1.5">
                <i data-lucide="layers" class="w-4 h-4 text-unal-700"></i>
                <span class="text-xs font-bold text-slate-800">${activities.length} ${activities.length === 1 ? 'Actividad' : 'Actividades'}</span>
              </div>

              <!-- Badge de Suma de Pesos -->
              <div class="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                isBalanced
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : totalWeight < 100
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-red-50 text-unal-red border-red-300'
              }">
                <i data-lucide="${isBalanced ? 'check-circle-2' : 'alert-circle'}" class="w-3.5 h-3.5"></i>
                <span>Suma de Pesos: ${totalWeight}%</span>
                ${!isBalanced ? `<span class="text-[10px] font-sans font-medium">(${weightDiff > 0 ? `Faltan ${weightDiff}%` : `Excede por ${Math.abs(weightDiff)}%`})</span>` : ''}
              </div>
            </div>

            <!-- Botones de Acción de Balanceo Rápido -->
            <div class="flex items-center space-x-2">
              <button type="button" id="btn-distribute-evenly" title="Repartir 100% en partes iguales" class="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs flex items-center space-x-1 transition-all">
                <i data-lucide="split" class="w-3.5 h-3.5 text-unal-700"></i>
                <span class="hidden sm:inline">Repartir Equitativamente</span>
                <span class="sm:hidden">Equitativo</span>
              </button>

              <button type="button" id="btn-normalize-weights" title="Ajustar proporcionalmente a 100%" class="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs flex items-center space-x-1 transition-all">
                <i data-lucide="scale" class="w-3.5 h-3.5 text-unal-700"></i>
                <span class="hidden sm:inline">Normalizar a 100%</span>
                <span class="sm:hidden">Ajustar 100%</span>
              </button>

              <button type="button" id="btn-add-activity-top" class="px-3 py-1.5 rounded-lg bg-unal-800 hover:bg-unal-700 text-white text-xs font-bold shadow-sm flex items-center space-x-1 transition-all">
                <i data-lucide="plus" class="w-3.5 h-3.5 text-unal-400"></i>
                <span>Nueva Tarea</span>
              </button>
            </div>
          </div>

          <!-- Lista de Tareas Scrollable -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-100/50">
            ${activities.map((act, idx) => {
              const assignedIds = act.assignedTo || [];
              const isCompleted = act.progress >= 100;

              return `
                <div class="glass-card bg-white rounded-2xl border ${isCompleted ? 'border-emerald-200' : 'border-slate-200'} p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-4" data-card-idx="${idx}">
                  
                  <!-- Fila 1: Orden, Nombre de la Tarea, Peso y Acciones de Fila -->
                  <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    
                    <div class="flex items-start space-x-3 flex-1">
                      <!-- Badge y Reordenamiento -->
                      <div class="flex flex-col items-center space-y-1 shrink-0 pt-1">
                        <span class="w-6 h-6 rounded-full bg-unal-100 text-unal-800 text-xs font-bold flex items-center justify-center font-mono">
                          ${idx + 1}
                        </span>
                        <div class="flex flex-col space-y-0.5">
                          <button type="button" data-action="move-up" data-idx="${idx}" ${idx === 0 ? 'disabled class="opacity-20 cursor-not-allowed"' : 'class="hover:text-unal-700 text-slate-400"'} title="Subir actividad">
                            <i data-lucide="chevron-up" class="w-3.5 h-3.5"></i>
                          </button>
                          <button type="button" data-action="move-down" data-idx="${idx}" ${idx === activities.length - 1 ? 'disabled class="opacity-20 cursor-not-allowed"' : 'class="hover:text-unal-700 text-slate-400"'} title="Bajar actividad">
                            <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>
                          </button>
                        </div>
                      </div>

                      <!-- Nombre de la Actividad -->
                      <div class="flex-1 space-y-1">
                        <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Nombre de la Actividad / Ensayo Geotécnico <span class="text-unal-red">*</span>
                        </label>
                        <input type="text" data-field="name" data-idx="${idx}" value="${act.name || ''}" placeholder="Ej: Ensayo de Corte Directo ASTM D3080, Caracterización de Muestras..." required class="act-name-input w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-unal-400 focus:ring-2 focus:ring-unal-400/20 bg-slate-50/50 focus:bg-white transition-all">
                      </div>
                    </div>

                    <!-- Peso y Botón Eliminar -->
                    <div class="flex items-center space-x-3 shrink-0 self-end sm:self-start pt-1">
                      <div class="space-y-1 text-right sm:text-left">
                        <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Peso (%) <span class="text-unal-red">*</span>
                        </label>
                        <div class="flex items-center space-x-1">
                          <input type="number" data-field="weight" data-idx="${idx}" value="${act.weight}" min="1" max="100" class="w-16 rounded-xl border border-slate-300 p-2 text-xs sm:text-sm text-center font-mono font-bold text-slate-800 outline-none focus:border-unal-400 focus:ring-2 focus:ring-unal-400/20 bg-slate-50/50 focus:bg-white transition-all">
                          <span class="text-xs font-bold text-slate-400">%</span>
                        </div>
                      </div>

                      <button type="button" data-action="delete" data-idx="${idx}" class="p-2 rounded-xl text-slate-400 hover:text-unal-red hover:bg-red-50 transition-all" title="Eliminar actividad">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </div>

                  </div>

                  <!-- Fila 2: Entregables y Fecha Límite -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
                    <div class="sm:col-span-2 space-y-1">
                      <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Entregable Técnico / Norma Aplicable
                      </label>
                      <input type="text" data-field="deliverables" data-idx="${idx}" value="${act.deliverables || ''}" placeholder="Ej: Curvas esfuerzo-deformación, Informe de ensayos ASTM..." class="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-700 outline-none focus:border-unal-400 bg-slate-50/30 focus:bg-white transition-all">
                    </div>

                    <div class="space-y-1">
                      <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Fecha Límite Específica
                      </label>
                      <input type="date" data-field="deadline" data-idx="${idx}" value="${act.deadline || project.deadline || ''}" class="w-full rounded-lg border border-slate-200 p-2 text-xs font-medium text-slate-700 outline-none focus:border-unal-400 bg-slate-50/30 focus:bg-white transition-all">
                    </div>
                  </div>

                  <!-- Fila 3: Estado, Avance Porcentual y Asignación de Integrantes -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 border-t border-slate-100">
                    
                    <!-- Estado -->
                    <div class="space-y-1">
                      <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Estado de la Actividad
                      </label>
                      <select data-field="status" data-idx="${idx}" class="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-800 outline-none focus:border-unal-400 bg-slate-50/30">
                        <option value="Pendiente" ${act.status === 'Pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
                        <option value="En Ejecución" ${act.status === 'En Ejecución' ? 'selected' : ''}>⚡ En Ejecución</option>
                        <option value="Completada" ${act.status === 'Completada' ? 'selected' : ''}>✅ Completada</option>
                      </select>
                    </div>

                    <!-- Avance Actual -->
                    <div class="space-y-1">
                      <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <span>Avance Reportado</span>
                        <span class="font-mono text-unal-700">${act.progress}%</span>
                      </div>
                      <div class="flex items-center space-x-2 pt-1">
                        <input type="range" data-field="progress" data-idx="${idx}" min="0" max="100" step="5" value="${act.progress || 0}" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-unal-500">
                        <input type="number" data-field="progress" data-idx="${idx}" min="0" max="100" value="${act.progress || 0}" class="w-14 rounded-lg border border-slate-200 p-1 text-center font-mono text-xs font-bold text-slate-800">
                      </div>
                    </div>

                    <!-- Asignación de Integrantes -->
                    <div class="space-y-1">
                      <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Integrantes Asignados (${assignedIds.length})
                      </label>
                      <div class="flex flex-wrap items-center gap-1.5 pt-0.5">
                        ${members.map(m => {
                          const isAssigned = assignedIds.includes(m.id);
                          return `
                            <button type="button" data-action="toggle-member" data-act-idx="${idx}" data-member-id="${m.id}" title="${m.name} (${m.role})" class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                              isAssigned
                                ? 'bg-unal-100 text-unal-900 border-unal-400 ring-1 ring-unal-400'
                                : 'bg-slate-100 text-slate-500 border-slate-200 opacity-60 hover:opacity-100'
                            }">
                              ${window.GeoUtils.renderMemberAvatar(m, 'xs')}
                              <span>${m.initials || m.name.split(' ')[0]}</span>
                            </button>
                          `;
                        }).join('')}
                      </div>
                    </div>

                  </div>

                </div>
              `;
            }).join('')}

            <!-- Botón Grande de Agregar Tarea -->
            <button type="button" id="btn-add-activity-bottom" class="w-full py-4 border-2 border-dashed border-unal-300 hover:border-unal-500 bg-white/80 hover:bg-unal-50/50 rounded-2xl text-unal-800 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-2xs">
              <i data-lucide="plus-circle" class="w-4 h-4 text-unal-600"></i>
              <span>Agregar Nueva Actividad Técnica al WBS</span>
            </button>
          </div>

          <!-- Pie del Modal: Acciones Finales -->
          <div class="bg-white border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div class="text-xs text-slate-500 flex items-center space-x-2">
              <i data-lucide="info" class="w-4 h-4 text-slate-400 shrink-0"></i>
              <span>Los cambios actualizarán el avance ponderado y la estructura de reporte en toda la plataforma.</span>
            </div>

            <div class="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <button type="button" id="btn-cancel-tasks" class="px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                Cancelar
              </button>

              <button type="button" id="btn-save-tasks" class="px-6 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-xs sm:text-sm shadow-md shadow-unal-400/30 transition-all flex items-center space-x-2">
                <i data-lucide="save" class="w-4 h-4"></i>
                <span>Guardar Configuración WBS</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Eventos de Navegación y Cierre
    modalContainer.querySelector('#btn-close-tasks-modal').addEventListener('click', () => {
      modalContainer.innerHTML = '';
      if (onClose) onClose();
    });

    modalContainer.querySelector('#btn-cancel-tasks').addEventListener('click', () => {
      modalContainer.innerHTML = '';
      if (onClose) onClose();
    });

    // Eventos de Balanceo
    modalContainer.querySelector('#btn-distribute-evenly').addEventListener('click', () => distributeEvenly());
    modalContainer.querySelector('#btn-normalize-weights').addEventListener('click', () => normalizeWeights());

    // Eventos de Agregar Actividad
    modalContainer.querySelector('#btn-add-activity-top').addEventListener('click', () => addActivity());
    modalContainer.querySelector('#btn-add-activity-bottom').addEventListener('click', () => addActivity());

    // Eventos en campos de las actividades (Live Binding)
    modalContainer.querySelectorAll('input[data-field], select[data-field]').forEach(input => {
      const idx = Number(input.getAttribute('data-idx'));
      const field = input.getAttribute('data-field');

      const handleInput = (e) => {
        let val = e.target.value;
        if (field === 'weight') {
          val = Number(val) || 0;
          activities[idx].weight = val;
          // Actualizar dinámicamente badge de pesos sin re-render completo para no perder foco
          const currentTotal = getTotalWeight();
          const badge = modalContainer.querySelector('.font-mono.border');
          if (badge) {
            const isNowBalanced = currentTotal === 100;
            const diff = 100 - currentTotal;
            badge.className = `flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold font-mono border ${
              isNowBalanced
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : currentTotal < 100
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-red-50 text-unal-red border-red-300'
            }`;
            badge.innerHTML = `
              <i data-lucide="${isNowBalanced ? 'check-circle-2' : 'alert-circle'}" class="w-3.5 h-3.5"></i>
              <span>Suma de Pesos: ${currentTotal}%</span>
              ${!isNowBalanced ? `<span class="text-[10px] font-sans font-medium">(${diff > 0 ? `Faltan ${diff}%` : `Excede por ${Math.abs(diff)}%`})</span>` : ''}
            `;
            if (window.lucide) window.lucide.createIcons();
          }
        } else if (field === 'progress') {
          val = Math.min(100, Math.max(0, Number(val) || 0));
          activities[idx].progress = val;
          if (val >= 100) {
            activities[idx].status = 'Completada';
          } else if (val > 0 && activities[idx].status === 'Pendiente') {
            activities[idx].status = 'En Ejecución';
          }
          // Sincronizar inputs hermano (range / number)
          const card = modalContainer.querySelector(`[data-card-idx="${idx}"]`);
          if (card) {
            card.querySelectorAll(`[data-field="progress"]`).forEach(i => i.value = val);
            const statusSelect = card.querySelector(`[data-field="status"]`);
            if (statusSelect) statusSelect.value = activities[idx].status;
            const progDisplay = card.querySelector('.font-mono.text-unal-700');
            if (progDisplay) progDisplay.textContent = `${val}%`;
          }
        } else if (field === 'status') {
          activities[idx].status = val;
          if (val === 'Completada' && activities[idx].progress < 100) {
            activities[idx].progress = 100;
          } else if (val === 'Pendiente' && activities[idx].progress > 0) {
            activities[idx].progress = 0;
          }
          const card = modalContainer.querySelector(`[data-card-idx="${idx}"]`);
          if (card) {
            card.querySelectorAll(`[data-field="progress"]`).forEach(i => i.value = activities[idx].progress);
            const progDisplay = card.querySelector('.font-mono.text-unal-700');
            if (progDisplay) progDisplay.textContent = `${activities[idx].progress}%`;
          }
        } else {
          activities[idx][field] = val;
        }
      };

      input.addEventListener('input', handleInput);
      input.addEventListener('change', handleInput);
    });

    // Reordenamiento y Eliminación
    modalContainer.querySelectorAll('[data-action="move-up"]').forEach(btn => {
      btn.addEventListener('click', () => moveActivity(Number(btn.getAttribute('data-idx')), -1));
    });

    modalContainer.querySelectorAll('[data-action="move-down"]').forEach(btn => {
      btn.addEventListener('click', () => moveActivity(Number(btn.getAttribute('data-idx')), 1));
    });

    modalContainer.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => removeActivity(Number(btn.getAttribute('data-idx'))));
    });

    // Toggle de Integrante Asignado
    modalContainer.querySelectorAll('[data-action="toggle-member"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const actIdx = Number(btn.getAttribute('data-act-idx'));
        const memberId = btn.getAttribute('data-member-id');
        toggleAssignee(actIdx, memberId);
      });
    });

    // Guardar Cambios
    modalContainer.querySelector('#btn-save-tasks').addEventListener('click', () => {
      // 1. Validar que ninguna actividad tenga el nombre vacío
      const emptyNameIdx = activities.findIndex(a => !a.name || !a.name.trim());
      if (emptyNameIdx !== -1) {
        alert(`La actividad #${emptyNameIdx + 1} no tiene nombre. Por favor ingresa el nombre de todas las actividades.`);
        const card = modalContainer.querySelector(`[data-card-idx="${emptyNameIdx}"]`);
        if (card) {
          const input = card.querySelector('.act-name-input');
          if (input) {
            input.focus();
            input.classList.add('ring-2', 'ring-red-500');
          }
        }
        return;
      }

      // 2. Validar suma de pesos
      const finalWeight = getTotalWeight();
      if (finalWeight !== 100) {
        const acceptNormalize = confirm(
          `La suma de los pesos de las actividades es de ${finalWeight}%. Debe sumar exactamente 100% para mantener la ponderación adecuada del proyecto.\n\n¿Deseas normalizar automáticamente los pesos para que sumen 100% y guardar?`
        );
        if (acceptNormalize) {
          normalizeWeights();
          // Proceder a guardar con pesos normalizados
        } else {
          return;
        }
      }

      // 3. Formatear y actualizar el proyecto
      project.activities = activities.map((a, i) => ({
        id: a.id || `ACT-${project.code || 'PRJ'}-${Date.now()}-${i + 1}`,
        name: a.name.trim(),
        weight: Number(a.weight),
        progress: Math.min(100, Math.max(0, Number(a.progress) || 0)),
        status: a.status || (a.progress >= 100 ? 'Completada' : a.progress > 0 ? 'En Ejecución' : 'Pendiente'),
        assignedTo: a.assignedTo || [],
        deadline: a.deadline || project.deadline,
        deliverables: (a.deliverables || '').trim()
      }));

      window.GeoStorage.updateProject(project);

      // Efecto confetti de éxito si está disponible
      if (window.confetti) {
        try {
          window.confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#94b43b', '#004f2d', '#ffffff']
          });
        } catch (e) {}
      }

      modalContainer.innerHTML = '';

      if (onSave) {
        onSave(project);
      }
    });
  }

  renderModal();
};
