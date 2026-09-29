/**
 * Servicio de Almacenamiento y Estado Reactivo
 * Gestiona Proyectos, Actividades, Integrantes, Registros de Avances y Configuración
 */

const STORAGE_KEYS = {
  PROJECTS: 'lab_geo_projects',
  MEMBERS: 'lab_geo_members',
  LOGS: 'lab_geo_logs',
  DRIVE: 'lab_geo_drive_config'
};

class StorageService {
  constructor() {
    this.subscribers = [];
    this.init();
  }

  init() {
    const defaultData = window.GeoData || {
      INITIAL_PROJECTS: [],
      INITIAL_MEMBERS: [],
      INITIAL_LOGS: [],
      DRIVE_CONFIG: {}
    };

    const CURRENT_VERSION = '2026.09.29_official_gas_url_v2';
    const storedVersion = localStorage.getItem('lab_geo_data_version');

    if (storedVersion !== CURRENT_VERSION || !localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      // 1. Preservar Drive Config
      const storedDrive = localStorage.getItem(STORAGE_KEYS.DRIVE);
      let driveConfigToSave = defaultData.DRIVE_CONFIG;
      if (storedDrive) {
        try {
          const parsed = JSON.parse(storedDrive);
          if (parsed && typeof parsed === 'object') {
            driveConfigToSave = { ...defaultData.DRIVE_CONFIG, ...parsed };
            if (!parsed.gasWebhookUrl || parsed.gasWebhookUrl.includes('SampleGeoScriptId')) {
              driveConfigToSave.gasWebhookUrl = defaultData.DRIVE_CONFIG.gasWebhookUrl;
            }
          }
        } catch (e) {
          console.warn('Error reading stored drive config:', e);
        }
      }

      // 2. PRESERVAR LOGS EXISTENTES (¡Nunca borrar avances registrados por los usuarios!)
      const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      let logsToSave = defaultData.INITIAL_LOGS;
      if (storedLogs) {
        try {
          const parsedLogs = JSON.parse(storedLogs);
          if (Array.isArray(parsedLogs) && parsedLogs.length > 0) {
            // Combinar registros asegurando que no se pierda ninguno creado por el usuario
            const seedIds = new Set(defaultData.INITIAL_LOGS.map(l => l.id));
            const userCustomLogs = parsedLogs.filter(l => !seedIds.has(l.id));
            logsToSave = [...userCustomLogs, ...defaultData.INITIAL_LOGS];
          }
        } catch (e) {
          console.warn('Error reading stored logs:', e);
        }
      }

      // 3. PRESERVAR AVANCES DE PROYECTOS Y ACTIVIDADES
      const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      let projectsToSave = defaultData.INITIAL_PROJECTS;
      if (storedProjects) {
        try {
          const parsedProjects = JSON.parse(storedProjects);
          if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
            projectsToSave = defaultData.INITIAL_PROJECTS.map(newProj => {
              const existingProj = parsedProjects.find(p => p.id === newProj.id);
              if (!existingProj) return newProj;

              const updatedActivities = (newProj.activities || []).map(newAct => {
                const existingAct = (existingProj.activities || []).find(a => a.id === newAct.id || a.name === newAct.name);
                if (existingAct && (existingAct.progress > 0 || existingAct.status === 'Completada' || existingAct.status === 'En Ejecución')) {
                  return {
                    ...newAct,
                    progress: existingAct.progress,
                    status: existingAct.status
                  };
                }
                return newAct;
              });

              const allDone = updatedActivities.length > 0 && updatedActivities.every(a => a.progress >= 100);
              return {
                ...newProj,
                activities: updatedActivities,
                status: allDone ? 'Finalizado' : (updatedActivities.some(a => a.progress > 0) ? 'En Ejecución' : newProj.status)
              };
            });
          }
        } catch (e) {
          console.warn('Error reading stored projects:', e);
        }
      }

      // 4. Preservar Integrantes
      const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      let membersToSave = defaultData.INITIAL_MEMBERS;
      if (storedMembers) {
        try {
          const parsedMembers = JSON.parse(storedMembers);
          if (Array.isArray(parsedMembers) && parsedMembers.length > 0) {
            const seedIds = new Set(defaultData.INITIAL_MEMBERS.map(m => m.id));
            const customMembers = parsedMembers.filter(m => !seedIds.has(m.id));
            membersToSave = [...defaultData.INITIAL_MEMBERS, ...customMembers];
          }
        } catch (e) {
          console.warn('Error reading stored members:', e);
        }
      }

      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projectsToSave));
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(membersToSave));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logsToSave));
      localStorage.setItem(STORAGE_KEYS.DRIVE, JSON.stringify(driveConfigToSave));
      localStorage.setItem('lab_geo_data_version', CURRENT_VERSION);
    } else {
      // Safe cleanup of Luna, her task and fake placeholder images if existing local storage is maintained
      try {
        const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
        if (storedMembers) {
          const members = JSON.parse(storedMembers);
          let membersModified = false;
          const filtered = members.filter(m => m.id !== 'MEM-004' && !(m.name && m.name.toLowerCase().includes('luna')));
          if (filtered.length !== members.length) membersModified = true;

          // Remove fake unsplash and dicebear photos
          filtered.forEach(m => {
            if (m.avatar && (m.avatar.includes('unsplash.com') || m.avatar.includes('dicebear.com'))) {
              m.avatar = null;
              membersModified = true;
            }
          });

          if (membersModified) {
            localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(filtered));
          }
        }

        const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
        if (storedProjects) {
          const projects = JSON.parse(storedProjects);
          let changed = false;
          projects.forEach(p => {
            if (p.activities && Array.isArray(p.activities)) {
              const origLen = p.activities.length;
              p.activities = p.activities.filter(a => a.id !== 'ACT-EXT01-03');
              if (p.activities.length !== origLen) changed = true;

              p.activities.forEach(a => {
                if (a.assignedTo && Array.isArray(a.assignedTo) && a.assignedTo.includes('MEM-004')) {
                  a.assignedTo = a.assignedTo.filter(id => id !== 'MEM-004');
                  changed = true;
                }
              });

              if (p.id === 'PRJ-EXT-2026-01') {
                const act1 = p.activities.find(a => a.id === 'ACT-EXT01-01');
                const act2 = p.activities.find(a => a.id === 'ACT-EXT01-02');
                if (act1 && act2 && act1.weight === 40 && act2.weight === 35) {
                  act1.weight = 55;
                  act2.weight = 45;
                  changed = true;
                }
              }
            }
          });
          if (changed) {
            localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
          }
        }

        const storedDrive = localStorage.getItem(STORAGE_KEYS.DRIVE);
        if (storedDrive) {
          const driveConf = JSON.parse(storedDrive);
          if (driveConf.accountEmail === 'labgeotecnia.unal@gmail.com') {
            driveConf.accountEmail = 'labgeotec_fibog@unal.edu.co';
            localStorage.setItem(STORAGE_KEYS.DRIVE, JSON.stringify(driveConf));
          }
        }
      } catch (e) {
        console.warn('Cleanup error:', e);
      }
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.subscribers.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error('Error in storage subscriber:', err);
      }
    });
  }

  // --- Proyectos ---
  getProjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : (window.GeoData ? window.GeoData.INITIAL_PROJECTS : []);
    } catch {
      return window.GeoData ? window.GeoData.INITIAL_PROJECTS : [];
    }
  }

  getProjectById(id) {
    return this.getProjects().find(p => p.id === id);
  }

  saveProjects(projects) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    this.notify();
  }

  addProject(newProject) {
    const projects = this.getProjects();
    const id = `PRJ-${newProject.type === 'Extensión' ? 'EXT' : 'INV'}-${new Date().getFullYear()}-${String(projects.length + 1).padStart(2, '0')}`;
    const projectWithId = {
      ...newProject,
      id,
      code: `${newProject.type === 'Extensión' ? 'EXT' : 'INV'}-${String(projects.length + 1).padStart(2, '0')}`,
      status: 'En Ejecución',
      driveFolderName: `${newProject.type === 'Extensión' ? 'EXT' : 'INV'}-${String(projects.length + 1).padStart(2, '0')}_${newProject.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}`
    };
    projects.unshift(projectWithId);
    this.saveProjects(projects);
    return projectWithId;
  }

  updateProject(updatedProject) {
    let projects = this.getProjects();
    if (updatedProject.activities && updatedProject.activities.length > 0) {
      updatedProject.activities.forEach((act, idx) => {
        if (!act.id) {
          act.id = `ACT-${updatedProject.code || 'PRJ'}-${Date.now()}-${idx + 1}`;
        }
        act.weight = Number(act.weight) || 0;
        act.progress = Math.min(100, Math.max(0, Number(act.progress) || 0));
        if (act.progress >= 100) {
          act.status = 'Completada';
        } else if (act.progress > 0) {
          act.status = 'En Ejecución';
        } else {
          act.status = act.status || 'Pendiente';
        }
      });

      const allCompleted = updatedProject.activities.every(a => a.progress >= 100);
      if (allCompleted) {
        updatedProject.status = 'Finalizado';
      } else if (updatedProject.status === 'Finalizado') {
        updatedProject.status = 'En Ejecución';
      }
    }

    projects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    this.saveProjects(projects);
    return updatedProject;
  }

  deleteProject(projectId) {
    let projects = this.getProjects().filter(p => p.id !== projectId);
    this.saveProjects(projects);
  }

  // --- Integrantes ---
  getMembers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      return data ? JSON.parse(data) : (window.GeoData ? window.GeoData.INITIAL_MEMBERS : []);
    } catch {
      return window.GeoData ? window.GeoData.INITIAL_MEMBERS : [];
    }
  }

  saveMembers(members) {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notify();
  }

  addMember(member) {
    const members = this.getMembers();
    const newMember = {
      ...member,
      id: `MEM-${String(members.length + 1).padStart(3, '0')}`,
      active: true,
      avatar: member.avatar || null
    };
    members.push(newMember);
    this.saveMembers(members);
    return newMember;
  }

  updateMember(updatedMember) {
    let members = this.getMembers();
    members = members.map(m => m.id === updatedMember.id ? { ...m, ...updatedMember } : m);
    this.saveMembers(members);
    return updatedMember;
  }

  deleteMember(memberId) {
    let members = this.getMembers().filter(m => m.id !== memberId);
    this.saveMembers(members);
  }

  deleteLog(logId) {
    let logs = this.getLogs().filter(l => l.id !== logId);
    this.saveLogs(logs);
  }

  // --- Registros de Avances (Logs) ---
  getLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      return data ? JSON.parse(data) : (window.GeoData ? window.GeoData.INITIAL_LOGS : []);
    } catch {
      return window.GeoData ? window.GeoData.INITIAL_LOGS : [];
    }
  }

  saveLogs(logs) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    this.notify();
  }

  addLog(logData) {
    const logs = this.getLogs();
    const newLog = {
      ...logData,
      id: `LOG-${new Date().getFullYear()}-${String(logs.length + 1).padStart(3, '0')}`,
      date: logData.date || new Date().toISOString().split('T')[0],
      status: 'Pendiente',
      reviewedBy: null,
      reviewDate: null,
      reviewComments: ''
    };
    logs.unshift(newLog);
    this.saveLogs(logs);
    return newLog;
  }

  reviewLog(logId, reviewerId, isApproved, comments = '') {
    const logs = this.getLogs();
    const logIndex = logs.findIndex(l => l.id === logId);
    if (logIndex === -1) return null;

    const log = logs[logIndex];
    log.status = isApproved ? 'Aprobado' : 'Ajuste Solicitado';
    log.reviewedBy = reviewerId;
    log.reviewDate = new Date().toISOString().split('T')[0];
    log.reviewComments = comments;

    if (isApproved) {
      const projects = this.getProjects();
      const project = projects.find(p => p.id === log.projectId);
      if (project && project.activities) {
        const activity = project.activities.find(a => a.id === log.activityId);
        if (activity) {
          activity.progress = Number(log.progressReported);
          if (activity.progress >= 100) {
            activity.status = 'Completada';
          } else if (activity.progress > 0) {
            activity.status = 'En Ejecución';
          }
          const allCompleted = project.activities.every(a => a.progress >= 100);
          if (allCompleted) {
            project.status = 'Finalizado';
          }
          this.saveProjects(projects);
        }
      }
    }

    logs[logIndex] = log;
    this.saveLogs(logs);
    return log;
  }

  // --- Google Drive Config ---
  getDriveConfig() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRIVE);
      return data ? JSON.parse(data) : (window.GeoData ? window.GeoData.DRIVE_CONFIG : {});
    } catch {
      return window.GeoData ? window.GeoData.DRIVE_CONFIG : {};
    }
  }

  saveDriveConfig(config) {
    localStorage.setItem(STORAGE_KEYS.DRIVE, JSON.stringify(config));
    this.notify();
  }

  exportBackup() {
    const data = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      projects: this.getProjects(),
      members: this.getMembers(),
      logs: this.getLogs(),
      driveConfig: this.getDriveConfig()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Laboratorio_Geotecnia_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importBackup(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (data.projects) localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
      if (data.members) localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data.members));
      if (data.logs) localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(data.logs));
      if (data.driveConfig) localStorage.setItem(STORAGE_KEYS.DRIVE, JSON.stringify(data.driveConfig));
      this.notify();
      return true;
    } catch (e) {
      console.error('Error importing backup:', e);
      return false;
    }
  }

  resetToInitial() {
    if (!window.GeoData) return;
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(window.GeoData.INITIAL_PROJECTS));
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(window.GeoData.INITIAL_MEMBERS));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(window.GeoData.INITIAL_LOGS));
    localStorage.setItem(STORAGE_KEYS.DRIVE, JSON.stringify(window.GeoData.DRIVE_CONFIG));
    this.notify();
  }
}

window.GeoStorage = new StorageService();
