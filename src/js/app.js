/**
 * Aplicación Principal - Laboratorio de Geotecnia
 * Controlador reactivo, enrutador de vistas y gestor de apartados
 */

class GeoPlatformApp {
  constructor() {
    this.activeTab = 'dashboard';
    this.isQuickLogOpen = false;
    this.quickLogInitialProjectId = null;
    this.isDriveModalOpen = false;
    this.isLoginModalOpen = false;
    this.loginNoticeMessage = '';
    this.init();
  }

  init() {
    // Reactividad a cambios en la base de datos local
    if (window.GeoStorage) {
      window.GeoStorage.subscribe(() => {
        this.render();
      });
    }

    // Reactividad a inicio/cierre de sesión de revisores
    if (window.GeoAuth) {
      window.GeoAuth.subscribe((user) => {
        if (!user && this.activeTab === 'approvals') {
          this.activeTab = 'dashboard';
        }
        this.render();
      });
    }

    this.render();

    window.addEventListener('resize', () => {
      if (window.lucide) window.lucide.createIcons();
    });
  }

  setTab(tabName) {
    // Si intenta ir a revisión sin estar autenticado como revisor, abrir modal de login
    if (tabName === 'approvals' && (!window.GeoAuth || !window.GeoAuth.isReviewer())) {
      this.openLogin('El apartado de Revisión y Aprobación de Avances está reservado para la Dirección y Coordinación. Inicia sesión con tus credenciales de revisor.');
      return;
    }

    this.activeTab = tabName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.render();

    // Sincronización silenciosa automática en segundo plano al cambiar de pestaña
    if (window.GeoStorage && typeof window.GeoStorage.syncLogsFromCloud === 'function') {
      window.GeoStorage.syncLogsFromCloud({ silent: true }).catch(() => {});
    }
  }

  openQuickLog(initialProjectId = null) {
    this.isQuickLogOpen = true;
    this.quickLogInitialProjectId = initialProjectId;
    this.renderModal();
  }

  closeQuickLog() {
    this.isQuickLogOpen = false;
    this.quickLogInitialProjectId = null;
    this.renderModal();
  }

  openDriveSettings() {
    // La configuración técnica de Drive requiere privilegios de revisor
    if (!window.GeoAuth || !window.GeoAuth.isReviewer()) {
      this.openLogin('La configuración de Google Drive y disparadores automáticos requiere permisos de Dirección y Coordinación.');
      return;
    }
    this.isDriveModalOpen = true;
    this.renderModal();
  }

  closeDriveSettings() {
    this.isDriveModalOpen = false;
    this.renderModal();
  }

  openLogin(noticeMessage = '') {
    this.loginNoticeMessage = noticeMessage;
    this.isLoginModalOpen = true;
    this.renderModal();
  }

  closeLogin() {
    this.isLoginModalOpen = false;
    this.loginNoticeMessage = '';
    this.renderModal();
  }

  handleLogout() {
    if (window.GeoAuth) {
      window.GeoAuth.logout();
    }
    if (this.activeTab === 'approvals') {
      this.activeTab = 'dashboard';
    }
    this.render();
  }

  render() {
    const C = window.GeoComponents;
    if (!C) return;

    if (C.renderNavbar) {
      C.renderNavbar(
        this.activeTab,
        (tab) => this.setTab(tab),
        () => this.openQuickLog(),
        () => this.openDriveSettings(),
        (msg) => this.openLogin(msg),
        () => this.handleLogout()
      );
    }

    const mainContainer = document.getElementById('main-view-container');
    if (!mainContainer) return;

    switch (this.activeTab) {
      case 'dashboard':
        if (C.renderDashboardView) {
          C.renderDashboardView(
            mainContainer,
            (tab) => this.setTab(tab),
            () => this.openQuickLog(),
            (msg) => this.openLogin(msg)
          );
        }
        break;

      case 'projects':
        if (C.renderProjectsView) {
          C.renderProjectsView(
            mainContainer,
            () => this.openQuickLog(),
            (msg) => this.openLogin(msg)
          );
        }
        break;

      case 'practices':
        if (C.renderLabPracticesView) {
          C.renderLabPracticesView(mainContainer);
        }
        break;

      case 'recurring-tasks':
        if (C.renderRecurringTasksView) {
          C.renderRecurringTasksView(mainContainer);
        }
        break;

      case 'approvals':
        if (C.renderApprovalsView) {
          C.renderApprovalsView(
            mainContainer,
            () => this.render(),
            (msg) => this.openLogin(msg)
          );
        }
        break;

      case 'weekly-report':
        if (C.renderWeeklyReportView) {
          C.renderWeeklyReportView(mainContainer);
        }
        break;

      case 'team':
        if (C.renderTeamView) {
          C.renderTeamView(mainContainer);
        }
        break;

      default:
        if (C.renderDashboardView) {
          C.renderDashboardView(
            mainContainer,
            (tab) => this.setTab(tab),
            () => this.openQuickLog(),
            (msg) => this.openLogin(msg)
          );
        }
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderModal() {
    const C = window.GeoComponents;
    if (!C) return;

    // 1. Modal de Registro de Avance (Kiosco)
    if (this.isQuickLogOpen && C.renderQuickLogModal) {
      C.renderQuickLogModal(
        true,
        () => this.closeQuickLog(),
        () => {
          this.render();
        },
        this.quickLogInitialProjectId
      );
    } else if (C.renderQuickLogModal) {
      C.renderQuickLogModal(false);
    }

    // 2. Modal de Configuración Drive
    if (this.isDriveModalOpen && C.renderDriveSettingsModal) {
      C.renderDriveSettingsModal(
        true,
        () => this.closeDriveSettings()
      );
    } else if (C.renderDriveSettingsModal) {
      C.renderDriveSettingsModal(false);
    }

    // 3. Modal de Autenticación de Revisores
    if (this.isLoginModalOpen && C.renderLoginModal) {
      C.renderLoginModal(
        true,
        this.loginNoticeMessage,
        () => this.closeLogin(),
        (user) => {
          this.closeLogin();
          // Si el usuario intentaba ir a revisión, llevarlo directo a la bandeja
          this.setTab('approvals');
        }
      );
    } else if (C.renderLoginModal) {
      C.renderLoginModal(false);
    }
  }
}

// Iniciar aplicación al cargar
document.addEventListener('DOMContentLoaded', () => {
  window.geoApp = new GeoPlatformApp();
});
