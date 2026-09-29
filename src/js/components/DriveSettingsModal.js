/**
 * Componente Modal: Configuración de Google Drive y Copias de Seguridad
 * Identidad Visual: Universidad Nacional de Colombia • Laboratorio de Geotecnia
 */

window.GeoComponents = window.GeoComponents || {};

window.GeoComponents.renderDriveSettingsModal = function(isOpen, onClose) {
  const modalContainer = document.getElementById('quick-log-modal-container');
  if (!modalContainer) return;

  if (!isOpen) {
    modalContainer.innerHTML = '';
    return;
  }

  const driveConfig = window.GeoStorage.getDriveConfig();
  const gasCode = window.GeoDrive.getGoogleAppsScriptTemplate();
  const isConfigured = driveConfig.gasWebhookUrl && 
                       driveConfig.gasWebhookUrl.trim() !== '' && 
                       !driveConfig.gasWebhookUrl.includes('SampleGeoScriptId');

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div class="glass-card bg-white rounded-2xl shadow-2xl max-w-3xl w-full border-2 border-unal-400/40 overflow-hidden">
        
        <div class="bg-gradient-to-r from-unal-900 via-unal-800 to-unal-700 p-5 text-white flex items-center justify-between border-b-2 border-unal-400">
          <div class="flex items-center space-x-3">
            <img src="./Diseno/Escudo_color.png" alt="Escudo UNAL" class="h-10 w-auto object-contain bg-white/90 p-1 rounded-lg">
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="text-base sm:text-lg font-bold font-heading text-white">Google Drive Institucional UNAL</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isConfigured ? 'bg-emerald-400/30 text-emerald-200 border border-emerald-400/50' : 'bg-amber-400/30 text-amber-200 border border-amber-400/50'}">
                  ${isConfigured ? '● Conexión Nube Activa' : '○ Modo Local / Demo'}
                </span>
              </div>
              <p class="text-xs text-unal-300">Sincronización de anexos con cuenta institucional @unal.edu.co</p>
            </div>
          </div>
          <button id="btn-close-drive-modal" class="text-slate-300 hover:text-white p-1 rounded-lg">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>

        <div class="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs text-slate-700">
          
          <!-- Sección 1: Datos de la Cuenta y Carpeta Raíz -->
          <div class="p-4 rounded-xl bg-unal-50/50 border border-unal-200 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-900 uppercase text-xs flex items-center space-x-2">
                <i data-lucide="folder-git-2" class="w-4 h-4 text-unal-700"></i>
                <span>1. Estructura y Carpeta Raíz de Google Drive</span>
              </h4>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-unal-100 text-unal-800 border border-unal-300">
                Estructura Automática
              </span>
            </div>

            <p class="text-slate-600">
              Los anexos y ensayos se clasifican automáticamente en la siguiente jerarquía dentro de Google Drive:
            </p>
            <div class="p-2.5 rounded-lg bg-unal-900 text-unal-300 font-mono text-[11px] overflow-x-auto">
              📁 Laboratorio_Geotecnia / [Año] / [Extension_o_Investigacion] / [Codigo_Proyecto] / Anexos / Semana_[XX] / archivo.xlsx
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Cuenta Institucional Vinculada</label>
                <input type="email" id="drive-email-input" value="${driveConfig.accountEmail || 'labgeotec_fibog@unal.edu.co'}" placeholder="labgeotec_fibog@unal.edu.co" class="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-unal-400 outline-none">
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">ID Carpeta Raíz en Drive (Opcional)</label>
                <input type="text" id="drive-folder-id-input" value="${driveConfig.rootFolderId || ''}" placeholder="Dejar en blanco para crear 'Laboratorio_Geotecnia'" class="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono focus:border-unal-400 outline-none">
              </div>
            </div>
          </div>

          <!-- Sección 2: Script Webhook de Conexión Real -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-900 uppercase text-xs flex items-center space-x-2">
                <i data-lucide="code-2" class="w-4 h-4 text-unal-700"></i>
                <span>2. Código Google Apps Script para Subida Real</span>
              </h4>
              <button id="btn-copy-gas-code" class="px-2.5 py-1 rounded-lg bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-[11px] flex items-center space-x-1 shadow-sm">
                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                <span>Copiar Script</span>
              </button>
            </div>

            <p class="text-slate-600">
              Para habilitar la subida real a tu cuenta institucional: abre <a href="https://script.google.com" target="_blank" class="text-unal-700 underline font-bold">script.google.com</a> con tu cuenta @unal.edu.co > <strong>Nuevo proyecto</strong> > pega este código y publica como <strong>Aplicación Web</strong> (Ejecutar como: <em>Yo</em>, Acceso: <em>Cualquier usuario</em>).
            </p>

            <textarea readonly rows="6" class="w-full font-mono text-[11px] bg-slate-900 text-slate-200 p-3 rounded-xl outline-none select-all">${gasCode}</textarea>

            <div class="space-y-1.5 pt-1">
              <label class="block font-bold text-slate-700">URL de la Aplicación Web (Webhook GAS) *</label>
              <div class="flex flex-col sm:flex-row gap-2">
                <input type="text" id="drive-webhook-url" value="${driveConfig.gasWebhookUrl || ''}" placeholder="https://script.google.com/macros/s/.../exec" class="flex-1 rounded-xl border border-slate-300 p-2.5 text-xs font-mono focus:border-unal-400 outline-none">
                <button type="button" id="btn-test-connection" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shrink-0 transition-all">
                  <i data-lucide="activity" class="w-3.5 h-3.5 text-unal-400"></i>
                  <span>Probar Conexión</span>
                </button>
              </div>
              <div id="test-connection-result" class="hidden p-2.5 rounded-lg text-xs font-medium"></div>
            </div>
          </div>

          <!-- Sección 3: Sincronización y Respaldo de Base de Datos -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 class="font-bold text-slate-900 uppercase text-xs flex items-center space-x-2">
              <i data-lucide="database" class="w-4 h-4 text-emerald-600"></i>
              <span>3. Respaldo y Sincronización de Base de Datos</span>
            </h4>

            <div class="flex flex-wrap items-center gap-2.5">
              <button type="button" id="btn-sync-cloud-db" class="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all">
                <i data-lucide="cloud-upload" class="w-4 h-4"></i>
                <span>Sincronizar a Google Drive Ahora</span>
              </button>

              <button id="btn-export-backup" class="px-3.5 py-2 rounded-xl bg-unal-800 hover:bg-unal-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm">
                <i data-lucide="download" class="w-4 h-4 text-unal-400"></i>
                <span>Descargar Backup JSON</span>
              </button>

              <label class="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer flex items-center space-x-1.5">
                <i data-lucide="upload" class="w-4 h-4"></i>
                <span>Restaurar desde JSON</span>
                <input type="file" id="backup-file-input" class="hidden" accept=".json">
              </label>

              <button id="btn-reset-data" class="px-3 py-2 rounded-xl text-unal-red hover:bg-red-50 border border-red-200 font-bold text-xs ml-auto">
                Restablecer Demo
              </button>
            </div>
          </div>

          <!-- Sección 4: Envío Automático Semanal al Director (Cron Institucional) -->
          <div class="p-4 rounded-xl bg-unal-50/60 border border-unal-300 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-unal-900 uppercase text-xs flex items-center space-x-2">
                <i data-lucide="mail-check" class="w-4 h-4 text-unal-700"></i>
                <span>4. Envío Automático Semanal al Director (Activador Cron)</span>
              </h4>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Programación Semanal
              </span>
            </div>

            <p class="text-slate-600 leading-relaxed">
              El script incluye la función <code class="font-mono text-unal-900 bg-white px-1.5 py-0.5 rounded border border-unal-200 font-bold">configurarDisparadorViernes()</code> para enviar el informe semanal compilado al correo del Director <strong>automáticamente todos los viernes a las 17:00 (5:00 PM)</strong> con copia a los coordinadores, sin necesidad de que abras la plataforma web.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-unal-200 text-slate-700 text-[11px]">
              <div>
                <span class="text-slate-400 block font-bold uppercase text-[10px]">Destinatario Principal (Director):</span>
                <strong class="text-slate-900">Prof. Julio Esteban Colmenares, Ph.D.</strong>
                <p class="font-mono text-unal-800 text-[11px]">jecolmenaresm@unal.edu.co</p>
              </div>

              <div>
                <span class="text-slate-400 block font-bold uppercase text-[10px]">Con Copia (Coordinadores):</span>
                <p class="font-mono text-slate-700 text-[11px]">dfrodriguezr@unal.edu.co</p>
                <p class="font-mono text-slate-700 text-[11px]">eaprietos@unal.edu.co</p>
              </div>
            </div>

            <div class="p-2.5 rounded-lg bg-unal-900 text-unal-200 text-[11px] flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <i data-lucide="info" class="w-4 h-4 text-unal-400 shrink-0"></i>
                <span>Para activarlo: en Apps Script, selecciona la función <strong class="text-white">configurarDisparadorViernes</strong> y haz clic en <strong>Ejecutar</strong>.</span>
              </div>
            </div>
          </div>

          <!-- Pie del Modal -->
          <div class="pt-2 flex items-center justify-end space-x-3 border-t border-slate-200">
            <button type="button" id="btn-close-settings-footer" class="px-4 py-2 font-semibold text-slate-600">Cerrar</button>
            <button type="button" id="btn-save-drive-settings" class="px-5 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-sm shadow-md">
              Guardar Configuración
            </button>
          </div>

        </div>

      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  modalContainer.querySelector('#btn-close-drive-modal').addEventListener('click', onClose);
  modalContainer.querySelector('#btn-close-settings-footer').addEventListener('click', onClose);

  modalContainer.querySelector('#btn-copy-gas-code').addEventListener('click', () => {
    navigator.clipboard.writeText(gasCode);
    alert('¡Código de Google Apps Script copiado al portapapeles! Pégalo en tu editor de Apps Script.');
  });

  // Prueba de Conexión
  const testBtn = modalContainer.querySelector('#btn-test-connection');
  const testResult = modalContainer.querySelector('#test-connection-result');
  testBtn.addEventListener('click', async () => {
    const url = modalContainer.querySelector('#drive-webhook-url').value.trim();
    if (!url) {
      alert('Por favor ingresa primero la URL de tu aplicación web de Google Apps Script.');
      return;
    }

    testBtn.disabled = true;
    testBtn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>Probando...</span>`;
    if (window.lucide) window.lucide.createIcons();

    const res = await window.GeoDrive.testConnection(url);
    testBtn.disabled = false;
    testBtn.innerHTML = `<i data-lucide="activity" class="w-3.5 h-3.5 text-unal-400"></i><span>Probar Conexión</span>`;
    if (window.lucide) window.lucide.createIcons();

    testResult.classList.remove('hidden');
    if (res.success) {
      testResult.className = 'p-2.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center space-x-2';
      testResult.innerHTML = `
        <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600 shrink-0"></i>
        <span><strong>Conexión Exitosa:</strong> ${res.message} (${res.accountEmail})</span>
      `;
    } else {
      testResult.className = 'p-2.5 rounded-lg text-xs font-medium bg-red-50 text-unal-red border border-red-300 flex items-center space-x-2';
      testResult.innerHTML = `
        <i data-lucide="alert-triangle" class="w-4 h-4 text-unal-red shrink-0"></i>
        <span><strong>Fallo de Conexión:</strong> ${res.message}</span>
      `;
    }
    if (window.lucide) window.lucide.createIcons();
  });

  // Sincronizar Base de Datos en Drive
  const syncBtn = modalContainer.querySelector('#btn-sync-cloud-db');
  syncBtn.addEventListener('click', async () => {
    syncBtn.disabled = true;
    syncBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Sincronizando...</span>`;
    if (window.lucide) window.lucide.createIcons();

    const res = await window.GeoDrive.syncDatabaseToDrive();
    syncBtn.disabled = false;
    syncBtn.innerHTML = `<i data-lucide="cloud-upload" class="w-4 h-4"></i><span>Sincronizar a Google Drive Ahora</span>`;
    if (window.lucide) window.lucide.createIcons();

    if (res && res.status === 'success') {
      alert('¡Base de datos sincronizada con éxito en tu Google Drive Institucional!');
    } else {
      alert('No se pudo sincronizar con Drive: ' + (res.message || 'Verifica la URL del Webhook.'));
    }
  });

  modalContainer.querySelector('#btn-save-drive-settings').addEventListener('click', () => {
    const updated = {
      ...driveConfig,
      accountEmail: modalContainer.querySelector('#drive-email-input').value.trim(),
      rootFolderId: modalContainer.querySelector('#drive-folder-id-input').value.trim(),
      gasWebhookUrl: modalContainer.querySelector('#drive-webhook-url').value.trim()
    };
    window.GeoStorage.saveDriveConfig(updated);
    alert('Configuración guardada correctamente.');
    onClose();
  });

  modalContainer.querySelector('#btn-export-backup').addEventListener('click', () => {
    window.GeoStorage.exportBackup();
  });

  modalContainer.querySelector('#backup-file-input').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const ok = window.GeoStorage.importBackup(event.target.result);
        if (ok) {
          alert('¡Datos restaurados con éxito!');
          window.location.reload();
        } else {
          alert('Error al leer el archivo JSON.');
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  });

  modalContainer.querySelector('#btn-reset-data').addEventListener('click', () => {
    if (confirm('¿Deseas restablecer todos los proyectos y datos a los de demostración inicial?')) {
      window.GeoStorage.resetToInitial();
      window.location.reload();
    }
  });
};

