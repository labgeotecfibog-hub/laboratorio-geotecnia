/**
 * Servicio de Almacenamiento y Estado Reactivo
 * Gestiona Proyectos, Actividades, Integrantes, Registros de Avances y Configuración
 */

const STORAGE_KEYS = {
  PROJECTS: 'lab_geo_projects',
  MEMBERS: 'lab_geo_members',
  LOGS: 'lab_geo_logs',
  DRIVE: 'lab_geo_drive_config',
  RECURRING_TASKS: 'lab_geo_recurring_tasks',
  LAB_PRACTICES: 'lab_geo_lab_practices'
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
      INITIAL_RECURRING_TASKS: [],
      INITIAL_LAB_PRACTICES: [],
      DRIVE_CONFIG: {}
    };

    const CURRENT_VERSION = '2026.10.29_cloud_sync_and_tombstones_v14';
    const storedVersion = localStorage.getItem('lab_geo_data_version');
    const FAKE_LOG_IDS = new Set(['LOG-2026-TEST-001', 'LOG-2026-002', 'LOG-2026-003', 'LOG-2026-004', 'LOG-2026-005']);
    const FAKE_TASK_IDS = new Set(['REC-001', 'REC-002', 'REC-003', 'REC-004', 'REC-005', 'REC-006', 'REC-007']);
    const FAKE_PRACTICE_IDS = new Set(['PRAC-2026-001', 'PRAC-2026-002', 'PRAC-2026-003', 'PRAC-2026-004']);

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

      // 2. PRESERVAR LOGS EXISTENTES (Purgando registros ficticios de prueba)
      const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      let logsToSave = defaultData.INITIAL_LOGS;
      if (storedLogs) {
        try {
          const parsedLogs = JSON.parse(storedLogs);
          if (Array.isArray(parsedLogs) && parsedLogs.length > 0) {
            const cleanLogs = parsedLogs.filter(l => !FAKE_LOG_IDS.has(l.id));
            const seedIds = new Set(defaultData.INITIAL_LOGS.map(l => l.id));
            const userCustomLogs = cleanLogs.filter(l => !seedIds.has(l.id));
            logsToSave = [...userCustomLogs, ...defaultData.INITIAL_LOGS];
          }
        } catch (e) {
          console.warn('Error reading stored logs:', e);
        }
      }

      // 3. SINCRONIZAR PROYECTOS Y ACTIVIDADES DESDE EL BACKUP ONLINE
      let projectsToSave = defaultData.INITIAL_PROJECTS;

      // 4. Preservar Integrantes (eliminando aquellos sin nombre completo)
      const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      let membersToSave = defaultData.INITIAL_MEMBERS;
      if (storedMembers) {
        try {
          const parsedMembers = JSON.parse(storedMembers);
          if (Array.isArray(parsedMembers) && parsedMembers.length > 0) {
            const seedIds = new Set(defaultData.INITIAL_MEMBERS.map(m => m.id));
            const customMembers = parsedMembers.filter(m => !seedIds.has(m.id) && !this.isIncompleteMember(m));
            membersToSave = [...defaultData.INITIAL_MEMBERS, ...customMembers];
          }
        } catch (e) {
          console.warn('Error reading stored members:', e);
        }
      }
      membersToSave = (membersToSave || []).filter(m => !this.isIncompleteMember(m));

      // 5. Preservar Rutinas / Tareas Recurrentes (Aseo, Orden, Mantenimiento)
      const deletedRecurringIds = this.getDeletedRecurringIds();
      const storedRoutines = localStorage.getItem(STORAGE_KEYS.RECURRING_TASKS);
      let routinesToSave = [];
      if (storedRoutines !== null) {
        try {
          const parsedRoutines = JSON.parse(storedRoutines);
          if (Array.isArray(parsedRoutines)) {
            routinesToSave = parsedRoutines.filter(r => !deletedRecurringIds.has(r.id) && !FAKE_TASK_IDS.has(r.id));
          }
        } catch (e) {
          console.warn('Error reading stored recurring tasks:', e);
        }
      } else {
        routinesToSave = (defaultData.INITIAL_RECURRING_TASKS || []).filter(r => !deletedRecurringIds.has(r.id));
      }

      // 6. Preservar Prácticas de Laboratorio
      const deletedPracticeIds = this.getDeletedPracticeIds();
      const storedPractices = localStorage.getItem(STORAGE_KEYS.LAB_PRACTICES);
      let practicesToSave = [];
      if (storedPractices !== null) {
        try {
          const parsedPractices = JSON.parse(storedPractices);
          if (Array.isArray(parsedPractices)) {
            practicesToSave = parsedPractices.filter(p => !deletedPracticeIds.has(p.id) && !FAKE_PRACTICE_IDS.has(p.id));
          }
        } catch (e) {
          console.warn('Error reading stored lab practices:', e);
        }
      } else {
        practicesToSave = (defaultData.INITIAL_LAB_PRACTICES || []).filter(p => !deletedPracticeIds.has(p.id));
      }

      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projectsToSave));
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(membersToSave));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logsToSave));
      localStorage.setItem(STORAGE_KEYS.DRIVE, JSON.stringify(driveConfigToSave));
      localStorage.setItem(STORAGE_KEYS.RECURRING_TASKS, JSON.stringify(routinesToSave));
      localStorage.setItem(STORAGE_KEYS.LAB_PRACTICES, JSON.stringify(practicesToSave));
      localStorage.setItem('lab_geo_data_version', CURRENT_VERSION);
    } else {
      // Si el almacenamiento ya está en versión actual, asegurar que no se reinserten tareas eliminadas
      const deletedRecurringIds = this.getDeletedRecurringIds();
      if (localStorage.getItem(STORAGE_KEYS.RECURRING_TASKS) === null && defaultData.INITIAL_RECURRING_TASKS) {
        const seedRoutines = defaultData.INITIAL_RECURRING_TASKS.filter(r => !deletedRecurringIds.has(r.id));
        localStorage.setItem(STORAGE_KEYS.RECURRING_TASKS, JSON.stringify(seedRoutines));
      }
      const deletedPracticeIds = this.getDeletedPracticeIds();
      if (localStorage.getItem(STORAGE_KEYS.LAB_PRACTICES) === null && defaultData.INITIAL_LAB_PRACTICES) {
        const seedPractices = defaultData.INITIAL_LAB_PRACTICES.filter(p => !deletedPracticeIds.has(p.id));
        localStorage.setItem(STORAGE_KEYS.LAB_PRACTICES, JSON.stringify(seedPractices));
      }
    }

    // Limpieza global de integrantes sin nombre completo en cualquier sesión persistida
    this.cleanIncompleteMembers();

    // Iniciar motor de auto-sincronización y monitoreo periódico en segundo plano con Google Drive
    this.startAutoSync(30);
  }

  // --- Motor de Sincronización Automática con Google Drive ---
  startAutoSync(intervalSeconds = 30) {
    if (this._autoSyncTimer) return;

    // 1. Sincronización inicial rápida a los 2 segundos
    setTimeout(() => {
      this.syncLogsFromCloud({ silent: true }).catch(() => {});
    }, 2000);

    // 2. Intervalo periódico en segundo plano (cada 30s)
    this._autoSyncTimer = setInterval(() => {
      this.syncLogsFromCloud({ silent: true }).catch(() => {});
    }, intervalSeconds * 1000);

    // 3. Sincronización reactiva inmediata al volver a la pestaña o ventana del navegador
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.syncLogsFromCloud({ silent: true }).catch(() => {});
      });

      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            this.syncLogsFromCloud({ silent: true }).catch(() => {});
          }
        });
      }
    }
  }

  stopAutoSync() {
    if (this._autoSyncTimer) {
      clearInterval(this._autoSyncTimer);
      this._autoSyncTimer = null;
    }
  }

  scheduleAutoCloudBackup() {
    if (this._cloudBackupTimer) clearTimeout(this._cloudBackupTimer);
    this._cloudBackupTimer = setTimeout(() => {
      if (window.GeoDrive && typeof window.GeoDrive.syncDatabaseToDrive === 'function') {
        window.GeoDrive.syncDatabaseToDrive().then(res => {
          if (res && res.status === 'success') {
            console.log('✓ Base de datos sincronizada automáticamente en Google Drive.');
          }
        }).catch(err => {
          console.warn('Auto-backup en Drive diferido:', err);
        });
      }
    }, 3500);
  }

  isIncompleteMember(m) {
    if (!m) return true;
    const incompleteIds = new Set(['MEM-004', 'MEM-006', 'MEM-007', 'MEM-017']);
    if (incompleteIds.has(m.id)) return true;
    const name = (m.name || '').trim();
    if (!name.includes(' ') || name.length <= 5 || name === m.initials) return true;
    return false;
  }

  cleanIncompleteMembers() {
    try {
      // 1. Limpiar miembros en localStorage
      const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (storedMembers) {
        const members = JSON.parse(storedMembers);
        if (Array.isArray(members)) {
          let membersModified = false;
          const filtered = members.filter(m => !this.isIncompleteMember(m));
          if (filtered.length !== members.length) membersModified = true;

          // Remover fotos de prueba no deseadas
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
      }

      // 2. Limpiar asignaciones en proyectos
      const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (storedProjects) {
        const projects = JSON.parse(storedProjects);
        let projectsChanged = false;
        if (Array.isArray(projects)) {
          projects.forEach(p => {
            if (p.name && p.name.includes('(CLGT)')) {
              p.name = p.name.replace('(CLGT)', '').trim();
              projectsChanged = true;
            }
            if (p.activities && Array.isArray(p.activities)) {
              p.activities = p.activities.filter(a => a.id !== 'ACT-EXT01-03');
              p.activities.forEach(a => {
                if (a.assignedTo && Array.isArray(a.assignedTo)) {
                  const origLen = a.assignedTo.length;
                  a.assignedTo = a.assignedTo.filter(id => !['MEM-004', 'MEM-006', 'MEM-007', 'MEM-017'].includes(id));
                  if (a.assignedTo.length === 0) {
                    a.assignedTo = ['MEM-002'];
                  }
                  if (a.assignedTo.length !== origLen) {
                    projectsChanged = true;
                  }
                }
              });
            }
          });
          if (projectsChanged) {
            localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
          }
        }
      }

      // 3. Limpiar asignaciones en tareas recurrentes
      const storedRoutines = localStorage.getItem(STORAGE_KEYS.RECURRING_TASKS);
      if (storedRoutines) {
        const routines = JSON.parse(storedRoutines);
        let routinesChanged = false;
        if (Array.isArray(routines)) {
          routines.forEach(r => {
            if (r.assignedTo && Array.isArray(r.assignedTo)) {
              const origLen = r.assignedTo.length;
              r.assignedTo = r.assignedTo.filter(id => !['MEM-004', 'MEM-006', 'MEM-007', 'MEM-017'].includes(id));
              if (r.assignedTo.length === 0) {
                r.assignedTo = ['MEM-016'];
              }
              if (r.assignedTo.length !== origLen) {
                routinesChanged = true;
              }
            }
            if (['MEM-004', 'MEM-006', 'MEM-007', 'MEM-017'].includes(r.lastCompletedBy)) {
              r.lastCompletedBy = 'MEM-016';
              r.lastCompletedByName = 'Juan Esteban Millan Perilla';
              routinesChanged = true;
            }
          });
          if (routinesChanged) {
            localStorage.setItem(STORAGE_KEYS.RECURRING_TASKS, JSON.stringify(routines));
          }
        }
      }

      // 4. Limpiar logs que apunten a miembros eliminados
      const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (storedLogs) {
        const logs = JSON.parse(storedLogs);
        let logsChanged = false;
        if (Array.isArray(logs)) {
          logs.forEach(l => {
            if (l.memberId === 'MEM-017') {
              l.memberId = 'MEM-008';
              l.memberName = 'Esteban Alexis Benitez Blanco';
              logsChanged = true;
            } else if (['MEM-004', 'MEM-006', 'MEM-007'].includes(l.memberId)) {
              l.memberId = 'MEM-002';
              l.memberName = 'Ing. Daniel Felipe Rodríguez Ramírez';
              logsChanged = true;
            }
          });
          if (logsChanged) {
            localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
          }
        }
      }
    } catch (e) {
      console.warn('Cleanup incomplete members error:', e);
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
    this.scheduleAutoCloudBackup();
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
      const members = data ? JSON.parse(data) : (window.GeoData ? window.GeoData.INITIAL_MEMBERS : []);
      return (members || []).filter(m => !this.isIncompleteMember(m));
    } catch {
      return (window.GeoData ? window.GeoData.INITIAL_MEMBERS : []).filter(m => !this.isIncompleteMember(m));
    }
  }

  saveMembers(members) {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notify();
    this.scheduleAutoCloudBackup();
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

  getDeletedLogIds() {
    try {
      const data = localStorage.getItem('lab_geo_deleted_log_ids');
      const set = data ? new Set(JSON.parse(data)) : new Set();
      set.add('LOG-2026-TEST-001'); // Siempre purgar el avance de prueba de sincronización
      return set;
    } catch {
      return new Set(['LOG-2026-TEST-001']);
    }
  }

  saveDeletedLogIds(set) {
    try {
      const arr = Array.from(set || []);
      localStorage.setItem('lab_geo_deleted_log_ids', JSON.stringify(arr));
    } catch (e) {}
  }

  deleteLog(logId) {
    if (!logId) return;
    const deletedSet = this.getDeletedLogIds();
    deletedSet.add(logId);
    this.saveDeletedLogIds(deletedSet);

    let logs = this.getLogs().filter(l => l.id !== logId);
    this.saveLogs(logs);

    // Notificar y eliminar inmediatamente en Google Drive
    if (window.GeoDrive && typeof window.GeoDrive.deleteLogFromCloud === 'function') {
      window.GeoDrive.deleteLogFromCloud(logId).then(res => {
        if (res && res.success) {
          console.log(`✓ Avance ${logId} purgado permanentemente de Google Drive.`);
        }
      }).catch(err => {
        console.warn('Eliminación diferida en Drive:', err);
      });
    }
  }

  // --- Registros de Avances (Logs) ---
  getLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      const parsed = data ? JSON.parse(data) : (window.GeoData ? window.GeoData.INITIAL_LOGS : []);
      const FAKE_LOG_IDS = new Set(['LOG-2026-TEST-001', 'LOG-2026-002', 'LOG-2026-003', 'LOG-2026-004', 'LOG-2026-005']);
      const deletedIds = this.getDeletedLogIds();
      return Array.isArray(parsed) ? parsed.filter(l => l && l.id && !FAKE_LOG_IDS.has(l.id) && !deletedIds.has(l.id)) : [];
    } catch {
      return window.GeoData ? window.GeoData.INITIAL_LOGS : [];
    }
  }

  saveLogs(logs, options = {}) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    this.notify();
    if (!options || !options.skipCloudBackup) {
      this.scheduleAutoCloudBackup();
    }
  }

  addLog(logData) {
    const logs = this.getLogs();
    const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newLog = {
      ...logData,
      id: logData.id || `LOG-${new Date().getFullYear()}-${randSuffix}-${String(logs.length + 1).padStart(3, '0')}`,
      date: logData.date || new Date().toISOString().split('T')[0],
      status: logData.status || 'Pendiente',
      reviewedBy: logData.reviewedBy || null,
      reviewDate: logData.reviewDate || null,
      reviewComments: logData.reviewComments || ''
    };

    const existingIdx = logs.findIndex(l => l.id === newLog.id);
    if (existingIdx >= 0) {
      logs[existingIdx] = newLog;
    } else {
      logs.unshift(newLog);
    }
    this.saveLogs(logs);

    // Sincronización inmediata a Google Drive en la nube
    if (window.GeoDrive && typeof window.GeoDrive.submitLogToCloud === 'function') {
      window.GeoDrive.submitLogToCloud(newLog).catch(err => {
        console.warn('Sincronización diferida en la nube:', err);
      });
    }

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

    // Sincronizar actualización de revisión en Google Drive
    if (window.GeoDrive && typeof window.GeoDrive.reviewLogOnCloud === 'function') {
      window.GeoDrive.reviewLogOnCloud(logId, reviewerId, isApproved, comments).catch(err => {
        console.warn('Error al sincronizar revisión en la nube:', err);
      });
    }

    return log;
  }

  /**
   * Sincroniza y fusiona los registros de avances con la base de datos central en Google Drive
   * Es completamente bidireccional: descarga novedades y sube avances locales pendientes
   */
  async syncLogsFromCloud(options = {}) {
    if (this._isSyncingLogs) return { success: false, message: 'Ya en progreso' };
    this._isSyncingLogs = true;

    try {
      if (!window.GeoDrive || typeof window.GeoDrive.fetchLogsFromCloud !== 'function') {
        return { success: false, message: 'Servicio de Drive no disponible.' };
      }

      const res = await window.GeoDrive.fetchLogsFromCloud();
      if (!res || !res.success || !Array.isArray(res.logs)) {
        return { success: false, message: res ? res.message : 'Error al sincronizar con Drive.' };
      }

      const cloudLogs = res.logs || [];
      const cloudDeletedIds = res.deletedLogIds || [];
      const localDeletedSet = this.getDeletedLogIds();

      // Fusionar IDs eliminados de la nube con la lista local
      let deletedSetModified = false;
      cloudDeletedIds.forEach(id => {
        if (!localDeletedSet.has(id)) {
          localDeletedSet.add(id);
          deletedSetModified = true;
        }
      });
      if (deletedSetModified) {
        this.saveDeletedLogIds(localDeletedSet);
      }

      const FAKE_LOG_IDS = new Set(['LOG-2026-TEST-001', 'LOG-2026-002', 'LOG-2026-003', 'LOG-2026-004', 'LOG-2026-005']);

      const localLogs = this.getLogs().filter(l => l && l.id && !localDeletedSet.has(l.id) && !FAKE_LOG_IDS.has(l.id));

      const logMap = new Map();
      // 1. Cargar locales limpios
      localLogs.forEach(l => {
        if (l && l.id && !localDeletedSet.has(l.id) && !FAKE_LOG_IDS.has(l.id)) {
          logMap.set(l.id, l);
        }
      });

      let newCount = 0;
      let updatedCount = 0;

      // 2. Fusionar con registros de la nube (ignorando eliminados y de prueba)
      cloudLogs.forEach(cLog => {
        if (!cLog || !cLog.id) return;
        if (localDeletedSet.has(cLog.id) || FAKE_LOG_IDS.has(cLog.id)) return;

        if (!logMap.has(cLog.id)) {
          logMap.set(cLog.id, cLog);
          newCount++;
        } else {
          const existing = logMap.get(cLog.id);
          // Si el estado en la nube cambió (e.g. validado o con comentarios)
          if (cLog.status !== existing.status || (cLog.reviewDate && !existing.reviewDate) || (cLog.reviewComments && !existing.reviewComments)) {
            logMap.set(cLog.id, { ...existing, ...cLog });
            updatedCount++;
          }
        }
      });

      // 3. AUTO-RECUPERACIÓN SEGURA:
      // Si en este navegador hay avances legítimos que no existen en la nube, subirlos
      // NUNCA subir registros eliminados ni de prueba
      const cloudIds = new Set(cloudLogs.map(c => c && c.id));
      const unpushedLogs = localLogs.filter(l => l && l.id && !cloudIds.has(l.id) && !localDeletedSet.has(l.id) && !FAKE_LOG_IDS.has(l.id));
      if (unpushedLogs.length > 0) {
        for (const unpushed of unpushedLogs) {
          window.GeoDrive.submitLogToCloud(unpushed).catch(err => {
            console.warn('Subida diferida de avance local a Drive:', err);
          });
        }
      }

      if (newCount > 0 || updatedCount > 0 || localLogs.length !== logMap.size) {
        const mergedLogs = Array.from(logMap.values()).sort((a, b) => {
          const da = new Date(a.date || 0).getTime();
          const db = new Date(b.date || 0).getTime();
          return db - da;
        });
        this.saveLogs(mergedLogs, { skipCloudBackup: true });
      }

      return {
        success: true,
        total: logMap.size,
        newCount,
        updatedCount
      };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      this._isSyncingLogs = false;
    }
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

  getDeletedRecurringIds() {
    try {
      const data = localStorage.getItem('lab_geo_deleted_recurring_ids');
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch {
      return new Set();
    }
  }

  trackDeletedRecurringTask(taskId) {
    if (!taskId) return;
    const set = this.getDeletedRecurringIds();
    set.add(taskId);
    localStorage.setItem('lab_geo_deleted_recurring_ids', JSON.stringify([...set]));
  }

  // --- Tareas Recurrentes (Aseo, Orden, Mantenimiento Rutinario) ---
  getRecurringTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECURRING_TASKS);
      const deletedIds = this.getDeletedRecurringIds();
      const list = data ? JSON.parse(data) : (window.GeoData ? window.GeoData.INITIAL_RECURRING_TASKS : []);
      return Array.isArray(list) ? list.filter(t => !deletedIds.has(t.id)) : [];
    } catch {
      return window.GeoData ? window.GeoData.INITIAL_RECURRING_TASKS : [];
    }
  }

  saveRecurringTasks(tasks) {
    localStorage.setItem(STORAGE_KEYS.RECURRING_TASKS, JSON.stringify(tasks));
    this.notify();
    this.scheduleAutoCloudBackup();
  }

  addRecurringTask(task) {
    const tasks = this.getRecurringTasks();
    const newTask = {
      ...task,
      id: `REC-${String(tasks.length + 1).padStart(3, '0')}`,
      status: 'Pendiente',
      history: []
    };
    tasks.push(newTask);
    this.saveRecurringTasks(tasks);
    return newTask;
  }

  updateRecurringTask(updatedTask) {
    let tasks = this.getRecurringTasks();
    tasks = tasks.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t);
    this.saveRecurringTasks(tasks);
    return updatedTask;
  }

  deleteRecurringTask(taskId) {
    this.trackDeletedRecurringTask(taskId);
    let tasks = this.getRecurringTasks().filter(t => t.id !== taskId);
    this.saveRecurringTasks(tasks);
  }

  completeRecurringTask(taskId, completedById, notes = '', optionalPhotoUrl = '') {
    const tasks = this.getRecurringTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    const member = this.getMembers().find(m => m.id === completedById) || { name: 'Auxiliar de Laboratorio' };
    const today = new Date().toISOString().split('T')[0];
    const currentWeek = window.GeoUtils ? window.GeoUtils.getISOWeekNumber(new Date()) : 43;

    task.status = 'Cumplida';
    task.lastCompletedDate = today;
    task.lastCompletedBy = completedById;
    task.lastCompletedByName = member.name;
    task.lastNotes = notes || 'Rutina ejecutada satisfactoriamente';
    if (optionalPhotoUrl) task.lastEvidenceUrl = optionalPhotoUrl;

    if (!Array.isArray(task.history)) task.history = [];
    task.history.unshift({
      date: today,
      completedBy: completedById,
      completedByName: member.name,
      week: currentWeek,
      notes: notes || 'Cumplida en turno de laboratorio',
      evidenceUrl: optionalPhotoUrl || null
    });

    this.saveRecurringTasks(tasks);
    return task;
  }

  resetRecurringCycle() {
    const tasks = this.getRecurringTasks();
    tasks.forEach(t => {
      t.status = 'Pendiente';
    });
    this.saveRecurringTasks(tasks);
  }

  getDeletedPracticeIds() {
    try {
      const data = localStorage.getItem('lab_geo_deleted_practice_ids');
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch {
      return new Set();
    }
  }

  trackDeletedLabPractice(practiceId) {
    if (!practiceId) return;
    const set = this.getDeletedPracticeIds();
    set.add(practiceId);
    localStorage.setItem('lab_geo_deleted_practice_ids', JSON.stringify([...set]));
  }

  // --- Prácticas de Laboratorio (Docencia Académica) ---
  getLabPractices() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAB_PRACTICES);
      const deletedIds = this.getDeletedPracticeIds();
      const list = data ? JSON.parse(data) : (window.GeoData ? window.GeoData.INITIAL_LAB_PRACTICES : []);
      return Array.isArray(list) ? list.filter(p => !deletedIds.has(p.id)) : [];
    } catch {
      return window.GeoData ? window.GeoData.INITIAL_LAB_PRACTICES : [];
    }
  }

  saveLabPractices(practices) {
    localStorage.setItem(STORAGE_KEYS.LAB_PRACTICES, JSON.stringify(practices));
    this.notify();
    this.scheduleAutoCloudBackup();
  }

  addLabPractice(practice) {
    const practices = this.getLabPractices();
    const newPractice = {
      ...practice,
      id: `PRAC-${new Date().getFullYear()}-${String(practices.length + 1).padStart(3, '0')}`,
      status: practice.status || 'Programada',
      tests: Array.isArray(practice.tests) ? practice.tests : (practice.tests ? [practice.tests] : []),
      assignedStaff: Array.isArray(practice.assignedStaff) ? practice.assignedStaff : [],
      preparationChecklist: practice.preparationChecklist || []
    };
    practices.push(newPractice);
    this.saveLabPractices(practices);
    return newPractice;
  }

  updateLabPractice(updatedPractice) {
    let practices = this.getLabPractices();
    practices = practices.map(p => p.id === updatedPractice.id ? { ...p, ...updatedPractice } : p);
    this.saveLabPractices(practices);
    return updatedPractice;
  }

  deleteLabPractice(practiceId) {
    this.trackDeletedLabPractice(practiceId);
    let practices = this.getLabPractices().filter(p => p.id !== practiceId);
    this.saveLabPractices(practices);
  }

  updatePracticeProfessor(practiceId, professorName, professorEmail = '') {
    const practices = this.getLabPractices();
    const practice = practices.find(p => p.id === practiceId);
    if (!practice) return null;
    practice.professor = (professorName || '').trim();
    if (professorEmail !== undefined) {
      practice.professorEmail = (professorEmail || '').trim();
    }
    this.saveLabPractices(practices);
    return practice;
  }

  togglePracticeChecklistItem(practiceId, itemIndex) {
    const practices = this.getLabPractices();
    const practice = practices.find(p => p.id === practiceId);
    if (!practice || !practice.preparationChecklist || !practice.preparationChecklist[itemIndex]) return null;

    practice.preparationChecklist[itemIndex].done = !practice.preparationChecklist[itemIndex].done;
    
    // Auto-actualizar estado según preparación de ítems
    const anyDone = practice.preparationChecklist.some(i => i.done);
    const allDone = practice.preparationChecklist.length > 0 && practice.preparationChecklist.every(i => i.done);
    if (allDone && practice.status === 'Programada') {
      practice.status = 'Lista para Iniciar';
    } else if (anyDone && practice.status === 'Programada') {
      practice.status = 'En Preparación de Material';
    }

    this.saveLabPractices(practices);
    return practice;
  }

  updatePracticeStatus(practiceId, status) {
    const practices = this.getLabPractices();
    const practice = practices.find(p => p.id === practiceId);
    if (!practice) return null;
    practice.status = status;
    this.saveLabPractices(practices);
    return practice;
  }

  getReportRecipientsPref() {
    try {
      const data = localStorage.getItem('lab_geo_report_recipients_pref');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return {
      to: 'jecolmenaresm@unal.edu.co',
      cc: 'dafrodriguezram@unal.edu.co, eaprietos@unal.edu.co, labgeotec_fibog@unal.edu.co',
      remember: true
    };
  }

  saveReportRecipientsPref(pref) {
    try {
      localStorage.setItem('lab_geo_report_recipients_pref', JSON.stringify(pref));
    } catch (e) {}
  }

  exportBackup() {
    const data = {
      version: '1.2.0',
      exportDate: new Date().toISOString(),
      projects: this.getProjects(),
      members: this.getMembers(),
      logs: this.getLogs(),
      recurringTasks: this.getRecurringTasks(),
      labPractices: this.getLabPractices(),
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
      if (data.recurringTasks) localStorage.setItem(STORAGE_KEYS.RECURRING_TASKS, JSON.stringify(data.recurringTasks));
      if (data.labPractices) localStorage.setItem(STORAGE_KEYS.LAB_PRACTICES, JSON.stringify(data.labPractices));
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
    localStorage.setItem(STORAGE_KEYS.RECURRING_TASKS, JSON.stringify(window.GeoData.INITIAL_RECURRING_TASKS || []));
    localStorage.setItem(STORAGE_KEYS.LAB_PRACTICES, JSON.stringify(window.GeoData.INITIAL_LAB_PRACTICES || []));
    localStorage.setItem(STORAGE_KEYS.DRIVE, JSON.stringify(window.GeoData.DRIVE_CONFIG));
    this.notify();
  }
}

window.GeoStorage = new StorageService();
