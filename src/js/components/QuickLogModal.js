/**
 * Componente Modal: Formulario de Registro Ágil de Avance ("Kiosco")
 * Identidad Visual: Universidad Nacional de Colombia • Laboratorio de Geotecnia
 */

window.GeoComponents = window.GeoComponents || {};

window.GeoComponents.renderQuickLogModal = function(isOpen, onClose, onSuccess) {
  const modalContainer = document.getElementById('quick-log-modal-container');
  if (!modalContainer) return;

  if (!isOpen) {
    modalContainer.innerHTML = '';
    return;
  }

  const members = window.GeoStorage.getMembers().filter(m => m.active);
  const projects = window.GeoStorage.getProjects().filter(p => p.status !== 'Finalizado');

  let selectedFiles = [];

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div class="glass-card bg-white rounded-2xl shadow-2xl max-w-2xl w-full border-2 border-unal-400/40 overflow-hidden transform transition-all">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-unal-900 via-unal-800 to-unal-700 p-5 text-white flex items-center justify-between border-b-2 border-unal-400">
          <div class="flex items-center space-x-3">
            <img src="./Diseno/Escudo_color.png" alt="Escudo UNAL" class="h-10 w-auto object-contain bg-white/90 p-1 rounded-lg">
            <div>
              <h3 class="text-base sm:text-lg font-bold font-heading text-white">Registro Ágil de Avance Geotécnico</h3>
              <p class="text-xs text-unal-300 font-medium">Universidad Nacional de Colombia • Laboratorio de Geotecnia</p>
            </div>
          </div>
          <button id="btn-close-modal" class="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-unal-700/60 transition-all">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>

        <!-- Form Body -->
        <form id="quick-log-form" class="p-6 space-y-5">
          
          <!-- 1. Integrante Selector -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
              <span>1. ¿Quién realizó el ensayo o actividad? <span class="text-unal-red">*</span></span>
              <span class="text-[11px] text-slate-400 font-normal">Acceso público sin contraseña</span>
            </label>
            <select id="log-member-id" required class="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:bg-white focus:border-unal-400 focus:ring-2 focus:ring-unal-400/20 outline-none transition-all">
              <option value="">-- Selecciona tu nombre --</option>
              ${members.map(m => `
                <option value="${m.id}">${m.name} (${m.role})</option>
              `).join('')}
            </select>
          </div>

          <!-- 2. Proyecto y Actividad -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                2. Proyecto <span class="text-unal-red">*</span>
              </label>
              <select id="log-project-id" required class="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:bg-white focus:border-unal-400 focus:ring-2 focus:ring-unal-400/20 outline-none transition-all">
                <option value="">-- Selecciona Proyecto --</option>
                ${projects.map(p => `
                  <option value="${p.id}">[${p.type}] ${p.code} - ${p.name.substring(0, 45)}...</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                3. Actividad Específica <span class="text-unal-red">*</span>
              </label>
              <select id="log-activity-id" required disabled class="w-full rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-600 font-medium focus:bg-white focus:border-unal-400 focus:ring-2 focus:ring-unal-400/20 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                <option value="">-- Primero elige un proyecto --</option>
              </select>
            </div>
          </div>

          <!-- Activity Info Banner -->
          <div id="activity-info-banner" class="hidden p-3 rounded-xl bg-unal-50 border border-unal-300 text-xs text-unal-900 flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <i data-lucide="info" class="w-4 h-4 text-unal-700 shrink-0"></i>
              <span id="activity-info-text">Peso: 25% | Avance actual: 40%</span>
            </div>
            <span class="font-bold text-unal-800" id="activity-deliverable-text"></span>
          </div>

          <!-- 3. Porcentaje Alcanzado y Horas -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Nuevo % de la Actividad <span class="text-unal-red">*</span></span>
                <span id="progress-val-display" class="font-bold text-unal-700 text-sm">0%</span>
              </label>
              <div class="flex items-center space-x-3">
                <input type="range" id="log-progress-range" min="0" max="100" step="5" value="0" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-unal-500">
                <input type="number" id="log-progress-num" min="0" max="100" value="0" class="w-16 rounded-lg border border-slate-300 px-2 py-1 text-center text-sm font-bold text-slate-800">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Horas dedicadas hoy <span class="text-unal-red">*</span>
              </label>
              <div class="relative">
                <input type="number" id="log-hours" step="0.5" min="0.5" max="24" value="4" required class="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:bg-white focus:border-unal-400 focus:ring-2 focus:ring-unal-400/20 outline-none transition-all pl-9">
                <i data-lucide="clock" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>
              </div>
            </div>
          </div>

          <!-- 4. Descripción del Avance -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Descripción del trabajo realizado y resultados obtenidos <span class="text-unal-red">*</span>
            </label>
            <textarea id="log-notes" rows="3" required placeholder="Ej: Se realizaron 2 ensayos de corte directo según norma ASTM D3080 a tensiones de 100 y 200 kPa. Se procesaron los datos en Excel y se adjunta la curva esfuerzo-deformación..." class="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-sm text-slate-800 focus:bg-white focus:border-unal-400 focus:ring-2 focus:ring-unal-400/20 outline-none transition-all placeholder:text-slate-400"></textarea>
          </div>

          <!-- 5. Anexos y Evidencias -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Anexos / Evidencias (PDF, Excel, Fotos de ensayos)</span>
              <span class="text-[11px] text-unal-700 font-semibold flex items-center space-x-1">
                <i data-lucide="cloud" class="w-3 h-3 text-unal-600"></i>
                <span>Sincronización en Google Drive Institucional</span>
              </span>
            </label>
            
            <div id="dropzone" class="border-2 border-dashed border-slate-300 hover:border-unal-400 hover:bg-unal-50/40 rounded-xl p-4 text-center cursor-pointer transition-all">
              <input type="file" id="file-input" multiple class="hidden" accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.png,.jpg,.jpeg">
              <div class="flex flex-col items-center justify-center space-y-1">
                <i data-lucide="upload-cloud" class="w-8 h-8 text-unal-600"></i>
                <p class="text-sm font-semibold text-slate-700">Arrastra archivos aquí o haz clic para examinar</p>
                <p class="text-xs text-slate-400">Archivos soportados: Excel (.xlsx, .csv), PDF, JPG, PNG (máx. 25MB)</p>
              </div>
            </div>

            <!-- Selected Files List -->
            <div id="selected-files-list" class="mt-2 space-y-1.5"></div>
            
            <!-- Path Preview -->
            <div id="drive-path-preview" class="hidden mt-2 p-2 rounded-lg bg-slate-100 text-[11px] font-mono text-slate-600 border border-slate-200">
              <span class="font-bold text-slate-700">Ruta en Google Drive:</span> <span id="drive-path-text" class="text-unal-800"></span>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button type="button" id="btn-cancel-modal" class="px-4 py-2.5 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-all">
              Cancelar
            </button>
            <button type="submit" id="btn-submit-log" class="px-6 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-sm shadow-md shadow-unal-400/25 hover:shadow-lg transition-all flex items-center space-x-2">
              <i data-lucide="send" class="w-4 h-4"></i>
              <span>Enviar para Revisión</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const projectSelect = modalContainer.querySelector('#log-project-id');
  const activitySelect = modalContainer.querySelector('#log-activity-id');
  const activityBanner = modalContainer.querySelector('#activity-info-banner');
  const activityInfoText = modalContainer.querySelector('#activity-info-text');
  const progressRange = modalContainer.querySelector('#log-progress-range');
  const progressNum = modalContainer.querySelector('#log-progress-num');
  const progressDisplay = modalContainer.querySelector('#progress-val-display');
  const fileInput = modalContainer.querySelector('#file-input');
  const dropzone = modalContainer.querySelector('#dropzone');
  const filesList = modalContainer.querySelector('#selected-files-list');
  const drivePathPreview = modalContainer.querySelector('#drive-path-preview');
  const drivePathText = modalContainer.querySelector('#drive-path-text');

  const syncProgress = (val) => {
    val = Math.min(100, Math.max(0, Number(val) || 0));
    progressRange.value = val;
    progressNum.value = val;
    progressDisplay.textContent = `${val}%`;
  };

  progressRange.addEventListener('input', (e) => syncProgress(e.target.value));
  progressNum.addEventListener('input', (e) => syncProgress(e.target.value));

  projectSelect.addEventListener('change', () => {
    const projId = projectSelect.value;
    if (!projId) {
      activitySelect.innerHTML = '<option value="">-- Primero elige un proyecto --</option>';
      activitySelect.disabled = true;
      activitySelect.classList.add('bg-slate-100');
      activityBanner.classList.add('hidden');
      drivePathPreview.classList.add('hidden');
      return;
    }

    const selectedProj = projects.find(p => p.id === projId);
    if (!selectedProj || !selectedProj.activities) return;

    activitySelect.disabled = false;
    activitySelect.classList.remove('bg-slate-100');
    activitySelect.innerHTML = `
      <option value="">-- Selecciona Actividad --</option>
      ${selectedProj.activities.map(a => `
        <option value="${a.id}">[Peso ${a.weight}%] ${a.name} (Actual: ${a.progress}%)</option>
      `).join('')}
    `;

    drivePathPreview.classList.remove('hidden');
    drivePathText.textContent = window.GeoDrive.generateDrivePath(selectedProj, '[Nombre_Archivo]');
  });

  activitySelect.addEventListener('change', () => {
    const projId = projectSelect.value;
    const actId = activitySelect.value;
    const selectedProj = projects.find(p => p.id === projId);
    if (!selectedProj) return;

    const act = selectedProj.activities.find(a => a.id === actId);
    if (act) {
      activityBanner.classList.remove('hidden');
      activityInfoText.innerHTML = `<strong>Peso en proyecto:</strong> ${act.weight}% &nbsp;|&nbsp; <strong>Avance previo:</strong> ${act.progress}% &nbsp;|&nbsp; <strong>Estado:</strong> ${act.status}`;
      syncProgress(act.progress);
    } else {
      activityBanner.classList.add('hidden');
    }
  });

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-unal-400', 'bg-unal-50/50');
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('border-unal-400', 'bg-unal-50/50');
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-unal-400', 'bg-unal-50/50');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      handleFiles(Array.from(fileInput.files));
    }
  });

  function handleFiles(files) {
    selectedFiles = [...selectedFiles, ...files];
    renderFilesList();
  }

  function renderFilesList() {
    filesList.innerHTML = selectedFiles.map((f, idx) => `
      <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
        <div class="flex items-center space-x-2 truncate">
          <i data-lucide="file-check" class="w-4 h-4 text-emerald-600 shrink-0"></i>
          <span class="font-medium text-slate-800 truncate">${f.name}</span>
          <span class="text-slate-400">(${(f.size / (1024 * 1024)).toFixed(2)} MB)</span>
        </div>
        <button type="button" data-remove-file="${idx}" class="text-unal-red hover:text-red-700 p-1">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `).join('');

    filesList.querySelectorAll('[data-remove-file]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(btn.getAttribute('data-remove-file'));
        selectedFiles.splice(idx, 1);
        renderFilesList();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  modalContainer.querySelector('#btn-close-modal').addEventListener('click', onClose);
  modalContainer.querySelector('#btn-cancel-modal').addEventListener('click', onClose);

  const form = modalContainer.querySelector('#quick-log-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const memberId = modalContainer.querySelector('#log-member-id').value;
    const projectId = modalContainer.querySelector('#log-project-id').value;
    const activityId = modalContainer.querySelector('#log-activity-id').value;
    const progressReported = Number(progressNum.value);
    const hoursWorked = Number(modalContainer.querySelector('#log-hours').value);
    const notes = modalContainer.querySelector('#log-notes').value.trim();

    const member = members.find(m => m.id === memberId);
    const project = projects.find(p => p.id === projectId);

    if (!member || !project || !activityId) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    const submitBtn = modalContainer.querySelector('#btn-submit-log');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Preparando envío...</span>`;
    if (window.lucide) window.lucide.createIcons();

    const attachments = [];
    let fileIndex = 1;
    for (const f of selectedFiles) {
      submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Subiendo ${fileIndex}/${selectedFiles.length} a Drive...</span>`;
      if (window.lucide) window.lucide.createIcons();
      try {
        const uploaded = await window.GeoDrive.uploadFileToDrive(f, project);
        attachments.push(uploaded);
      } catch (err) {
        console.warn('Error subiendo anexo:', err);
      }
      fileIndex++;
    }

    window.GeoStorage.addLog({
      projectId,
      activityId,
      memberId,
      memberName: member.name,
      hoursWorked,
      progressReported,
      notes,
      attachments
    });

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    onClose();
    if (onSuccess) onSuccess();
  });
};
