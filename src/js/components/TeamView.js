/**
 * Componente: Gestión de Integrantes y Equipo del Laboratorio
 * Identidad Visual: Universidad Nacional de Colombia • Laboratorio de Geotecnia
 */

window.GeoComponents = window.GeoComponents || {};

window.GeoComponents.renderTeamView = function(container) {
  function render() {
    const members = window.GeoStorage.getMembers();
    const logs = window.GeoStorage.getLogs();
    const projects = window.GeoStorage.getProjects();

    container.innerHTML = `
      <div class="space-y-6 animate-fadeIn">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold font-heading text-slate-900">Equipo e Integrantes del Laboratorio</h1>
            <p class="text-xs sm:text-sm text-slate-500">Docentes, investigadores, tesistas de posgrado y auxiliares de laboratorio • UNAL Sede Bogotá</p>
          </div>

          <button id="btn-add-member" class="px-4 py-2.5 rounded-xl bg-unal-800 hover:bg-unal-700 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2">
            <i data-lucide="user-plus" class="w-4 h-4 text-unal-400"></i>
            <span>Nuevo Integrante</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${members.map(m => {
            const memberLogs = logs.filter(l => l.memberId === m.id);
            const totalHours = memberLogs.reduce((sum, l) => sum + (Number(l.hoursWorked) || 0), 0);
            const approvedActivities = memberLogs.filter(l => l.status === 'Aprobado').length;

            const assignedProjects = projects.filter(p => 
              (p.activities || []).some(a => (a.assignedTo || []).includes(m.id))
            );

            return `
              <div class="glass-card rounded-2xl border border-slate-200 p-5 space-y-4 hover:shadow-md hover:border-unal-400 transition-all">
                
                <div class="flex items-start space-x-3.5">
                  ${window.GeoUtils.renderMemberAvatar(m, 'xl')}
                  <div class="space-y-0.5 flex-1 min-w-0">
                    <div class="flex items-center space-x-1.5">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-unal-100 text-unal-800">
                        ${m.category}
                      </span>
                      ${m.initials ? `
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200" title="Siglas de identificación en tablero">
                          ${m.initials}
                        </span>
                      ` : ''}
                    </div>
                    <h3 class="font-bold text-slate-900 text-base truncate" title="${m.name}">${m.name}</h3>
                    <p class="text-xs text-slate-500 truncate">${m.role}</p>
                    <p class="text-[11px] text-unal-700 font-mono">${m.email}</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center text-xs">
                  <div>
                    <span class="text-[10px] text-slate-400 font-bold uppercase">Horas Registradas</span>
                    <p class="font-black text-slate-800 text-sm mt-0.5">${totalHours.toFixed(1)} hrs</p>
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 font-bold uppercase">Ensayos Validados</span>
                    <p class="font-black text-emerald-700 text-sm mt-0.5">${approvedActivities}</p>
                  </div>
                </div>

                <div class="space-y-1.5 pt-1">
                  <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Proyectos Asignados (${assignedProjects.length}):</span>
                  <div class="flex flex-wrap gap-1.5">
                    ${assignedProjects.length === 0 ? `
                      <span class="text-[11px] text-slate-400 italic">Sin asignaciones directas</span>
                    ` : assignedProjects.map(p => `
                      <span class="px-2 py-0.5 rounded-md bg-unal-50 text-unal-800 border border-unal-200 font-mono text-[10px] font-semibold">
                        ${p.code}
                      </span>
                    `).join('')}
                  </div>
                </div>

                <!-- Botones de Acción de Integrante -->
                <div class="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                  <span class="text-[10px] font-mono text-slate-400 font-bold">${m.id}</span>
                  <div class="flex items-center space-x-1.5">
                    <button type="button" data-edit-member="${m.id}" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1 transition-all">
                      <i data-lucide="edit-3" class="w-3 h-3 text-slate-600"></i>
                      <span>Editar</span>
                    </button>
                    ${m.id !== 'MEM-001' ? `
                      <button type="button" data-delete-member="${m.id}" title="Eliminar integrante" class="p-1 rounded-lg text-slate-400 hover:text-unal-red hover:bg-red-50 transition-all">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    ` : ''}
                  </div>
                </div>

              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;

    container.querySelector('#btn-add-member').addEventListener('click', () => {
      const modalHost = document.getElementById('quick-log-modal-container');
      modalHost.innerHTML = `
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div class="glass-card bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-unal-400/40 overflow-hidden">
            
            <div class="bg-gradient-to-r from-unal-900 via-unal-800 to-unal-700 p-4 text-white flex items-center justify-between border-b-2 border-unal-400">
              <div class="flex items-center space-x-2">
                <img src="./Diseno/Escudo_color.png" alt="Escudo UNAL" class="h-8 w-auto object-contain bg-white/90 p-0.5 rounded">
                <h3 class="font-bold font-heading text-white text-sm sm:text-base">Registrar Nuevo Integrante</h3>
              </div>
              <button id="btn-close-team-modal" class="text-slate-300 hover:text-white p-1">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <form id="new-member-form" class="p-5 space-y-3.5 text-xs">
              <div>
                <label class="block font-bold text-slate-700 uppercase mb-1">Nombre Completo *</label>
                <input type="text" id="new-mem-name" required placeholder="Ej: Ing. Laura Gómez" class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400">
              </div>

              <div>
                <label class="block font-bold text-slate-700 uppercase mb-1">Cargo / Rol en el Laboratorio *</label>
                <input type="text" id="new-mem-role" required placeholder="Ej: Auxiliar de Ensayos Especiales" class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400">
              </div>

              <div>
                <label class="block font-bold text-slate-700 uppercase mb-1">Categoría *</label>
                <select id="new-mem-cat" required class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400">
                  <option value="Pregrado / Auxiliar">Pregrado / Auxiliar de Laboratorio</option>
                  <option value="Tesista / Posgrado">Tesista / Estudiante de Posgrado (M.Sc./Ph.D.)</option>
                  <option value="Investigador Principal">Investigador / Especialista</option>
                  <option value="Docente / Director">Docente / Director</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 uppercase mb-1">Correo Institucional (@unal.edu.co) *</label>
                <input type="email" id="new-mem-email" required placeholder="lgomez@unal.edu.co" class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400">
              </div>

              <div class="pt-3 flex items-center justify-end space-x-2 border-t border-slate-200">
                <button type="button" id="btn-cancel-mem" class="px-3 py-2 font-semibold text-slate-600">Cancelar</button>
                <button type="submit" class="px-5 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-sm shadow-md">
                  Guardar Integrante
                </button>
              </div>
            </form>

          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      modalHost.querySelector('#btn-close-team-modal').addEventListener('click', () => modalHost.innerHTML = '');
      modalHost.querySelector('#btn-cancel-mem').addEventListener('click', () => modalHost.innerHTML = '');

      modalHost.querySelector('#new-member-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = modalHost.querySelector('#new-mem-name').value.trim();
        const role = modalHost.querySelector('#new-mem-role').value.trim();
        const category = modalHost.querySelector('#new-mem-cat').value;
        const email = modalHost.querySelector('#new-mem-email').value.trim();

        const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 5);

        window.GeoStorage.addMember({
          name,
          initials,
          role,
          category,
          email,
          avatar: null
        });

        modalHost.innerHTML = '';
        render();
      });
    });

    // Eventos de Editar y Eliminar Integrantes
    container.querySelectorAll('[data-edit-member]').forEach(btn => {
      btn.addEventListener('click', () => {
        const memId = btn.getAttribute('data-edit-member');
        const member = members.find(m => m.id === memId);
        if (member) {
          openEditMemberModal(member);
        }
      });
    });

    container.querySelectorAll('[data-delete-member]').forEach(btn => {
      btn.addEventListener('click', () => {
        const memId = btn.getAttribute('data-delete-member');
        const member = members.find(m => m.id === memId);
        if (member) {
          const confirmDel = confirm(`¿Estás seguro de que deseas retirar a "${member.name}" (${member.role}) del equipo del laboratorio?`);
          if (confirmDel) {
            window.GeoStorage.deleteMember(memId);
            render();
          }
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function openEditMemberModal(member) {
    const modalHost = document.getElementById('quick-log-modal-container');
    if (!modalHost) return;

    modalHost.innerHTML = `
      <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div class="glass-card bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-unal-400/40 overflow-hidden">
          
          <div class="bg-gradient-to-r from-unal-900 via-unal-800 to-unal-700 p-4 text-white flex items-center justify-between border-b-2 border-unal-400">
            <div class="flex items-center space-x-2">
              <img src="./Diseno/Escudo_color.png" alt="Escudo UNAL" class="h-8 w-auto object-contain bg-white/90 p-0.5 rounded">
              <div>
                <h3 class="font-bold font-heading text-white text-sm sm:text-base">Editar Integrante</h3>
                <span class="text-[10px] text-unal-300 font-mono">${member.id}</span>
              </div>
            </div>
            <button id="btn-close-edit-team-modal" class="text-slate-300 hover:text-white p-1">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="edit-member-form" class="p-5 space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Nombre Completo *</label>
              <input type="text" id="edit-mem-name" required value="${member.name || ''}" class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 uppercase mb-1">Siglas / Iniciales *</label>
                <input type="text" id="edit-mem-initials" required value="${member.initials || ''}" maxlength="6" class="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-mono uppercase font-bold outline-none focus:border-unal-400">
              </div>

              <div>
                <label class="block font-bold text-slate-700 uppercase mb-1">Estado</label>
                <select id="edit-mem-active" class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400 font-semibold">
                  <option value="true" ${member.active !== false ? 'selected' : ''}>🟢 Activo</option>
                  <option value="false" ${member.active === false ? 'selected' : ''}>⚪ Inactivo</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Cargo / Rol en el Laboratorio *</label>
              <input type="text" id="edit-mem-role" required value="${member.role || ''}" class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400">
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Categoría *</label>
              <select id="edit-mem-cat" required class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400">
                <option value="Pregrado / Auxiliar" ${member.category === 'Pregrado / Auxiliar' ? 'selected' : ''}>Pregrado / Auxiliar de Laboratorio</option>
                <option value="Tesista / Posgrado" ${member.category === 'Tesista / Posgrado' || member.category === 'Investigador / Posgrado' || member.category === 'Investigador / Tesista' ? 'selected' : ''}>Tesista / Estudiante de Posgrado (M.Sc./Ph.D.)</option>
                <option value="Investigador / Coordinador" ${member.category === 'Investigador / Coordinador' ? 'selected' : ''}>Investigador / Coordinador</option>
                <option value="Investigador Principal" ${member.category === 'Investigador Principal' ? 'selected' : ''}>Investigador / Especialista</option>
                <option value="Docente / Director" ${member.category === 'Docente / Director' ? 'selected' : ''}>Docente / Director</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Correo Institucional (@unal.edu.co) *</label>
              <input type="email" id="edit-mem-email" required value="${member.email || ''}" class="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-unal-400">
            </div>

            <div class="pt-3 flex items-center justify-end space-x-2 border-t border-slate-200">
              <button type="button" id="btn-cancel-edit-mem" class="px-3 py-2 font-semibold text-slate-600">Cancelar</button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-sm shadow-md">
                Guardar Cambios
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    modalHost.querySelector('#btn-close-edit-team-modal').addEventListener('click', () => modalHost.innerHTML = '');
    modalHost.querySelector('#btn-cancel-edit-mem').addEventListener('click', () => modalHost.innerHTML = '');

    modalHost.querySelector('#edit-member-form').addEventListener('submit', (e) => {
      e.preventDefault();
      member.name = modalHost.querySelector('#edit-mem-name').value.trim();
      member.initials = modalHost.querySelector('#edit-mem-initials').value.trim().toUpperCase();
      member.active = modalHost.querySelector('#edit-mem-active').value === 'true';
      member.role = modalHost.querySelector('#edit-mem-role').value.trim();
      member.category = modalHost.querySelector('#edit-mem-cat').value;
      member.email = modalHost.querySelector('#edit-mem-email').value.trim();

      window.GeoStorage.updateMember(member);
      modalHost.innerHTML = '';
      render();
    });
  }

  render();
};

