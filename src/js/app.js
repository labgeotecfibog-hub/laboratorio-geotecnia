/**
 * Aplicación Principal - Laboratorio de Geotecnia
 * Controlador reactivo y enrutador de vistas
 */

class GeoPlatformApp {
  constructor() {
    this.activeTab = 'dashboard';
    this.isQuickLogOpen = false;
    this.isDriveModalOpen = false;
    this.init();
  }

  init() {
    if (window.GeoStorage) {
      window.GeoStorage.subscribe(() => {
        this.render();
      });
    }

    this.render();

    window.addEventListener('resize', () => {
      if (window.lucide) window.lucide.createIcons();
    });
  }

  setTab(tabName) {
    this.activeTab = tabName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.render();
  }

  openQuickLog() {
    this.isQuickLogOpen = true;
    this.renderModal();
  }

  closeQuickLog() {
    this.isQuickLogOpen = false;
    this.renderModal();
  }

  openDriveSettings() {
    this.isDriveModalOpen = true;
    this.renderModal();
  }

  closeDriveSettings() {
    this.isDriveModalOpen = false;
    this.renderModal();
  }

  render() {
    const C = window.GeoComponents;
    if (!C) return;

    if (C.renderNavbar) {
      C.renderNavbar(
        this.activeTab,
        (tab) => this.setTab(tab),
        () => this.openQuickLog(),
        () => this.openDriveSettings()
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
            () => this.openQuickLog()
          );
        }
        break;

      case 'projects':
        if (C.renderProjectsView) {
          C.renderProjectsView(
            mainContainer,
            () => this.openQuickLog()
          );
        }
        break;

      case 'approvals':
        if (C.renderApprovalsView) {
          C.renderApprovalsView(
            mainContainer,
            () => this.render()
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
            () => this.openQuickLog()
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

    if (this.isQuickLogOpen && C.renderQuickLogModal) {
      C.renderQuickLogModal(
        true,
        () => this.closeQuickLog(),
        () => {
          this.render();
        }
      );
    } else if (this.isDriveModalOpen && C.renderDriveSettingsModal) {
      C.renderDriveSettingsModal(
        true,
        () => this.closeDriveSettings()
      );
    } else {
      if (C.renderQuickLogModal) C.renderQuickLogModal(false);
      if (C.renderDriveSettingsModal) C.renderDriveSettingsModal(false);
    }
  }
}

// Iniciar aplicación al cargar
document.addEventListener('DOMContentLoaded', () => {
  window.geoApp = new GeoPlatformApp();
});
