/**
 * Componente Navbar Principal - Universidad Nacional de Colombia
 * Identidad Visual UNAL • Laboratorio de Geotecnia
 */

window.GeoComponents = window.GeoComponents || {};

window.GeoComponents.renderNavbar = function(activeTab, onTabChange, onOpenQuickLog, onOpenDriveConfig) {
  const logs = window.GeoStorage.getLogs();
  const pendingCount = logs.filter(l => l.status === 'Pendiente').length;

  const navContainer = document.getElementById('navbar-container');
  if (!navContainer) return;

  navContainer.innerHTML = `
    <nav class="glass-nav sticky top-0 z-40 text-white shadow-xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          
          <!-- Logo & UNAL Brand Identity -->
          <div class="flex items-center space-x-3 cursor-pointer py-2" id="nav-brand-btn">
            <div class="h-14 w-auto flex items-center justify-center p-1 bg-white/95 rounded-xl border border-unal-400/40 shadow-md">
              <img src="./Diseno/Escudo_color.png" alt="Escudo UNAL" class="h-12 w-auto object-contain">
            </div>
            
            <div class="border-l border-unal-400/30 pl-3">
              <div class="flex items-center space-x-2">
                <span class="font-extrabold text-base sm:text-lg tracking-tight text-white font-heading">
                  UNIVERSIDAD NACIONAL DE COLOMBIA
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs font-bold text-unal-400 uppercase tracking-wide">
                  Laboratorio de Geotecnia
                </span>
                <span class="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-unal-400/20 text-unal-200 border border-unal-400/30">
                  Extensión & Investigación
                </span>
              </div>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-1.5">
            <button class="nav-tab px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'dashboard' ? 'bg-unal-400 text-unal-900 shadow-md shadow-unal-400/25' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="dashboard">
              <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
              <span>Tablero</span>
            </button>

            <button class="nav-tab px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'projects' ? 'bg-unal-400 text-unal-900 shadow-md shadow-unal-400/25' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="projects">
              <i data-lucide="folder-kanban" class="w-4 h-4"></i>
              <span>Proyectos</span>
            </button>

            <button class="nav-tab relative px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'approvals' ? 'bg-unal-400 text-unal-900 shadow-md shadow-unal-400/25' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="approvals">
              <i data-lucide="check-circle-2" class="w-4 h-4"></i>
              <span>Revisión</span>
              ${pendingCount > 0 ? `
                <span class="pulse-badge px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-unal-red text-white ml-1">
                  ${pendingCount}
                </span>
              ` : ''}
            </button>

            <button class="nav-tab px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'weekly-report' ? 'bg-unal-400 text-unal-900 shadow-md shadow-unal-400/25' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="weekly-report">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              <span>Informe Semanal</span>
            </button>

            <button class="nav-tab px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'team' ? 'bg-unal-400 text-unal-900 shadow-md shadow-unal-400/25' : 'text-slate-200 hover:text-white hover:bg-unal-700/60'}" data-tab="team">
              <i data-lucide="users" class="w-4 h-4"></i>
              <span>Integrantes</span>
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-2 sm:space-x-3">
            
            <button id="btn-drive-settings" title="Configurar Google Drive Institucional" class="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-unal-700/80 transition-all border border-unal-400/30">
              <i data-lucide="hard-drive" class="w-4 h-4 text-unal-400"></i>
            </button>

            <button id="btn-open-quick-log" class="px-4 py-2.5 rounded-xl bg-unal-400 hover:bg-unal-300 text-unal-900 font-bold text-xs sm:text-sm shadow-md shadow-unal-400/30 hover:shadow-lg transition-all flex items-center space-x-2 transform active:scale-95">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span class="hidden sm:inline">Registrar Avance</span>
              <span class="sm:hidden">Registrar</span>
            </button>

          </div>
        </div>
      </div>
    </nav>
  `;

  navContainer.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      onTabChange(tab);
    });
  });

  const brandBtn = navContainer.querySelector('#nav-brand-btn');
  if (brandBtn) {
    brandBtn.addEventListener('click', () => onTabChange('dashboard'));
  }

  const quickLogBtn = navContainer.querySelector('#btn-open-quick-log');
  if (quickLogBtn) {
    quickLogBtn.addEventListener('click', onOpenQuickLog);
  }

  const driveBtn = navContainer.querySelector('#btn-drive-settings');
  if (driveBtn) {
    driveBtn.addEventListener('click', onOpenDriveConfig);
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
};
