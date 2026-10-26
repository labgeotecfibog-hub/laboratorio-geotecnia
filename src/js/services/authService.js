/**
 * Servicio de Autenticación y Control de Acceso por Roles (RBAC)
 * Laboratorio de Geotecnia • Universidad Nacional de Colombia
 * 
 * Separa la plataforma en dos apartados:
 * 1. Apartado Público / Estudiantes Auxiliares: Registro de avances, consulta de proyectos, evidencias en Drive y equipo.
 * 2. Apartado de Revisores / Dirección: Revisión, aprobación/ajuste de avances, edición de proyectos, configuración WBS y Drive.
 */

(function() {
  const AUTH_STORAGE_KEY = 'lab_geo_current_reviewer_session';

  // Cuentas oficiales de revisores autorizados del Laboratorio de Geotecnia
  const REVIEWER_ACCOUNTS = [
    {
      id: 'REV-001',
      memberId: 'MEM-001',
      username: 'jecolmenaresm',
      email: 'jecolmenaresm@unal.edu.co',
      password: 'colmenares2026',
      name: 'Prof. Julio Esteban Colmenares Montañez, Ph.D.',
      role: 'Director del Laboratorio de Geotecnia',
      category: 'Dirección',
      avatar: null
    },
    {
      id: 'REV-002',
      memberId: 'MEM-002',
      username: 'dafrodriguezram',
      email: 'dafrodriguezram@unal.edu.co',
      password: 'rodriguez2026',
      name: 'Ing. Daniel Felipe Rodríguez Ramírez',
      role: 'Coordinador de Laboratorio e Investigación',
      category: 'Coordinación',
      avatar: null
    },
    {
      id: 'REV-003',
      memberId: 'MEM-003',
      username: 'eaprietos',
      email: 'eaprietos@unal.edu.co',
      password: 'prieto2026',
      name: 'Ing. Edwin Alexander Prieto Saavedra',
      role: 'Coordinador de Laboratorio y Operaciones',
      category: 'Coordinación',
      avatar: null
    },
    {
      id: 'REV-004',
      memberId: 'MEM-000',
      username: 'admin',
      email: 'labgeotec_fibog@unal.edu.co',
      password: 'geotecnia2026',
      name: 'Administración General del Laboratorio',
      role: 'Administrador del Sistema',
      category: 'Administración',
      avatar: null
    }
  ];

  class AuthService {
    constructor() {
      this.listeners = [];
      this.currentUser = this.loadSession();
    }

    loadSession() {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        // Validar que la cuenta aún exista en los revisores registrados
        const match = REVIEWER_ACCOUNTS.find(a => a.id === parsed.id || a.username === parsed.username);
        return match ? { ...match, password: undefined } : null;
      } catch (e) {
        console.warn('Error loading auth session:', e);
        return null;
      }
    }

    /**
     * Comprueba si hay una sesión activa de revisor
     * @returns {boolean}
     */
    isReviewer() {
      return this.currentUser !== null;
    }

    /**
     * Retorna el usuario revisor actual o null si está en modo auxiliar
     */
    getCurrentUser() {
      return this.currentUser;
    }

    /**
     * Retorna la lista de cuentas de revisores (sin exponer contraseñas) para ayudas en UI
     */
    getReviewerDirectory() {
      return REVIEWER_ACCOUNTS.map(acc => ({
        id: acc.id,
        memberId: acc.memberId,
        username: acc.username,
        email: acc.email,
        name: acc.name,
        role: acc.role,
        category: acc.category
      }));
    }

    /**
     * Iniciar sesión como revisor con usuario/correo y contraseña
     * @param {string} usernameOrEmail - Nombre de usuario o correo institucional
     * @param {string} password - Contraseña
     * @param {boolean} remember - Si se debe recordar en localStorage
     * @returns {{ success: boolean, message: string, user?: object }}
     */
    login(usernameOrEmail, password, remember = true) {
      if (!usernameOrEmail || !password) {
        return { success: false, message: 'Por favor ingresa usuario/correo y contraseña.' };
      }

      const cleanInput = usernameOrEmail.trim().toLowerCase();
      const cleanPass = password.trim();

      const account = REVIEWER_ACCOUNTS.find(a => 
        (a.username.toLowerCase() === cleanInput || a.email.toLowerCase() === cleanInput) &&
        a.password === cleanPass
      );

      if (!account) {
        return {
          success: false,
          message: 'Credenciales inválidas. Verifica tu usuario/correo y contraseña institucional de revisor.'
        };
      }

      const safeUser = {
        id: account.id,
        memberId: account.memberId,
        username: account.username,
        email: account.email,
        name: account.name,
        role: account.role,
        category: account.category,
        loginAt: new Date().toISOString()
      };

      this.currentUser = safeUser;

      if (remember) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser));
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser));
      }

      this.notify();
      return { success: true, message: `Bienvenido, ${account.name}`, user: safeUser };
    }

    /**
     * Cerrar sesión de revisor y volver al apartado de estudiantes auxiliares
     */
    logout() {
      this.currentUser = null;
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      this.notify();
    }

    /**
     * Suscripción a cambios de autenticación
     */
    subscribe(callback) {
      this.listeners.push(callback);
      return () => {
        this.listeners = this.listeners.filter(cb => cb !== callback);
      };
    }

    notify() {
      this.listeners.forEach(cb => {
        try {
          cb(this.currentUser);
        } catch (err) {
          console.error('Error in auth subscriber:', err);
        }
      });
    }
  }

  window.GeoAuth = new AuthService();
})();
