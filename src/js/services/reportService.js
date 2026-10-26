/**
 * Servicio de Generación de Informes Semanales (PDF y Excel)
 * para el Laboratorio de Geotecnia
 */

window.GeoReport = {
  getWeeklyReportData(weekNumber, year = new Date().getFullYear()) {
    const projects = window.GeoStorage.getProjects();
    const members = window.GeoStorage.getMembers();
    const logs = window.GeoStorage.getLogs();
    const routines = window.GeoStorage.getRecurringTasks ? window.GeoStorage.getRecurringTasks() : [];
    const practices = window.GeoStorage.getLabPractices ? window.GeoStorage.getLabPractices() : [];
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
          activityId: log.activityId,
          activityName: act ? act.name : 'Labor Técnica General',
          deliverables: act ? act.deliverables : '',
          activityProgress: log.progressReported,
          weight: act ? act.weight : 0,
          memberId: log.memberId,
          memberName: log.memberName,
          date: log.date,
          notes: log.notes,
          attachments: log.attachments || [],
          hours: Number(log.hoursWorked) || 0,
          reviewComments: log.reviewComments || '',
          reviewedBy: log.reviewedBy
        };
      });

      return {
        id: proj.id,
        code: proj.code,
        name: proj.name,
        type: proj.type,
        client: proj.client || 'Universidad Nacional de Colombia',
        deadline: proj.deadline,
        status: proj.status,
        currentProgress: currentProgress,
        weeklyHours: weeklyHours,
        workedActivities: workedActivities,
        hasActivityThisWeek: workedActivities.length > 0,
        activitiesCount: (proj.activities || []).length
      };
    });

    const memberContributions = members.map(m => {
      const memberLogs = weeklyLogs.filter(l => l.memberId === m.id);
      const totalHours = memberLogs.reduce((sum, l) => sum + (Number(l.hoursWorked) || 0), 0);
      const projectsWorked = [...new Set(memberLogs.map(l => l.projectId))];

      const tasks = memberLogs.map(log => {
        const proj = projects.find(p => p.id === log.projectId);
        const act = proj && proj.activities ? proj.activities.find(a => a.id === log.activityId) : null;
        return {
          logId: log.id,
          projectCode: proj ? proj.code : 'PRJ',
          projectName: proj ? proj.name : 'Proyecto General',
          projectType: proj ? proj.type : '',
          activityName: act ? act.name : 'Labor Técnica Asignada',
          deliverables: act ? act.deliverables : '',
          date: log.date,
          hours: Number(log.hoursWorked) || 0,
          progressReported: log.progressReported,
          notes: log.notes,
          attachments: log.attachments || [],
          reviewComments: log.reviewComments || ''
        };
      });

      return {
        id: m.id,
        name: m.name,
        role: m.role,
        category: m.category,
        totalHours: totalHours,
        activitiesCount: memberLogs.length,
        projectsCount: projectsWorked.length,
        tasks: tasks,
        logs: memberLogs
      };
    }).filter(m => m.totalHours > 0 || m.activitiesCount > 0);

    // Rutinas operativas 5S completadas en la semana
    const completedRoutines = routines.filter(r => {
      if (!r.lastCompletedDate) return false;
      const d = new Date(r.lastCompletedDate + 'T00:00:00');
      return d >= range.start && d <= range.end;
    });

    // Prácticas docentes en el periodo
    const weeklyPractices = practices.filter(p => {
      if (!p.date) return false;
      const d = new Date(p.date + 'T00:00:00');
      return (d >= range.start && d <= range.end) || p.status === 'En Preparación de Material' || p.status === 'Lista para Iniciar';
    });

    return {
      weekNumber,
      year,
      dateRange: range.label,
      startDate: range.start,
      endDate: range.end,
      generatedAt: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      totalProjects: projects.length,
      activeProjectsCount: projects.filter(p => p.status === 'En Ejecución').length,
      projectsWithActivityCount: projectSummaries.filter(p => p.hasActivityThisWeek).length,
      totalWeeklyLogs: weeklyLogs.length,
      totalWeeklyHours: weeklyLogs.reduce((sum, l) => sum + (Number(l.hoursWorked) || 0), 0),
      projectSummaries,
      memberContributions,
      completedRoutines,
      weeklyPractices
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
  <title>Informe Técnico Semanal - Laboratorio de Geotecnia UNAL</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; color: #0f172a; line-height: 1.45;">
  <div style="max-width: 720px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.08); border: 1px solid #cbd5e1;">
    
    <!-- Membrete Institucional UNAL -->
    <div style="background-color: #00361f; background: linear-gradient(135deg, #002414 0%, #00361f 55%, #004f2d 100%); padding: 24px 28px; border-bottom: 4px solid #94b43b; color: #ffffff;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #94b43b; display: block; margin-bottom: 4px;">
              UNIVERSIDAD NACIONAL DE COLOMBIA • SEDE BOGOTÁ
            </span>
            <h1 style="font-size: 19px; font-weight: 800; margin: 0 0 4px 0; color: #ffffff; letter-spacing: -0.3px; line-height: 1.25;">
              Informe Técnico Semanal de Gestión y Ensayos
            </h1>
            <p style="font-size: 11px; margin: 0; color: #cbd5e1; font-weight: 500;">
              Facultad de Ingeniería • Departamento de Ingeniería Civil y Agrícola • Laboratorio de Geotecnia
            </p>
          </td>
          <td align="right" style="vertical-align: top;">
            <div style="background: rgba(148, 180, 59, 0.15); border: 1px solid #94b43b; padding: 6px 12px; border-radius: 6px; text-align: center; white-space: nowrap;">
              <span style="font-size: 11px; font-weight: 800; color: #94b43b; display: block;">SEMANA ${data.weekNumber}</span>
              <span style="font-size: 10px; color: #e2e8f0; font-family: monospace;">AÑO ${data.year}</span>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <div style="padding: 24px 28px;">
      
      <!-- Ficha Técnica de Control Semanal -->
      <table width="100%" cellpadding="6" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 11px; margin-bottom: 20px; color: #1e293b;">
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #475569;">Periodo Reportado:</strong> ${data.dateRange}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right;"><strong style="color: #475569;">Fecha de Emisión:</strong> ${data.generatedAt}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px;"><strong style="color: #475569;">Proyectos con Ejecución:</strong> ${data.projectsWithActivityCount} de ${data.totalProjects} registrados</td>
          <td style="padding: 8px 12px; text-align: right;"><strong style="color: #475569;">Horas-Hombre en Semana:</strong> <span style="color: #004f2d; font-weight: 800;">${data.totalWeeklyHours.toFixed(1)} hrs</span> (${data.totalWeeklyLogs} registros validados)</td>
        </tr>
      </table>

      ${customNotes ? `
        <!-- Memorando / Observaciones de Coordinación -->
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #d97706; padding: 12px 16px; border-radius: 6px; font-size: 11px; color: #78350f; margin-bottom: 22px;">
          <strong style="color: #92400e; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Memorando / Observaciones de Coordinación:</strong>
          <div style="line-height: 1.5;">${customNotes.replace(/\n/g, '<br>')}</div>
        </div>
      ` : ''}

      <!-- 1. LABORES Y ENSAYOS DESARROLLADOS POR CADA INTEGRANTE -->
      <div style="margin-bottom: 26px;">
        <div style="border-bottom: 2px solid #00361f; padding-bottom: 4px; margin-bottom: 12px;">
          <h2 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #00361f; margin: 0; letter-spacing: 0.5px;">
            1. Detalle de Labores y Ensayos Desarrollados por Integrante
          </h2>
          <span style="font-size: 10px; color: #64748b;">Bitácora técnica de turnos, ensayos y actividades individuales reportadas</span>
        </div>

        ${data.memberContributions.length === 0 ? `
          <p style="font-size: 11px; color: #64748b; font-style: italic; padding: 12px; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; margin: 0;">
            No se registraron horas ni turnos de laboratorio aprobados durante esta semana.
          </p>
        ` : data.memberContributions.map(m => `
          <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 14px; overflow: hidden;">
            
            <!-- Encabezado de Integrante -->
            <div style="background-color: #f1f5f9; padding: 10px 14px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 12px; color: #0f172a;">${m.name}</strong>
                <span style="font-size: 10px; color: #475569; margin-left: 6px;">• ${m.role} (${m.category})</span>
              </div>
              <div style="text-align: right;">
                <span style="background-color: #e2e8f0; color: #00361f; font-weight: 800; font-size: 11px; padding: 3px 8px; border-radius: 4px; font-family: monospace;">
                  ${m.totalHours.toFixed(1)} hrs dedicadas
                </span>
              </div>
            </div>

            <!-- Tareas ejecutadas por este integrante -->
            <div style="padding: 10px 14px;">
              <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-size: 11px;">
                ${m.tasks.map((t, tIdx) => `
                  <tr style="border-bottom: ${tIdx === m.tasks.length - 1 ? 'none' : '1px solid #f1f5f9'};">
                    <td style="vertical-align: top; width: 85px; padding: 8px 6px 8px 0; color: #64748b; font-family: monospace; font-size: 10px;">
                      <strong>${t.date}</strong><br>
                      <span style="color: #004f2d; font-weight: bold;">${t.hours} hrs</span>
                    </td>
                    <td style="vertical-align: top; padding: 8px 6px;">
                      <div style="font-weight: bold; color: #0f172a; margin-bottom: 2px;">
                        <span style="color: #004f2d; font-family: monospace;">[${t.projectCode}]</span> ${t.projectName}
                      </div>
                      <div style="color: #334155; font-size: 11px; font-weight: 600; margin-bottom: 4px;">
                        Actividad: ${t.activityName} ${t.deliverables ? `(Entregable: ${t.deliverables})` : ''}
                      </div>
                      <div style="color: #1e293b; background-color: #f8fafc; border-left: 3px solid #94b43b; padding: 6px 10px; border-radius: 4px; font-size: 11px; line-height: 1.4; margin-bottom: 4px;">
                        ${t.notes}
                      </div>
                      ${(t.attachments && t.attachments.length > 0) ? `
                        <div style="font-size: 10px; color: #004f2d; margin-top: 4px;">
                          <strong>Soportes / Datos en Drive:</strong>
                          ${t.attachments.map(att => `
                            <a href="${att.url || 'https://drive.google.com'}" target="_blank" style="color: #004f2d; text-decoration: underline; margin-left: 6px; font-weight: 600;">
                              [${att.name}]
                            </a>
                          `).join('')}
                        </div>
                      ` : ''}
                      ${t.reviewComments ? `
                        <div style="font-size: 10px; color: #475569; margin-top: 3px; font-style: italic;">
                          Validación técnica: "${t.reviewComments}"
                        </div>
                      ` : ''}
                    </td>
                    <td style="vertical-align: top; width: 70px; text-align: right; padding: 8px 0 8px 6px;">
                      <span style="font-size: 10px; font-weight: bold; color: #166534; background-color: #dcfce7; padding: 2px 6px; border-radius: 4px;">
                        ${t.progressReported}%
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </table>
            </div>

          </div>
        `).join('')}
      </div>

      <!-- 2. ESTADO Y EJECUCIÓN TÉCNICA POR PROYECTO -->
      <div style="margin-bottom: 26px;">
        <div style="border-bottom: 2px solid #00361f; padding-bottom: 4px; margin-bottom: 12px;">
          <h2 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #00361f; margin: 0; letter-spacing: 0.5px;">
            2. Estado y Ejecución Técnica por Proyecto
          </h2>
          <span style="font-size: 10px; color: #64748b;">Consolidado de avance ponderado WBS y actividades realizadas en el periodo</span>
        </div>

        <!-- Tabla Matriz General -->
        <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-size: 11px; margin-bottom: 16px; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background-color: #00361f; color: #ffffff; text-align: left; font-size: 10px; text-transform: uppercase;">
              <th style="padding: 8px 10px;">Código</th>
              <th style="padding: 8px 10px;">Proyecto</th>
              <th style="padding: 8px 10px;">Tipo / Entidad</th>
              <th style="padding: 8px 10px; text-align: center;">Avance Global</th>
              <th style="padding: 8px 10px; text-align: center;">Horas Semana</th>
              <th style="padding: 8px 10px; text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${data.projectSummaries.map((p, idx) => `
              <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 10px; font-family: monospace; font-weight: bold; color: #0f172a;">${p.code}</td>
                <td style="padding: 8px 10px; font-weight: 600; color: #1e293b;">${p.name}</td>
                <td style="padding: 8px 10px; color: #475569; font-size: 10px;">${p.type} • ${p.client}</td>
                <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #004f2d; font-family: monospace;">${p.currentProgress}%</td>
                <td style="padding: 8px 10px; text-align: center; font-weight: ${p.weeklyHours > 0 ? 'bold' : 'normal'}; color: ${p.weeklyHours > 0 ? '#00361f' : '#94a3b8'};">
                  ${p.weeklyHours > 0 ? p.weeklyHours + ' hrs' : '-'}
                </td>
                <td style="padding: 8px 10px; text-align: center;">
                  <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; background-color: ${p.status === 'En Ejecución' ? '#dcfce7' : '#f1f5f9'}; color: ${p.status === 'En Ejecución' ? '#166534' : '#475569'};">
                    ${p.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Detalle específico de los proyectos con ejecución en la semana -->
        ${data.projectSummaries.filter(p => p.hasActivityThisWeek).map(p => `
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #00361f; border-radius: 6px; padding: 12px 14px; margin-bottom: 10px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: 800; font-size: 12px; color: #00361f;">
                [${p.code}] ${p.name}
              </span>
              <span style="font-size: 11px; font-weight: bold; color: #004f2d;">
                ${p.currentProgress}% completado (${p.weeklyHours} hrs aplicadas)
              </span>
            </div>
            <div style="color: #475569; font-size: 10px; margin-bottom: 8px;">
              Entidad/Cliente: <strong>${p.client}</strong> • Tipo: ${p.type} • Estado: ${p.status}
            </div>

            <!-- Actividades específicas trabajadas -->
            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px;">
              <strong style="color: #334155; font-size: 10px; text-transform: uppercase; display: block; margin-bottom: 4px;">
                Actividades y ensayos desarrollados esta semana:
              </strong>
              ${p.workedActivities.map(act => `
                <div style="border-bottom: 1px solid #f1f5f9; padding: 5px 0;">
                  <div style="display: flex; justify-content: space-between;">
                    <span style="font-weight: 600; color: #0f172a;">• ${act.activityName}</span>
                    <span style="color: #64748b; font-size: 10px;">${act.memberName} (${act.hours} hrs, ${act.date})</span>
                  </div>
                  <div style="color: #334155; font-size: 10.5px; padding-left: 10px; margin-top: 2px;">
                    ${act.notes}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 3. GESTIÓN OPERATIVA, RUTINAS 5S Y PRÁCTICAS DOCENTES -->
      ${((data.completedRoutines && data.completedRoutines.length > 0) || (data.weeklyPractices && data.weeklyPractices.length > 0)) ? `
        <div style="margin-bottom: 26px;">
          <div style="border-bottom: 2px solid #00361f; padding-bottom: 4px; margin-bottom: 12px;">
            <h2 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #00361f; margin: 0; letter-spacing: 0.5px;">
              3. Operación de Laboratorio: Protocolo 5S y Prácticas Docentes
            </h2>
            <span style="font-size: 10px; color: #64748b;">Mantenimiento, aseo de instalaciones y soporte a asignaturas de cátedra</span>
          </div>

          ${(data.completedRoutines && data.completedRoutines.length > 0) ? `
            <div style="margin-bottom: 12px;">
              <strong style="font-size: 11px; color: #00361f; display: block; margin-bottom: 4px;">Rutinas de Aseo y Mantenimiento 5S Ejecutadas:</strong>
              <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-size: 10.5px; border: 1px solid #cbd5e1;">
                <thead style="background-color: #f1f5f9; color: #475569; text-align: left;">
                  <tr>
                    <th style="padding: 6px 8px;">Rutina / Protocolo</th>
                    <th style="padding: 6px 8px;">Área</th>
                    <th style="padding: 6px 8px;">Responsable</th>
                    <th style="padding: 6px 8px;">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.completedRoutines.map(r => `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 6px 8px; font-weight: 600; color: #1e293b;">${r.title}</td>
                      <td style="padding: 6px 8px; color: #64748b;">${r.area}</td>
                      <td style="padding: 6px 8px; color: #334155;">${r.lastCompletedByName || 'Personal Auxiliar'}</td>
                      <td style="padding: 6px 8px; color: #475569; font-family: monospace;">${r.lastCompletedDate}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          ${(data.weeklyPractices && data.weeklyPractices.length > 0) ? `
            <div style="margin-top: 10px;">
              <strong style="font-size: 11px; color: #00361f; display: block; margin-bottom: 4px;">Prácticas de Laboratorio Programadas / en Preparación:</strong>
              <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-size: 10.5px; border: 1px solid #cbd5e1;">
                <thead style="background-color: #f1f5f9; color: #475569; text-align: left;">
                  <tr>
                    <th style="padding: 6px 8px;">Asignatura</th>
                    <th style="padding: 6px 8px;">Profesor Titular</th>
                    <th style="padding: 6px 8px;">Fecha</th>
                    <th style="padding: 6px 8px; text-align: center;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.weeklyPractices.map(p => `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 6px 8px; font-weight: 600; color: #1e293b;">${p.courseName}</td>
                      <td style="padding: 6px 8px; color: #334155;">${p.professor || 'Docente Titular'}</td>
                      <td style="padding: 6px 8px; color: #475569; font-family: monospace;">${p.date}</td>
                      <td style="padding: 6px 8px; text-align: center;">
                        <span style="font-size: 9.5px; font-weight: bold; color: #004f2d; background-color: #ecfccb; padding: 2px 6px; border-radius: 4px;">
                          ${p.status}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Control de Firmas Institucionales -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 28px; padding-top: 20px; border-top: 2px solid #cbd5e1; font-size: 10px; color: #475569; text-align: center;">
        <tr>
          <td width="33%" style="padding: 0 10px; vertical-align: top;">
            <div style="border-bottom: 1px solid #64748b; margin: 0 auto 6px auto; width: 140px;"></div>
            <strong style="color: #0f172a; display: block; font-size: 10.5px;">Prof. Julio Esteban Colmenares, Ph.D.</strong>
            Director Laboratorio de Geotecnia<br>
            <span style="color: #94a3b8; font-size: 9px;">Universidad Nacional de Colombia</span>
          </td>
          <td width="33%" style="padding: 0 10px; vertical-align: top;">
            <div style="border-bottom: 1px solid #64748b; margin: 0 auto 6px auto; width: 140px;"></div>
            <strong style="color: #0f172a; display: block; font-size: 10.5px;">Ing. Daniel Felipe Rodríguez R.</strong>
            Coordinador de Laboratorio e Investigación<br>
            <span style="color: #94a3b8; font-size: 9px;">Universidad Nacional de Colombia</span>
          </td>
          <td width="33%" style="padding: 0 10px; vertical-align: top;">
            <div style="border-bottom: 1px solid #64748b; margin: 0 auto 6px auto; width: 140px;"></div>
            <strong style="color: #0f172a; display: block; font-size: 10.5px;">Ing. Edwin Alexander Prieto S.</strong>
            Coordinador de Operaciones<br>
            <span style="color: #94a3b8; font-size: 9px;">Universidad Nacional de Colombia</span>
          </td>
        </tr>
      </table>

    </div>

    <!-- Pie del Documento -->
    <div style="background-color: #002414; padding: 14px 20px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 2px solid #94b43b;">
      Universidad Nacional de Colombia • Sede Bogotá • Facultad de Ingeniería • Edificio 407 (Manuel Ancízar)<br>
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

    const defaultTo = options.to !== undefined && options.to !== null ? options.to : 'jecolmenaresm@unal.edu.co';
    const defaultCc = options.cc !== undefined && options.cc !== null ? options.cc : 'dafrodriguezram@unal.edu.co, eaprietos@unal.edu.co, labgeotec_fibog@unal.edu.co';
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

