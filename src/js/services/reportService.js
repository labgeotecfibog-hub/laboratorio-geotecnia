/**
 * Servicio de Generación de Informes Semanales (PDF y Excel)
 * para el Laboratorio de Geotecnia
 */

window.GeoReport = {
  getWeeklyReportData(weekNumber, year = new Date().getFullYear()) {
    const projects = window.GeoStorage.getProjects();
    const members = window.GeoStorage.getMembers();
    const logs = window.GeoStorage.getLogs();
    const range = window.GeoUtils.getWeekDateRange(weekNumber, year);

    const weeklyLogs = logs.filter(log => {
      const logDate = new Date(log.date + (log.date.includes('T') ? '' : 'T00:00:00'));
      return logDate >= range.start && logDate <= range.end && log.status === 'Aprobado';
    });

    const projectSummaries = projects.map(proj => {
      const currentProgress = window.GeoUtils.calculateProjectProgress(proj);
      const projLogs = weeklyLogs.filter(l => l.projectId === proj.id);
      const weeklyHours = projLogs.reduce((sum, l) => sum + (Number(l.hoursWorked) || 0), 0);

      const workedActivities = projLogs.map(log => {
        const act = (proj.activities || []).find(a => a.id === log.activityId);
        return {
          logId: log.id,
          activityName: act ? act.name : 'Actividad General',
          activityProgress: log.progressReported,
          weight: act ? act.weight : 0,
          memberName: log.memberName,
          date: log.date,
          notes: log.notes,
          attachments: log.attachments || [],
          hours: log.hoursWorked
        };
      });

      return {
        id: proj.id,
        code: proj.code,
        name: proj.name,
        type: proj.type,
        client: proj.client,
        deadline: proj.deadline,
        status: proj.status,
        currentProgress: currentProgress,
        weeklyHours: weeklyHours,
        workedActivities: workedActivities,
        hasActivityThisWeek: workedActivities.length > 0
      };
    });

    const memberContributions = members.map(m => {
      const memberLogs = weeklyLogs.filter(l => l.memberId === m.id);
      const totalHours = memberLogs.reduce((sum, l) => sum + (Number(l.hoursWorked) || 0), 0);
      const projectsWorked = [...new Set(memberLogs.map(l => l.projectId))];

      return {
        id: m.id,
        name: m.name,
        role: m.role,
        category: m.category,
        totalHours: totalHours,
        activitiesCount: memberLogs.length,
        projectsCount: projectsWorked.length,
        logs: memberLogs
      };
    }).filter(m => m.totalHours > 0 || m.activitiesCount > 0);

    return {
      weekNumber,
      year,
      dateRange: range.label,
      startDate: range.start,
      endDate: range.end,
      generatedAt: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      totalProjects: projects.length,
      activeProjectsCount: projects.filter(p => p.status === 'En Ejecución').length,
      totalWeeklyLogs: weeklyLogs.length,
      totalWeeklyHours: weeklyLogs.reduce((sum, l) => sum + (Number(l.hoursWorked) || 0), 0),
      projectSummaries,
      memberContributions
    };
  },

  exportToExcel(weekNumber, year = new Date().getFullYear()) {
    if (typeof XLSX === 'undefined') {
      alert('La biblioteca de Excel (SheetJS) se está cargando. Por favor intenta de nuevo.');
      return;
    }

    const data = this.getWeeklyReportData(weekNumber, year);
    const wb = XLSX.utils.book_new();

    const projectsData = [
      ['INFORME SEMANAL DE AVANCE - LABORATORIO DE GEOTECNIA'],
      [`Semana No. ${data.weekNumber} (${data.dateRange})`],
      [`Generado: ${data.generatedAt}`],
      [],
      ['Código', 'Nombre del Proyecto', 'Tipo', 'Entidad / Cliente', 'Fecha Límite', '% Avance Actual', 'Horas Esta Semana', 'Estado']
    ];

    data.projectSummaries.forEach(p => {
      projectsData.push([
        p.code,
        p.name,
        p.type,
        p.client || 'N/A',
        p.deadline || 'N/A',
        `${p.currentProgress}%`,
        p.weeklyHours,
        p.status
      ]);
    });

    const wsProjects = XLSX.utils.aoa_to_sheet(projectsData);
    XLSX.utils.book_append_sheet(wb, wsProjects, 'Resumen_Proyectos');

    const activitiesData = [
      ['DETALLE DE ACTIVIDADES Y EVIDENCIAS TRABAJADAS'],
      [`Semana No. ${data.weekNumber} (${data.dateRange})`],
      [],
      ['Proyecto', 'Fecha', 'Actividad', '% Reportado', 'Responsable', 'Horas', 'Descripción / Observaciones', 'Anexos / Enlace Drive']
    ];

    data.projectSummaries.forEach(p => {
      p.workedActivities.forEach(act => {
        const driveLinks = (act.attachments || []).map(a => `${a.name} (${a.url})`).join('; ');
        activitiesData.push([
          `[${p.code}] ${p.name}`,
          act.date,
          act.activityName,
          `${act.activityProgress}%`,
          act.memberName,
          act.hours,
          act.notes,
          driveLinks || 'Sin anexos'
        ]);
      });
    });

    const wsActivities = XLSX.utils.aoa_to_sheet(activitiesData);
    XLSX.utils.book_append_sheet(wb, wsActivities, 'Actividades_Semanales');

    const membersData = [
      ['RESUMEN DE APORTES POR INTEGRANTE'],
      [`Semana No. ${data.weekNumber} (${data.dateRange})`],
      [],
      ['Nombre del Integrante', 'Rol', 'Categoría', 'Horas Registradas', 'Actividades Reportadas']
    ];

    data.memberContributions.forEach(m => {
      membersData.push([
        m.name,
        m.role,
        m.category,
        m.totalHours,
        m.activitiesCount
      ]);
    });

    const wsMembers = XLSX.utils.aoa_to_sheet(membersData);
    XLSX.utils.book_append_sheet(wb, wsMembers, 'Aportes_Integrantes');

    XLSX.writeFile(wb, `Informe_Semanal_Geotecnia_Semana_${weekNumber}_${year}.xlsx`);
  },

  async exportToPDF(elementId, weekNumber, year = new Date().getFullYear(), btnElement = null) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let originalHtml = '';
    if (btnElement) {
      originalHtml = btnElement.innerHTML;
      btnElement.disabled = true;
      btnElement.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Generando PDF...</span>`;
      if (window.lucide) window.lucide.createIcons();
    }

    const filename = `Informe_Semanal_Geotecnia_Semana_${weekNumber}_${year}.pdf`;
    const isHttp = window.location.protocol.startsWith('http');

    const opt = {
      margin: [8, 8, 8, 8],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: isHttp,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      if (typeof html2pdf !== 'undefined') {
        await html2pdf().set(opt).from(element).save();
      } else {
        window.print();
      }
    } catch (err) {
      console.warn('html2pdf encontró restricciones locales en file://. Abriendo impresión a PDF institucional:', err);
      window.print();
    } finally {
      if (btnElement) {
        btnElement.disabled = false;
        btnElement.innerHTML = originalHtml;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  },

  /**
   * Genera la plantilla de correo electrónico HTML oficial UNAL para el Director
   */
  generateHtmlEmail(weekNumber, year = new Date().getFullYear(), customNotes = '') {
    const data = this.getWeeklyReportData(weekNumber, year);

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe Semanal - Laboratorio de Geotecnia UNAL</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b;">
  <div style="max-width: 680px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
    
    <!-- Encabezado Institucional UNAL -->
    <div style="background-color: #00361f; background: linear-gradient(135deg, #002414 0%, #00361f 50%, #004f2d 100%); padding: 24px 30px; border-bottom: 4px solid #94b43b; color: #ffffff;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #94b43b; display: block;">
              UNIVERSIDAD NACIONAL DE COLOMBIA • SEDE BOGOTÁ
            </span>
            <h1 style="font-size: 20px; font-weight: 800; margin: 4px 0 2px 0; color: #ffffff; letter-spacing: -0.5px;">
              Informe Semanal de Avance Geotécnico
            </h1>
            <p style="font-size: 12px; margin: 0; color: #cbd5e1;">
              Facultad de Ingeniería • Laboratorio de Geotecnia (Extensión e Investigación)
            </p>
          </td>
          <td align="right" style="vertical-align: top;">
            <div style="background: rgba(148, 180, 59, 0.2); border: 1px solid rgba(148, 180, 59, 0.4); padding: 6px 12px; border-radius: 8px; text-align: center;">
              <span style="font-size: 11px; font-weight: 800; color: #94b43b; display: block;">SEMANA ${data.weekNumber}</span>
              <span style="font-size: 9px; color: #e2e8f0;">${data.year}</span>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <div style="padding: 24px 30px;">
      
      <!-- Metadatos del Informe -->
      <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 12px; margin-bottom: 20px;">
        <tr>
          <td><strong>Periodo:</strong> ${data.dateRange}</td>
          <td align="right"><strong>Fecha de emisión:</strong> ${data.generatedAt}</td>
        </tr>
        <tr>
          <td><strong>Proyectos Activos:</strong> ${data.activeProjectsCount} en ejecución</td>
          <td align="right"><strong>Horas registradas esta semana:</strong> <span style="color: #004f2d; font-weight: bold;">${data.totalWeeklyHours.toFixed(1)} hrs</span></td>
        </tr>
      </table>

      ${customNotes ? `
        <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #713f12; margin-bottom: 20px;">
          <strong>Nota de Coordinación:</strong><br>
          ${customNotes.replace(/\n/g, '<br>')}
        </div>
      ` : ''}

      <!-- Resumen de Proyectos y Avance WBS -->
      <h2 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #00361f; margin: 18px 0 10px 0; border-bottom: 2px solid #004f2d; padding-bottom: 4px;">
        1. Estado y Avance Ponderado de Proyectos
      </h2>

      <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-size: 11px; margin-bottom: 24px;">
        <thead>
          <tr style="background-color: #00361f; color: #ffffff; text-align: left;">
            <th style="padding: 8px; border-top-left-radius: 6px;">Código</th>
            <th style="padding: 8px;">Proyecto</th>
            <th style="padding: 8px;">Tipo</th>
            <th style="padding: 8px; text-align: center;">% Avance</th>
            <th style="padding: 8px; text-align: center;">Horas</th>
            <th style="padding: 8px; text-align: center; border-top-right-radius: 6px;">Estado</th>
          </tr>
        </thead>
        <tbody>
          ${data.projectSummaries.map((p, idx) => `
            <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px; font-family: monospace; font-weight: bold; color: #0f172a;">${p.code}</td>
              <td style="padding: 8px; font-weight: 600; color: #1e293b;">${p.name}</td>
              <td style="padding: 8px; color: #64748b;">${p.type}</td>
              <td style="padding: 8px; text-align: center; font-weight: bold; color: #004f2d; font-family: monospace;">${p.currentProgress}%</td>
              <td style="padding: 8px; text-align: center; color: #475569;">${p.weeklyHours} hrs</td>
              <td style="padding: 8px; text-align: center;">
                <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; background-color: ${p.status === 'En Ejecución' ? '#dcfce7' : '#f1f5f9'}; color: ${p.status === 'En Ejecución' ? '#166534' : '#475569'};">
                  ${p.status}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Detalle de Actividades y Enlaces a Drive -->
      <h2 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #00361f; margin: 18px 0 10px 0; border-bottom: 2px solid #004f2d; padding-bottom: 4px;">
        2. Actividades Validadas y Evidencias en Google Drive
      </h2>

      ${data.projectSummaries.filter(p => p.hasActivityThisWeek).length === 0 ? `
        <p style="font-size: 12px; color: #64748b; font-style: italic;">No se registraron ensayos o actividades aprobadas durante esta semana.</p>
      ` : data.projectSummaries.filter(p => p.hasActivityThisWeek).map(p => `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <div style="font-size: 12px; font-weight: bold; color: #00361f; margin-bottom: 6px;">
            [${p.code}] ${p.name} (${p.currentProgress}% global)
          </div>
          ${p.workedActivities.map(act => `
            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; margin-top: 6px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between; font-weight: 600; color: #334155;">
                <span>📌 ${act.activityName}</span>
                <span style="color: #64748b;">${act.memberName} • ${act.hours} hrs</span>
              </div>
              <p style="margin: 4px 0 6px 0; color: #475569; font-style: italic;">"${act.notes}"</p>
              ${(act.attachments && act.attachments.length > 0) ? `
                <div style="margin-top: 4px;">
                  <strong style="color: #004f2d; font-size: 10px;">Anexos en Google Drive:</strong>
                  ${act.attachments.map(att => `
                    <a href="${att.url || 'https://drive.google.com'}" target="_blank" style="display: inline-block; margin-left: 4px; padding: 2px 6px; background-color: #ecfccb; color: #365314; text-decoration: none; border-radius: 4px; font-size: 10px; font-weight: bold;">
                      📎 ${att.name}
                    </a>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `).join('')}

      <!-- Aportes de Integrantes -->
      <h2 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #00361f; margin: 20px 0 10px 0; border-bottom: 2px solid #004f2d; padding-bottom: 4px;">
        3. Aportes por Integrante
      </h2>

      <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-size: 11px; margin-bottom: 24px;">
        <thead>
          <tr style="background-color: #f1f5f9; color: #475569; text-align: left;">
            <th style="padding: 6px;">Integrante</th>
            <th style="padding: 6px;">Rol / Categoría</th>
            <th style="padding: 6px; text-align: center;">Horas Registradas</th>
            <th style="padding: 6px; text-align: center;">Actividades</th>
          </tr>
        </thead>
        <tbody>
          ${data.memberContributions.map((m, idx) => `
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: ${idx % 2 === 0 ? '#ffffff' : '#fafafa'};">
              <td style="padding: 6px; font-weight: bold; color: #1e293b;">${m.name}</td>
              <td style="padding: 6px; color: #64748b;">${m.role}</td>
              <td style="padding: 6px; text-align: center; font-weight: bold; color: #004f2d;">${m.totalHours} hrs</td>
              <td style="padding: 6px; text-align: center; color: #475569;">${m.activitiesCount}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Firmas Institucionales -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #cbd5e1; font-size: 10px; color: #475569; text-align: center;">
        <tr>
          <td width="33%" style="padding: 0 10px;">
            <div style="border-bottom: 1px solid #94a3b8; margin: 0 auto 6px auto; width: 140px;"></div>
            <strong style="color: #0f172a; display: block;">Prof. Julio Esteban Colmenares, Ph.D.</strong>
            Director Laboratorio de Geotecnia
          </td>
          <td width="33%" style="padding: 0 10px;">
            <div style="border-bottom: 1px solid #94a3b8; margin: 0 auto 6px auto; width: 140px;"></div>
            <strong style="color: #0f172a; display: block;">Ing. Daniel Felipe Rodríguez R.</strong>
            Coordinador de Laboratorio e Investigación
          </td>
          <td width="33%" style="padding: 0 10px;">
            <div style="border-bottom: 1px solid #94a3b8; margin: 0 auto 6px auto; width: 140px;"></div>
            <strong style="color: #0f172a; display: block;">Ing. Edwin Alexander Prieto S.</strong>
            Coordinador de Operaciones
          </td>
        </tr>
      </table>

    </div>

    <!-- Pie del Correo -->
    <div style="background-color: #002414; padding: 14px 20px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 2px solid #94b43b;">
      Universidad Nacional de Colombia • Sede Bogotá • Facultad de Ingeniería • Edificio 407<br>
      Sistema de Información y Control del Laboratorio de Geotecnia • <a href="mailto:labgeotec_fibog@unal.edu.co" style="color: #94b43b; text-decoration: none;">labgeotec_fibog@unal.edu.co</a>
    </div>

  </div>
</body>
</html>
    `;
  },

  /**
   * Envía el informe semanal por correo electrónico al Director a través del Webhook de Apps Script
   */
  async sendWeeklyReportEmail(weekNumber, year = new Date().getFullYear(), options = {}) {
    const data = this.getWeeklyReportData(weekNumber, year);
    const htmlBody = this.generateHtmlEmail(weekNumber, year, options.customNotes || '');

    const defaultTo = options.to || 'jecolmenaresm@unal.edu.co';
    const defaultCc = options.cc || 'dfrodriguezr@unal.edu.co, eaprietos@unal.edu.co, labgeotec_fibog@unal.edu.co';
    const subject = options.subject || `[Informe Semanal] Lab. Geotecnia UNAL - Semana ${weekNumber} (${data.dateRange})`;

    return await window.GeoDrive.sendEmailReport({
      to: defaultTo,
      cc: defaultCc,
      subject: subject,
      htmlBody: htmlBody,
      weekNumber: weekNumber,
      year: year
    });
  }
};

