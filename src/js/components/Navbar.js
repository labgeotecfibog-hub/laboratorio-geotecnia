/**
 * Componente Navbar Principal - Universidad Nacional de Colombia
 * Identidad Visual UNAL • Laboratorio de Geotecnia
 * 
 * Gestiona la separación en dos apartados:
 * 1. Apartado de Estudiantes Auxiliares (Modo Abierto): Registro de avances, consulta de proyectos y equipo.
 * 2. Apartado de Revisores (Modo Autenticado): Aprobación de avances, gestión técnica WBS y Drive.
 */

window.GeoComponents = window.GeoComponents || {};

window.GeoComponents.renderNavbar = function(activeTab, onTabChange, onOpenQuickLog, onOpenDriveConfig, onOpenLogin, onLogout) {
  const logs = window.GeoStorage ? window.GeoStorage.getLogs() : [];
  const pendingCount = logs.filter(l => l.status === 'Pendiente').length;
  const isReviewer = window.GeoAuth ? window.GeoAuth.isReviewer() : false;
  const currentUser = isReviewer ? window.GeoAuth.getCurrentUser() : null;

  const navContainer = document.getElementById('navbar-container');
  if (!navContainer) return;

  navContainer.innerHTML = `
    <nav class="glass-nav sticky top-0 z-40 text-white shadow-xl">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20 gap-2 sm:gap-4">
          
          <!-- Logo & UNAL Brand Identity -->
          <div class="flex items-center space-x-3 cursor-pointer py-1 shrink-0 select-none" id="nav-brand-btn">
            <div class="h-12 w-auto flex items-center justify-center p-1 bg-white/95 rounded-xl border border-unal-400/40 shadow-sm shrink-0">
              <img src="./Diseno/Escudo_color.png" alt="Escudo UNAL" class="h-10 w-auto object-contain">
            </div>
            
            <div class="border-l border-unal-400/30 pl-3 flex flex-col justify-center">
              <div class="flex items-center space-x-2">
                <span class="font-extrabold text-xs sm:text-sm xl:text-base tracking-tight text-white font-heading whitespace-nowrap leading-tight">
                  UNIVERSIDAD NACIONAL DE COLOMBIA
                </span>
              </div>
              <div class="flex items-center space-x-2 whitespace-nowrap mt-0.5">
                <span class="text-[10px] sm:text-[11px] font-bold text-unal-400 uppercase tracking-wide whitespace-nowrap">
                  Laboratorio de Geotecnia
                </span>
                
                <!-- Badge de Apartado Activo -->
                ${isReviewer ? `
                  <span class="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 inline-flex items-center space-x-1 shrink-0 whitespace-nowrap" title="Apartado con permisos de Aprobación y Coordinación">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>Modo Revisor</span>
                  </span>
                ` : `
                  <span class="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 inline-flex items-center space-x-1 shrink-0 whitespace-nowrap" title="Apartado abierto para Estudiantes Auxiliares">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Modo Auxiliares</span>
                  </span>
                `}
              </div>
            </div>
          </div>

          <!-- Navigation Links (Desktop: >= xl) -->
          <div class="hidden xl:flex items-center space-x-1 shrink-0">
            <button class="nav-tab px-2.5 2xl:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 ${activeTab === 'dashboard' ? 'bg-unal-400 text-unal-900 shadow-md shadow-unal-400/25' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="dashboard">
              <i data-lucide="layout-dashboard" class="w-3.5 h-3.5 shrink-0"></i>
              <span>Tablero</span>
            </button>

            <button class="nav-tab px-2.5 2xl:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 ${activeTab === 'projects' ? 'bg-unal-400 text-unal-900 shadow-md shadow-unal-400/25' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="projects">
              <i data-lucide="folder-kanban" class="w-3.5 h-3.5 shrink-0"></i>
              <span>Proyectos</span>
            </button>

            <!-- Apartado: Prácticas de Laboratorio (Docencia) -->
            <button class="nav-tab px-2.5 2xl:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 ${activeTab === 'practices' ? 'bg-unal-400 text-unal-900 shadow-md shadow-unal-400/25' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="practices">
              <i data-lucide="graduation-cap" class="w-3.5 h-3.5 shrink-0"></i>
              <span>Prácticas</span>
            </button>

            <!-- Apartado: Rutinas y Aseo (Tareas Recurrentes) -->
            <button class="nav-tab px-2.5 2xl:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 ${activeTab === 'recurring-tasks' ? 'bg-unal-400 text-unal-900 shadow-md shadow-unal-400/25' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="recurring-tasks">
              <i data-lucide="repeat" class="w-3.5 h-3.5 shrink-0"></i>
              <span>Rutinas y Aseo</span>
            </button>

            <!-- Apartado de Revisión (Condicionado por Rol) -->
            <button class="nav-tab relative px-2.5 2xl:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 ${activeTab === 'approvals' ? 'bg-unal-400 text-unal-900 shadow-md shadow-unal-400/25' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="approvals" id="nav-approvals-tab">
              <i data-lucide="${isReviewer ? 'check-circle-2' : 'shield-alert'}" class="w-3.5 h-3.5 shrink-0 ${isReviewer ? '' : 'text-amber-300'}"></i>
              <span>Revisión</span>
              ${isReviewer ? (pendingCount > 0 ? `
                <span class="pulse-badge px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-unal-red text-white ml-0.5">
                  ${pendingCount}
                </span>
              ` : '') : `
                <i data-lucide="lock" class="w-3 h-3 text-amber-300/80 ml-0.5 shrink-0"></i>
              `}
            </button>

            <button class="nav-tab px-2.5 2xl:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 ${activeTab === 'weekly-report' ? 'bg-unal-400 text-unal-900 shadow-md shadow-unal-400/25' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="weekly-report">
              <i data-lucide="file-text" class="w-3.5 h-3.5 shrink-0"></i>
              <span>Informe</span>
            </button>

            <button class="nav-tab px-2.5 2xl:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 ${activeTab === 'team' ? 'bg-unal-400 text-unal-900 shadow-md shadow-unal-400/25' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="team">
              <i data-lucide="users" class="w-3.5 h-3.5 shrink-0"></i>
              <span>Integrantes</span>
            </button>
          </div>

          <!-- Action Buttons / Auth Switcher -->
          <div class="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
            
            ${isReviewer ? `
              <!-- Ficha de Revisor Conectado -->
              <div class="flex items-center space-x-2 bg-unal-900/90 border border-unal-400/50 py-1.5 px-2.5 rounded-2xl shadow-inner shrink-0">
                <div class="w-7 h-7 rounded-lg bg-unal-400 text-unal-900 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                  ${currentUser.username.substring(0, 2).toUpperCase()}
                </div>
                <div class="hidden sm:block text-left leading-tight whitespace-nowrap">
                  <div class="text-[11px] font-bold text-white truncate max-w-[120px]" title="${currentUser.name}">
                    ${currentUser.name.split(' ')[0]} ${currentUser.name.split(' ').slice(-1)[0]}
                  </div>
                  <span class="text-[10px] text-unal-300 font-semibold">${currentUser.role.split(' ')[0]}</span>
                </div>
                <button type="button" id="btn-logout-reviewer" title="Cerrar sesión de revisor y volver al apartado de auxiliares" class="ml-0.5 p-1 rounded-lg hover:bg-red-900/60 text-slate-300 hover:text-unal-red transition-all shrink-0">
                  <i data-lucide="log-out" class="w-4 h-4"></i>
                </button>
              </div>

              <!-- Configuración Drive (Exclusivo Revisores) -->
              <button id="btn-drive-settings" title="Configurar Google Drive Institucional (Revisor)" class="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-unal-700/80 transition-all border border-unal-400/30 shrink-0">
                <i data-lucide="hard-drive" class="w-4 h-4 text-unal-400"></i>
              </button>
            ` : `
              <!-- Botón de Acceso para Revisores -->
              <button type="button" id="btn-login-reviewer" class="px-3 py-1.5 rounded-xl bg-unal-800/90 hover:bg-unal-700 text-unal-300 hover:text-white font-bold text-xs border border-unal-400/40 shadow-xs transition-all flex items-center space-x-1.5 shrink-0 whitespace-nowrap" title="Ingreso exclusivo para Dirección y Coordinadores">
                <i data-lucide="lock" class="w-3.5 h-3.5 text-unal-400 shrink-0"></i>
                <span class="whitespace-nowrap">Acceso Revisores</span>
              </button>
            `}

            <!-- Indicador Drive Auto-Sync -->
            <button id="btn-navbar-sync" type="button" class="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-unal-900/80 hover:bg-unal-800 border border-unal-400/40 text-[11px] text-slate-200 transition-all shrink-0 cursor-pointer" title="Sincronización automática con Google Drive activa cada 30s. Pulsa para forzar actualización inmediata.">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="font-medium text-[11px] text-unal-200 whitespace-nowrap">Drive Auto-Sync</span>
            </button>

            <!-- Botón Público Kiosco: Registrar Avance (Abierto a todos los auxiliares) -->
            <button id="btn-open-quick-log" class="px-3.5 py-2 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-xs sm:text-sm shadow-md shadow-unal-400/30 hover:shadow-lg transition-all flex items-center space-x-1.5 transform active:scale-95 shrink-0 whitespace-nowrap">
              <i data-lucide="plus-circle" class="w-4 h-4 shrink-0"></i>
              <span class="whitespace-nowrap">Registrar Avance</span>
            </button>

            <!-- Botón Menú Móvil / Tablet (Visible en < xl) -->
            <button id="btn-mobile-menu" type="button" class="xl:hidden p-2 rounded-xl text-slate-200 hover:text-white hover:bg-unal-700/60 transition-all border border-unal-400/30 shrink-0 ml-1" aria-label="Abrir menú de navegación">
              <i data-lucide="menu" class="w-5 h-5"></i>
            </button>

          </div>
        </div>
      </div>

      <!-- Mobile / Tablet Navigation Drawer -->
      <div id="mobile-menu-drawer" class="hidden xl:hidden border-t border-unal-700/80 bg-unal-900/98 px-4 py-3 space-y-1 shadow-2xl backdrop-blur-xl">
        <button class="nav-tab w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${activeTab === 'dashboard' ? 'bg-unal-400 text-unal-900 font-bold' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="dashboard">
          <div class="flex items-center space-x-2">
            <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
            <span>Tablero Principal</span>
          </div>
          <i data-lucide="chevron-right" class="w-3.5 h-3.5 opacity-60"></i>
        </button>

        <button class="nav-tab w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${activeTab === 'projects' ? 'bg-unal-400 text-unal-900 font-bold' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="projects">
          <div class="flex items-center space-x-2">
            <i data-lucide="folder-kanban" class="w-4 h-4"></i>
            <span>Proyectos y Actividades WBS</span>
          </div>
          <i data-lucide="chevron-right" class="w-3.5 h-3.5 opacity-60"></i>
        </button>

        <button class="nav-tab w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${activeTab === 'practices' ? 'bg-unal-400 text-unal-900 font-bold' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="practices">
          <div class="flex items-center space-x-2">
            <i data-lucide="graduation-cap" class="w-4 h-4"></i>
            <span>Prácticas de Docencia</span>
          </div>
          <i data-lucide="chevron-right" class="w-3.5 h-3.5 opacity-60"></i>
        </button>

        <button class="nav-tab w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${activeTab === 'recurring-tasks' ? 'bg-unal-400 text-unal-900 font-bold' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="recurring-tasks">
          <div class="flex items-center space-x-2">
            <i data-lucide="repeat" class="w-4 h-4"></i>
            <span>Rutinas de Aseo y 5S</span>
          </div>
          <i data-lucide="chevron-right" class="w-3.5 h-3.5 opacity-60"></i>
        </button>

        <button class="nav-tab w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${activeTab === 'approvals' ? 'bg-unal-400 text-unal-900 font-bold' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="approvals" id="nav-mobile-approvals-tab">
          <div class="flex items-center space-x-2">
            <i data-lucide="${isReviewer ? 'check-circle-2' : 'shield-alert'}" class="w-4 h-4 ${isReviewer ? '' : 'text-amber-300'}"></i>
            <span>Revisión y Aprobación</span>
          </div>
          ${isReviewer && pendingCount > 0 ? `
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-unal-red text-white">
              ${pendingCount} pendientes
            </span>
          ` : `
            <i data-lucide="${isReviewer ? 'chevron-right' : 'lock'}" class="w-3.5 h-3.5 ${isReviewer ? 'opacity-60' : 'text-amber-300'}"></i>
          `}
        </button>

        <button class="nav-tab w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${activeTab === 'weekly-report' ? 'bg-unal-400 text-unal-900 font-bold' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="weekly-report">
          <div class="flex items-center space-x-2">
            <i data-lucide="file-text" class="w-4 h-4"></i>
            <span>Informe Semanal</span>
          </div>
          <i data-lucide="chevron-right" class="w-3.5 h-3.5 opacity-60"></i>
        </button>

        <button class="nav-tab w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${activeTab === 'team' ? 'bg-unal-400 text-unal-900 font-bold' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="team">
          <div class="flex items-center space-x-2">
            <i data-lucide="users" class="w-4 h-4"></i>
            <span>Integrantes del Equipo</span>
          </div>
          <i data-lucide="chevron-right" class="w-3.5 h-3.5 opacity-60"></i>
        </button>
      </div>
    </nav>
  `;

  const mobileMenuBtn = navContainer.querySelector('#btn-mobile-menu');
  const mobileDrawer = navContainer.querySelector('#mobile-menu-drawer');
  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = mobileDrawer.classList.toggle('hidden');
      mobileMenuBtn.innerHTML = `<i data-lucide="${isHidden ? 'menu' : 'x'}" class="w-5 h-5"></i>`;
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Listeners de pestañas (escritorio y móvil)
  navContainer.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');

      // Cerrar menú móvil al seleccionar pestaña si está desplegado
      if (mobileDrawer && !mobileDrawer.classList.contains('hidden')) {
        mobileDrawer.classList.add('hidden');
        if (mobileMenuBtn) {
          mobileMenuBtn.innerHTML = '<i data-lucide="menu" class="w-5 h-5"></i>';
          if (window.lucide) window.lucide.createIcons();
        }
      }

      // Si intenta ir a revisión sin ser revisor, abrir modal de login
      if (tab === 'approvals' && !isReviewer) {
        if (onOpenLogin) {
          onOpenLogin('El apartado de Revisión y Aprobación de Avances está reservado para la Dirección y Coordinación del Laboratorio. Inicia sesión con tus credenciales de revisor.');
        }
        return;
      }

      onTabChange(tab);
    });
  });

  const brandBtn = navContainer.querySelector('#nav-brand-btn');
  if (brandBtn) {
    brandBtn.addEventListener('click', () => {
      if (mobileDrawer && !mobileDrawer.classList.contains('hidden')) {
        mobileDrawer.classList.add('hidden');
        if (mobileMenuBtn) {
          mobileMenuBtn.innerHTML = '<i data-lucide="menu" class="w-5 h-5"></i>';
          if (window.lucide) window.lucide.createIcons();
        }
      }
      onTabChange('dashboard');
    });
  }

  const quickLogBtn = navContainer.querySelector('#btn-open-quick-log');
  if (quickLogBtn) {
    quickLogBtn.addEventListener('click', onOpenQuickLog);
  }

  const navbarSyncBtn = navContainer.querySelector('#btn-navbar-sync');
  if (navbarSyncBtn) {
    navbarSyncBtn.addEventListener('click', async () => {
      navbarSyncBtn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 text-emerald-300 animate-spin"></i><span class="text-[11px] text-emerald-200 font-medium whitespace-nowrap">Sincronizando...</span>`;
      if (window.lucide) window.lucide.createIcons();
      if (window.GeoStorage && typeof window.GeoStorage.syncLogsFromCloud === 'function') {
        await window.GeoStorage.syncLogsFromCloud();
      }
      navbarSyncBtn.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span class="font-medium text-[11px] text-unal-200 whitespace-nowrap">Drive Auto-Sync</span>`;
      if (window.lucide) window.lucide.createIcons();
    });
  }

  const driveBtn = navContainer.querySelector('#btn-drive-settings');
  if (driveBtn) {
    driveBtn.addEventListener('click', onOpenDriveConfig);
  }

  const loginBtn = navContainer.querySelector('#btn-login-reviewer');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      if (onOpenLogin) onOpenLogin('');
    });
  }

  const logoutBtn = navContainer.querySelector('#btn-logout-reviewer');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (onLogout) onLogout();
    });
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
};
