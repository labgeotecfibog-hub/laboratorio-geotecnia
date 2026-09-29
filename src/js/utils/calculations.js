/**
 * Utilidades matemáticas y de cálculo para la Plataforma de Geotecnia
 */

window.GeoUtils = {
  /**
   * Calcula el avance ponderado total de un proyecto según sus actividades y sus pesos (%)
   * Fórmula: Avance = Sum( (Actividad_i.progress * Actividad_i.weight) / 100 )
   */
  calculateProjectProgress(project) {
    if (!project || !project.activities || project.activities.length === 0) {
      return 0;
    }

    const totalWeight = project.activities.reduce((sum, act) => sum + (Number(act.weight) || 0), 0);
    if (totalWeight === 0) return 0;

    const weightedSum = project.activities.reduce((sum, act) => {
      const progress = Math.min(100, Math.max(0, Number(act.progress) || 0));
      const weight = Number(act.weight) || 0;
      return sum + (progress * weight);
    }, 0);

    const finalProgress = weightedSum / totalWeight;
    return Math.round(finalProgress * 10) / 10;
  },

  /**
   * Determina el estado del semáforo y color según el progreso y la fecha límite
   */
  getProjectHealth(project) {
    const progress = this.calculateProjectProgress(project);
    if (progress >= 100) {
      return { status: 'Finalizado', color: 'emerald', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }

    if (!project.deadline) {
      return { status: 'En Ejecución', color: 'blue', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300' };
    }

    const now = new Date();
    const deadline = new Date(project.deadline);
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0 && progress < 100) {
      return { status: 'Retrasado', color: 'red', badgeClass: 'bg-red-100 text-red-800 border-red-300', diffDays };
    } else if (diffDays <= 7 && progress < 85) {
      return { status: 'En Riesgo', color: 'amber', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300', diffDays };
    } else {
      return { status: 'A Tiempo', color: 'emerald', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300', diffDays };
    }
  },

  /**
   * Obtiene el número de semana ISO del año
   */
  getISOWeekNumber(d = new Date()) {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  },

  /**
   * Obtiene el rango de fechas (Lunes a Domingo) de una semana dada en un año
   */
  getWeekDateRange(weekNumber, year = new Date().getFullYear()) {
    const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    const ISOweekEnd = new Date(ISOweekStart);
    ISOweekEnd.setDate(ISOweekStart.getDate() + 6);

    const formatShort = (dt) => dt.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
    return {
      start: ISOweekStart,
      end: ISOweekEnd,
      label: `${formatShort(ISOweekStart)} - ${formatShort(ISOweekEnd)}, ${year}`
    };
  },

  /**
   * Formatea fechas a formato legible colombiano
   */
  formatDateCO(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
    return d.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },

  /**
   * Genera el HTML de avatar para un integrante: foto real si está disponible o monograma institucional con siglas
   * @param {Object} member - Objeto del integrante
   * @param {'xl'|'md'|'sm'|'xs'} size - Tamaño del avatar
   * @param {string} extraClass - Clases CSS adicionales
   */
  renderMemberAvatar(member, size = 'xl', extraClass = '') {
    if (!member) {
      return `<div class="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">?</div>`;
    }

    const hasRealAvatar = member.avatar && 
      typeof member.avatar === 'string' &&
      !member.avatar.includes('unsplash.com') && 
      !member.avatar.includes('dicebear.com') &&
      member.avatar.trim() !== '';

    if (hasRealAvatar) {
      const sizeClasses = {
        xl: 'w-14 h-14 rounded-2xl ring-2 ring-unal-400/40 shadow-md',
        md: 'w-8 h-8 rounded-xl ring-1 ring-unal-400/40 shadow-xs',
        sm: 'h-5 w-5 rounded-full ring-2 ring-white',
        xs: 'w-3.5 h-3.5 rounded-full ring-1 ring-white'
      };
      return `<img src="${member.avatar}" alt="${member.name}" class="${sizeClasses[size] || sizeClasses.md} object-cover ${extraClass}">`;
    }

    // Monograma institucional con siglas / iniciales
    const initials = (member.initials || member.name || 'U').trim();
    const text = (size === 'xl')
      ? (initials.length > 5 ? initials.substring(0, 4) : initials)
      : (initials.length <= 3 ? initials : initials.substring(0, 2));

    // Paleta cromática institucional según categoría o rol
    let colorScheme = 'from-unal-800 to-unal-950 text-unal-300 border-unal-600/40';
    if (member.category) {
      if (member.category.includes('Director') || member.category.includes('Docente')) {
        colorScheme = 'from-unal-800 to-emerald-950 text-unal-300 border-unal-500/50';
      } else if (member.category.includes('Coordinador')) {
        colorScheme = 'from-teal-800 to-slate-900 text-teal-300 border-teal-500/40';
      } else if (member.category.includes('Posgrado') || member.category.includes('Tesista')) {
        colorScheme = 'from-slate-800 to-slate-950 text-slate-300 border-slate-600/40';
      } else {
        colorScheme = 'from-emerald-900 to-slate-900 text-emerald-300 border-emerald-600/40';
      }
    }

    if (size === 'xl') {
      return `
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br ${colorScheme} flex items-center justify-center font-heading font-black text-sm tracking-wider shadow-md ring-2 ring-unal-400/40 border select-none shrink-0 ${extraClass}" title="${member.name}">
          <span>${text}</span>
        </div>
      `;
    } else if (size === 'md') {
      return `
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br ${colorScheme} flex items-center justify-center font-heading font-black text-xs tracking-wider shadow-xs ring-1 ring-unal-400/30 border select-none shrink-0 ${extraClass}" title="${member.name}">
          <span>${text}</span>
        </div>
      `;
    } else if (size === 'sm') {
      return `
        <span class="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-br ${colorScheme} text-[9px] font-mono font-bold ring-2 ring-white select-none shrink-0 ${extraClass}" title="${member.name}">
          ${text.substring(0, 2)}
        </span>
      `;
    } else { // xs
      return `
        <span class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gradient-to-br ${colorScheme} text-[7px] font-mono font-bold select-none shrink-0 ${extraClass}" title="${member.name}">
          ${text.substring(0, 2)}
        </span>
      `;
    }
  }
};
