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

    const CURRENT_VERSION = '2026.10.26_custom_professors_v11';
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
      const storedRoutines = localStorage.getItem(STORAGE_KEYS.RECURRING_TASKS);
      let routinesToSave = defaultData.INITIAL_RECURRING_TASKS || [];
      if (storedRoutines) {
        try {
          const parsedRoutines = JSON.parse(storedRoutines);
          if (Array.isArray(parsedRoutines) && parsedRoutines.length > 0) {
            const seedIds = new Set((defaultData.INITIAL_RECURRING_TASKS || []).map(r => r.id));
            const customRoutines = parsedRoutines.filter(r => !seedIds.has(r.id));
            routinesToSave = [...(defaultData.INITIAL_RECURRING_TASKS || []), ...customRoutines];
          }
        } catch (e) {
          console.warn('Error reading stored recurring tasks:', e);
        }
      }

      // 6. Preservar Prácticas de Laboratorio (actualizando docentes si correspondían a coordinadores del lab)
      const storedPractices = localStorage.getItem(STORAGE_KEYS.LAB_PRACTICES);
      let practicesToSave = defaultData.INITIAL_LAB_PRACTICES || [];
      if (storedPractices) {
        try {
          const parsedPractices = JSON.parse(storedPractices);
          if (Array.isArray(parsedPractices) && parsedPractices.length > 0) {
            practicesToSave = (defaultData.INITIAL_LAB_PRACTICES || []).map(dp => {
              const existing = parsedPractices.find(p => p.id === dp.id);
              if (!existing) return dp;
              const isOldLabStaff = existing.professor && (
                existing.professor.includes('Colmenares') || 
                existing.professor.includes('Daniel Felipe') || 
                existing.professor.includes('Edwin Alexander')
              );
              return {
                ...existing,
                professor: isOldLabStaff ? dp.professor : existing.professor,
                professorEmail: isOldLabStaff ? dp.professorEmail : existing.professorEmail
              };
            });
            const seedIds = new Set((defaultData.INITIAL_LAB_PRACTICES || []).map(p => p.id));
            const customPractices = parsedPractices.filter(p => !seedIds.has(p.id));
            practicesToSave = [...practicesToSave, ...customPractices];
          }
        } catch (e) {
          console.warn('Error reading stored lab practices:', e);
        }
      }

      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projectsToSave));
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(membersToSave));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logsToSave));
      localStorage.setItem(STORAGE_KEYS.DRIVE, JSON.stringify(driveConfigToSave));
      localStorage.setItem(STORAGE_KEYS.RECURRING_TASKS, JSON.stringify(routinesToSave));
      localStorage.setItem(STORAGE_KEYS.LAB_PRACTICES, JSON.stringify(practicesToSave));
      localStorage.setItem('lab_geo_data_version', CURRENT_VERSION);
    } else {
      // Si el almacenamiento ya está en versión actual, asegurar que las nuevas colecciones existan
      if (!localStorage.getItem(STORAGE_KEYS.RECURRING_TASKS) && defaultData.INITIAL_RECURRING_TASKS) {
        localStorage.setItem(STORAGE_KEYS.RECURRING_TASKS, JSON.stringify(defaultData.INITIAL_RECURRING_TASKS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.LAB_PRACTICES) && defaultData.INITIAL_LAB_PRACTICES) {
        localStorage.setItem(STORAGE_KEYS.LAB_PRACTICES, JSON.stringify(defaultData.INITIAL_LAB_PRACTICES));
      }
    }

    // Limpieza global de integrantes sin nombre completo en cualquier sesión persistida
    this.cleanIncompleteMembers();
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

  // --- Tareas Recurrentes (Aseo, Orden, Mantenimiento Rutinario) ---
  getRecurringTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECURRING_TASKS);
      return data ? JSON.parse(data) : (window.GeoData ? window.GeoData.INITIAL_RECURRING_TASKS : []);
    } catch {
      return window.GeoData ? window.GeoData.INITIAL_RECURRING_TASKS : [];
    }
  }

  saveRecurringTasks(tasks) {
    localStorage.setItem(STORAGE_KEYS.RECURRING_TASKS, JSON.stringify(tasks));
    this.notify();
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

  // --- Prácticas de Laboratorio (Docencia Académica) ---
  getLabPractices() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAB_PRACTICES);
      return data ? JSON.parse(data) : (window.GeoData ? window.GeoData.INITIAL_LAB_PRACTICES : []);
    } catch {
      return window.GeoData ? window.GeoData.INITIAL_LAB_PRACTICES : [];
    }
  }

  saveLabPractices(practices) {
    localStorage.setItem(STORAGE_KEYS.LAB_PRACTICES, JSON.stringify(practices));
    this.notify();
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
