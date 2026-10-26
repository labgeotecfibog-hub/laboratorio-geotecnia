/**
 * Componente Modal: Autenticación de Revisores y Coordinadores
 * Identidad Institucional: Universidad Nacional de Colombia • Laboratorio de Geotecnia
 */

window.GeoComponents = window.GeoComponents || {};

window.GeoComponents.renderLoginModal = function(isOpen, noticeMessage = '', onClose, onLoginSuccess) {
  const container = document.getElementById('login-modal-container');
  if (!container) return;

  if (!isOpen) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn" id="login-modal-backdrop">
      <div class="glass-card bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-unal-400/50 overflow-hidden transform transition-all">
        
        <!-- Header Institucional -->
        <div class="bg-gradient-to-r from-unal-900 via-unal-800 to-unal-700 p-6 text-white text-center relative border-b-2 border-unal-400">
          <button type="button" id="btn-close-login-modal" class="absolute top-4 right-4 text-slate-300 hover:text-white p-1 rounded-lg hover:bg-unal-700/60 transition-all">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>

          <div class="w-16 h-16 mx-auto mb-3 p-1.5 bg-white/95 rounded-2xl shadow-lg border border-unal-400/40 flex items-center justify-center">
            <img src="./Diseno/Escudo_color.png" alt="Escudo UNAL" class="h-12 w-auto object-contain">
          </div>

          <span class="text-[10px] font-extrabold uppercase tracking-widest text-unal-300 block">
            Universidad Nacional de Colombia
          </span>
          <h2 class="text-xl font-bold font-heading text-white mt-1">
            Apartado de Revisores
          </h2>
          <p class="text-xs text-slate-200 mt-1">
            Dirección y Coordinación del Laboratorio de Geotecnia
          </p>
        </div>

        <!-- Cuerpo del Formulario -->
        <div class="p-6 sm:p-7 space-y-5">
          
          ${noticeMessage ? `
            <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start space-x-2.5">
              <i data-lucide="shield-alert" class="w-4 h-4 text-amber-700 shrink-0 mt-0.5"></i>
              <div class="space-y-0.5">
                <span class="font-bold block">Acceso Restringido</span>
                <span>${noticeMessage}</span>
              </div>
            </div>
          ` : `
            <div class="p-3 rounded-xl bg-unal-50/80 border border-unal-200 text-xs text-unal-900 flex items-start space-x-2">
              <i data-lucide="shield-check" class="w-4 h-4 text-unal-700 shrink-0 mt-0.5"></i>
              <p>Inicia sesión con tus credenciales institucionales para acceder a la <strong>Bandeja de Aprobación de Avances</strong> y la gestión técnica de proyectos.</p>
            </div>
          `}

          <!-- Alert de Error de Login -->
          <div id="login-error-alert" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-unal-red font-semibold flex items-center space-x-2">
            <i data-lucide="alert-circle" class="w-4 h-4 text-unal-red shrink-0"></i>
            <span id="login-error-text">Credenciales inválidas</span>
          </div>

          <form id="reviewer-login-form" class="space-y-4">
            
            <!-- Usuario / Correo -->
            <div class="space-y-1">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Usuario o Correo Institucional
              </label>
              <div class="relative">
                <input type="text" id="login-username" required placeholder="Ej: dafrodriguezram o jecolmenaresm" class="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-unal-400 focus:ring-2 focus:ring-unal-400/20 transition-all">
                <i data-lucide="user" class="w-4 h-4 text-slate-400 absolute left-3.5 top-3"></i>
              </div>
            </div>

            <!-- Contraseña -->
            <div class="space-y-1">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Contraseña
              </label>
              <div class="relative">
                <input type="password" id="login-password" required placeholder="••••••••••••" class="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-unal-400 focus:ring-2 focus:ring-unal-400/20 transition-all">
                <i data-lucide="lock" class="w-4 h-4 text-slate-400 absolute left-3.5 top-3"></i>
                <button type="button" id="btn-toggle-password" class="text-slate-400 hover:text-slate-600 absolute right-3 top-3 focus:outline-none">
                  <i data-lucide="eye" class="w-4 h-4" id="eye-icon"></i>
                </button>
              </div>
            </div>

            <!-- Botón de Ingreso -->
            <button type="submit" id="btn-submit-login" class="w-full py-3 px-4 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-sm shadow-md shadow-unal-400/30 transition-all flex items-center justify-center space-x-2 transform active:scale-98">
              <i data-lucide="log-in" class="w-4 h-4 text-unal-900"></i>
              <span>Ingresar como Revisor</span>
            </button>
          </form>

          <!-- Acceso Rápido Institucional (Demo / Evaluador) -->
          <div class="pt-3 border-t border-slate-100 space-y-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Cuentas oficiales de revisores (Clic para autocompletar):
            </span>
            
            <div class="grid grid-cols-2 gap-2 text-[11px]">
              <button type="button" class="preset-btn p-2 rounded-xl bg-slate-50 hover:bg-unal-50 hover:border-unal-300 border border-slate-200 text-left transition-all" data-user="dafrodriguezram" data-pass="rodriguez2026">
                <span class="font-bold text-slate-800 block truncate">Ing. Daniel Rodríguez</span>
                <span class="text-[10px] text-slate-500 font-mono">dafrodriguezram</span>
              </button>

              <button type="button" class="preset-btn p-2 rounded-xl bg-slate-50 hover:bg-unal-50 hover:border-unal-300 border border-slate-200 text-left transition-all" data-user="jecolmenaresm" data-pass="colmenares2026">
                <span class="font-bold text-slate-800 block truncate">Prof. Julio Colmenares</span>
                <span class="text-[10px] text-slate-500 font-mono">jecolmenaresm</span>
              </button>

              <button type="button" class="preset-btn p-2 rounded-xl bg-slate-50 hover:bg-unal-50 hover:border-unal-300 border border-slate-200 text-left transition-all" data-user="eaprietos" data-pass="prieto2026">
                <span class="font-bold text-slate-800 block truncate">Ing. Edwin Prieto</span>
                <span class="text-[10px] text-slate-500 font-mono">eaprietos</span>
              </button>

              <button type="button" class="preset-btn p-2 rounded-xl bg-slate-50 hover:bg-unal-50 hover:border-unal-300 border border-slate-200 text-left transition-all" data-user="admin" data-pass="geotecnia2026">
                <span class="font-bold text-slate-800 block truncate">Administración</span>
                <span class="text-[10px] text-slate-500 font-mono">admin</span>
              </button>
            </div>
          </div>

          <!-- Volver al modo auxiliar -->
          <div class="text-center pt-1">
            <button type="button" id="btn-cancel-login" class="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
              Continuar en el Apartado de Estudiantes Auxiliares
            </button>
          </div>

        </div>

      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }

  const form = container.querySelector('#reviewer-login-form');
  const userInput = container.querySelector('#login-username');
  const passInput = container.querySelector('#login-password');
  const errorAlert = container.querySelector('#login-error-alert');
  const errorText = container.querySelector('#login-error-text');
  const togglePassBtn = container.querySelector('#btn-toggle-password');
  const eyeIcon = container.querySelector('#eye-icon');

  // Toggle mostrar contraseña
  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      if (eyeIcon) {
        eyeIcon.setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // Prellenar presets
  container.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const u = btn.getAttribute('data-user');
      const p = btn.getAttribute('data-pass');
      userInput.value = u;
      passInput.value = p;
      errorAlert.classList.add('hidden');
      passInput.focus();
    });
  });

  // Envío del formulario
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const result = window.GeoAuth.login(userInput.value, passInput.value, true);

    if (result.success) {
      container.innerHTML = '';
      if (onLoginSuccess) onLoginSuccess(result.user);
    } else {
      errorText.textContent = result.message;
      errorAlert.classList.remove('hidden');
      passInput.focus();
      passInput.select();
    }
  });

  // Cerrar modal
  const closeBtn = container.querySelector('#btn-close-login-modal');
  const cancelBtn = container.querySelector('#btn-cancel-login');
  const backdrop = container.querySelector('#login-modal-backdrop');

  const doClose = () => {
    container.innerHTML = '';
    if (onClose) onClose();
  };

  if (closeBtn) closeBtn.addEventListener('click', doClose);
  if (cancelBtn) cancelBtn.addEventListener('click', doClose);
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) doClose();
    });
  }
};
