/**
 * Servicio de Integración con Google Drive para el Laboratorio de Geotecnia
 * Universidad Nacional de Colombia • Sede Bogotá
 */

window.GeoDrive = {
  /**
   * Genera la ruta organizada recomendada en Google Drive para un anexo de proyecto
   */
  generateDrivePath(project, fileName, date = new Date()) {
    const year = new Date(date).getFullYear();
    const weekNum = window.GeoUtils.getISOWeekNumber(new Date(date));
    const projectTypeFolder = project.type === 'Extensión' ? 'Extension' : 'Investigacion';
    const cleanProjectFolder = project.driveFolderName || `${project.code}_${(project.name || 'Proyecto').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}`;
    
    return `Laboratorio_Geotecnia/${year}/${projectTypeFolder}/${cleanProjectFolder}/Anexos/Semana_${weekNum}/${fileName}`;
  },

  /**
   * Convierte un archivo File/Blob a cadena base64 limpia
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  },

  /**
   * Verifica la conectividad con el Webhook de Google Apps Script
   */
  async testConnection(webhookUrl) {
    const url = webhookUrl || (window.GeoStorage.getDriveConfig() || {}).gasWebhookUrl;
    if (!url || url.trim() === '' || url.includes('SampleGeoScriptId')) {
      return {
        success: false,
        message: 'No has configurado una URL válida de Google Apps Script.'
      };
    }

    try {
      const payload = {
        action: 'ping',
        timestamp: new Date().toISOString()
      };

      const response = await fetch(url.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data && data.status === 'success') {
        return {
          success: true,
          message: data.message || 'Conexión exitosa con Google Drive.',
          accountEmail: data.accountEmail || 'Cuenta UNAL verificada'
        };
      } else {
        return {
          success: false,
          message: data.message || 'El script respondió con un estado no exitoso.'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error de conexión: ${error.message}. Asegúrate de haber desplegado el script como "Aplicación Web" con acceso para "Cualquier usuario".`
      };
    }
  },

  /**
   * Sube un archivo a Google Drive Institucional (@unal.edu.co) mediante Google Apps Script
   * Si no hay webhook configurado, genera un enlace simulado con previsualización local
   */
  async uploadFileToDrive(file, project, date = new Date()) {
    const config = window.GeoStorage.getDriveConfig();
    const drivePath = this.generateDrivePath(project, file.name, date);
    const hasWebhook = config.gasWebhookUrl && 
                       config.gasWebhookUrl.trim() !== '' && 
                       !config.gasWebhookUrl.includes('SampleGeoScriptId');

    let localPreviewUrl = '';
    try {
      localPreviewUrl = URL.createObjectURL(file);
    } catch (e) {
      localPreviewUrl = '';
    }

    // 1. Subida real si el Webhook está configurado
    if (hasWebhook) {
      try {
        const base64Data = await this.fileToBase64(file);
        const payload = {
          action: 'uploadFile',
          rootFolderId: config.rootFolderId || '',
          drivePath: drivePath,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          fileData: base64Data
        };

        const response = await fetch(config.gasWebhookUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result && result.status === 'success') {
          return {
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            type: this.getFileType(file.name),
            url: result.fileUrl || `https://drive.google.com/file/d/${result.fileId}/view?usp=sharing`,
            downloadUrl: result.downloadUrl || '',
            localPreviewUrl: localPreviewUrl,
            drivePath: drivePath,
            fileId: result.fileId,
            isRealUpload: true
          };
        } else {
          console.warn('El script de Google Drive retornó un error:', result);
        }
      } catch (err) {
        console.error('Error al conectar con Google Apps Script:', err);
      }
    }

    // 2. Modo Simulado / Fallback local cuando no hay webhook
    const simulatedFileId = 'gdrive_' + Math.random().toString(36).substring(2, 12);
    return {
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: this.getFileType(file.name),
      url: `https://drive.google.com/drive/folders/${project.driveFolderId || config.rootFolderId || '1Z9Y8X7W6V5U4T3S2R1Q'}?usp=sharing`,
      localPreviewUrl: localPreviewUrl,
      drivePath: drivePath,
      fileId: simulatedFileId,
      isRealUpload: false
    };
  },

  /**
   * Guarda una copia sincronizada de toda la base de datos en Google Drive institucional
   */
  async syncDatabaseToDrive() {
    const config = window.GeoStorage.getDriveConfig();
    if (!config.gasWebhookUrl || config.gasWebhookUrl.includes('SampleGeoScriptId')) {
      return { success: false, message: 'Webhook de Google Apps Script no configurado.' };
    }

    try {
      const allData = {
        version: '2026.1',
        syncDate: new Date().toISOString(),
        projects: window.GeoStorage.getProjects(),
        members: window.GeoStorage.getMembers(),
        logs: window.GeoStorage.getLogs(),
        driveConfig: config
      };

      const payload = {
        action: 'saveDatabase',
        rootFolderId: config.rootFolderId || '',
        databaseJson: JSON.stringify(allData, null, 2)
      };

      const res = await fetch(config.gasWebhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      return result;
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  /**
   * Envía un informe por correo electrónico a través del Webhook de Google Apps Script
   */
  async sendEmailReport(emailPayload) {
    const config = window.GeoStorage.getDriveConfig();
    const hasWebhook = config.gasWebhookUrl && 
                       config.gasWebhookUrl.trim() !== '' && 
                       !config.gasWebhookUrl.includes('SampleGeoScriptId');

    if (!hasWebhook) {
      return {
        success: false,
        message: 'No has configurado la URL de la Aplicación Web de Google Apps Script. Por favor ingresa a Configuración de Drive e ingresa la URL.'
      };
    }

    try {
      const payload = {
        action: 'sendEmail',
        to: emailPayload.to,
        cc: emailPayload.cc,
        subject: emailPayload.subject,
        htmlBody: emailPayload.htmlBody,
        weekNumber: emailPayload.weekNumber,
        year: emailPayload.year
      };

      const response = await fetch(config.gasWebhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      return {
        success: result && result.status === 'success',
        message: result.message || 'Correo procesado por el servidor de Google.'
      };
    } catch (err) {
      return {
        success: false,
        message: 'Error al enviar el correo: ' + err.message
      };
    }
  },

  getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['xlsx', 'xls', 'csv'].includes(ext)) return 'excel';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(ext)) return 'image';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['dwg', 'dxf'].includes(ext)) return 'cad';
    return 'file';
  },

  /**
   * Código de Google Apps Script optimizado para el Laboratorio de Geotecnia UNAL
   * Incluye: Carga de archivos a Drive, API de Base de Datos, Envío Inmediato de Correo y Disparador Automático Semanal (Cron)
   */
  getGoogleAppsScriptTemplate() {
    return `// ====================================================================
// PLATAFORMA LABORATORIO DE GEOTECNIA - UNIVERSIDAD NACIONAL DE COLOMBIA
// Google Apps Script: Carga en Drive, Base de Datos y Envío Semanal Automatizado
//
// PASOS DE INSTALACIÓN Y CONFIGURACIÓN:
// 1. Abre https://script.google.com con la cuenta @unal.edu.co del laboratorio.
// 2. Crea un proyecto nuevo llamado "Backend_Laboratorio_Geotecnia"
// 3. Pega este código completo reemplazando cualquier contenido.
// 4. Haz clic en "Implementar" > "Nueva implementación" > Tipo: "Aplicación web".
//    - Ejecutar como: "Yo" (tu cuenta institucional).
//    - Quién tiene acceso: "Cualquier usuario".
// 5. Copia la URL de la aplicación web y pégala en la configuración de la plataforma.
// 6. PARA ACTIVAR EL ENVÍO AUTOMÁTICO CADA VIERNES:
//    - En el editor de Apps Script, selecciona la función "configurarDisparadorViernes"
//    - Haz clic en "Ejecutar" (Run).
//    - ¡Listo! Se enviará automáticamente todos los viernes a las 17:00 (5:00 PM).
// ====================================================================

// Destinatarios oficiales predeterminados
var DIRECTOR_EMAIL = "jecolmenaresm@unal.edu.co";
var COORDINADORES_EMAIL = "dafrodriguezram@unal.edu.co, eaprietos@unal.edu.co, labgeotec_fibog@unal.edu.co";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ status: "error", message: "No data received" });
    }

    var data = JSON.parse(e.postData.contents);
    
    // --- 1. PING / PRUEBA DE CONEXIÓN ---
    if (data.action === "ping") {
      var userEmail = Session.getActiveUser().getEmail() || "labgeotec_fibog@unal.edu.co";
      return createJsonResponse({
        status: "success",
        message: "Conexión exitosa con el servicio de Google Drive y Correo del Laboratorio de Geotecnia.",
        accountEmail: userEmail,
        timestamp: new Date().toISOString()
      });
    }

    // --- 2. SUBIDA REAL DE ARCHIVOS A DRIVE ---
    if (data.action === "uploadFile") {
      var rootFolder;
      if (data.rootFolderId && data.rootFolderId.trim() !== "") {
        try {
          rootFolder = DriveApp.getFolderById(data.rootFolderId.trim());
        } catch (err) {
          rootFolder = getOrCreateFolder(DriveApp.getRootFolder(), "Laboratorio_Geotecnia");
        }
      } else {
        rootFolder = getOrCreateFolder(DriveApp.getRootFolder(), "Laboratorio_Geotecnia");
      }

      var pathParts = (data.drivePath || "").split("/");
      var currentFolder = rootFolder;

      for (var i = 1; i < pathParts.length - 1; i++) {
        if (pathParts[i] && pathParts[i].trim() !== "") {
          currentFolder = getOrCreateFolder(currentFolder, pathParts[i].trim());
        }
      }

      var decodedBytes = Utilities.base64Decode(data.fileData);
      var blob = Utilities.newBlob(decodedBytes, data.mimeType || "application/octet-stream", data.fileName);
      var newFile = currentFolder.createFile(blob);

      try {
        newFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (shareErr) {}

      return createJsonResponse({
        status: "success",
        fileId: newFile.getId(),
        fileUrl: newFile.getUrl(),
        downloadUrl: newFile.getDownloadUrl(),
        folderUrl: currentFolder.getUrl(),
        folderName: currentFolder.getName()
      });
    }

    // --- 3. GUARDAR COPIA DE LA BASE DE DATOS EN DRIVE ---
    if (data.action === "saveDatabase") {
      var rootFolder = getOrCreateFolder(DriveApp.getRootFolder(), "Laboratorio_Geotecnia");
      var fileName = "Laboratorio_Geotecnia_DB.json";
      var existingFiles = rootFolder.getFilesByName(fileName);
      var dbFile;

      if (existingFiles.hasNext()) {
        dbFile = existingFiles.next();
        dbFile.setContent(data.databaseJson);
      } else {
        dbFile = rootFolder.createFile(fileName, data.databaseJson, MimeType.PLAIN_TEXT);
      }

      return createJsonResponse({
        status: "success",
        message: "Base de datos sincronizada en Google Drive",
        fileUrl: dbFile.getUrl()
      });
    }

    // --- 4. ENVÍO DE CORREO ELECTRÓNICO INSTITUCIONAL ---
    if (data.action === "sendEmail") {
      var toRecipient = data.to || DIRECTOR_EMAIL;
      var ccRecipients = data.cc !== undefined ? data.cc : COORDINADORES_EMAIL;
      var subject = data.subject || "[Informe Semanal] Laboratorio de Geotecnia UNAL";
      var htmlContent = data.htmlBody;

      var emailPayload = {
        to: toRecipient,
        subject: subject,
        htmlBody: htmlContent,
        name: "Laboratorio de Geotecnia - UNAL Sede Bogotá"
      };

      if (ccRecipients && ccRecipients.toString().trim() !== "") {
        emailPayload.cc = ccRecipients.toString().trim();
      }

      MailApp.sendEmail(emailPayload);

      var confirmationMsg = "Informe semanal enviado con éxito a: " + toRecipient;
      if (emailPayload.cc) {
        confirmationMsg += " (CC: " + emailPayload.cc + ")";
      }

      return createJsonResponse({
        status: "success",
        message: confirmationMsg
      });
    }

    return createJsonResponse({ status: "unknown_action", action: data.action });

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

function doGet(e) {
  return createJsonResponse({
    status: "online",
    service: "Laboratorio de Geotecnia UNAL - Google Apps Script API",
    time: new Date().toISOString()
  });
}

// ====================================================================
// DISPARADOR AUTOMÁTICO PROGRAMADO (CRON SEMANAL)
// ====================================================================

/**
 * Se ejecuta automáticamente según el disparador programado (cada viernes a las 17:00)
 */
function enviarInformeSemanalAutomatico() {
  try {
    var rootFolder = getOrCreateFolder(DriveApp.getRootFolder(), "Laboratorio_Geotecnia");
    var dbFiles = rootFolder.getFilesByName("Laboratorio_Geotecnia_DB.json");
    
    if (!dbFiles.hasNext()) {
      Logger.log("No se encontró base de datos sincronizada. Abortando envío automático.");
      return;
    }

    var dbFile = dbFiles.next();
    var dbData = JSON.parse(dbFile.getBlob().getDataAsString());
    
    var hoy = new Date();
    var semanaNum = getNumeroSemana(hoy);
    var asunto = "[INFORME SEMANAL AUTOMÁTICO] Laboratorio de Geotecnia UNAL - Semana " + semanaNum;
    var html = construirCuerpoCorreoResumen(dbData, semanaNum);

    MailApp.sendEmail({
      to: DIRECTOR_EMAIL,
      cc: COORDINADORES_EMAIL,
      subject: asunto,
      htmlBody: html,
      name: "Sistema Automatizado - Laboratorio de Geotecnia UNAL"
    });

    Logger.log("Informe semanal enviado automáticamente con éxito al Director.");

  } catch (err) {
    Logger.log("Error en envío automático de informe: " + err.toString());
  }
}

/**
 * Función para programar el disparador automático cada Viernes a las 17:00
 * Ejecuta esta función una sola vez desde el editor de Google Apps Script
 */
function configurarDisparadorViernes() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "enviarInformeSemanalAutomatico") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger("enviarInformeSemanalAutomatico")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(17)
    .create();

  Logger.log("¡Disparador programado! Se enviará el informe automáticamente cada viernes a las 17:00.");
}

function getNumeroSemana(d) {
  var date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  var week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function construirCuerpoCorreoResumen(dbData, semanaNum) {
  var projects = dbData.projects || [];
  var members = dbData.members || [];
  var logs = dbData.logs || [];
  var routines = dbData.recurringTasks || [];
  var practices = dbData.labPractices || [];
  
  // Filtrar logs aprobados de la semana
  var weeklyLogs = [];
  for (var i = 0; i < logs.length; i++) {
    var l = logs[i];
    if (l.status === "Aprobado" && l.date) {
      var d = new Date(l.date + (l.date.indexOf("T") >= 0 ? "" : "T00:00:00"));
      if (getNumeroSemana(d) === semanaNum) {
        weeklyLogs.push(l);
      }
    }
  }

  // Mapa rápido de proyectos y actividades
  var projectMap = {};
  for (var pIdx = 0; pIdx < projects.length; pIdx++) {
    projectMap[projects[pIdx].id] = projects[pIdx];
  }

  // 1. Matriz general de proyectos
  var projectsRows = "";
  var projectsWithActivity = [];
  for (var i = 0; i < projects.length; i++) {
    var p = projects[i];
    var progress = 0;
    if (p.activities && p.activities.length > 0) {
      var sum = 0;
      var tw = 0;
      for (var j = 0; j < p.activities.length; j++) {
        var act = p.activities[j];
        sum += (act.progress || 0) * (act.weight || 0);
        tw += (act.weight || 0);
      }
      progress = tw > 0 ? Math.round(sum / tw) : 0;
    }

    var projWeeklyHours = 0;
    var projLogs = [];
    for (var k = 0; k < weeklyLogs.length; k++) {
      if (weeklyLogs[k].projectId === p.id) {
        projWeeklyHours += Number(weeklyLogs[k].hoursWorked) || 0;
        projLogs.push(weeklyLogs[k]);
      }
    }
    if (projLogs.length > 0) {
      projectsWithActivity.push({ project: p, progress: progress, hours: projWeeklyHours, logs: projLogs });
    }

    projectsRows += "<tr style='border-bottom:1px solid #e2e8f0;background-color:" + (i % 2 === 0 ? "#ffffff" : "#f8fafc") + ";'>" +
      "<td style='padding:8px 10px;font-family:monospace;font-weight:bold;color:#0f172a;'>" + p.code + "</td>" +
      "<td style='padding:8px 10px;font-weight:600;color:#1e293b;'>" + p.name + "</td>" +
      "<td style='padding:8px 10px;color:#475569;font-size:10px;'>" + p.type + " • " + (p.client || "UNAL") + "</td>" +
      "<td style='padding:8px 10px;text-align:center;font-weight:bold;color:#004f2d;font-family:monospace;'>" + progress + "%</td>" +
      "<td style='padding:8px 10px;text-align:center;font-weight:" + (projWeeklyHours > 0 ? "bold" : "normal") + ";color:" + (projWeeklyHours > 0 ? "#00361f" : "#94a3b8") + ";'>" + (projWeeklyHours > 0 ? projWeeklyHours + " hrs" : "-") + "</td>" +
      "<td style='padding:8px 10px;text-align:center;'><span style='display:inline-block;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:bold;background-color:" + (p.status === "En Ejecución" ? "#dcfce7" : "#f1f5f9") + ";color:" + (p.status === "En Ejecución" ? "#166534" : "#475569") + ";'>" + (p.status || "En Ejecución") + "</span></td>" +
    "</tr>";
  }

  // 2. Detalle de labores desarrolladas por cada integrante
  var membersHtml = "";
  var totalWeeklyHours = 0;
  for (var mIdx = 0; mIdx < members.length; mIdx++) {
    var m = members[mIdx];
    var mLogs = [];
    var mHours = 0;
    for (var lIdx = 0; lIdx < weeklyLogs.length; lIdx++) {
      if (weeklyLogs[lIdx].memberId === m.id) {
        mLogs.push(weeklyLogs[lIdx]);
        mHours += Number(weeklyLogs[lIdx].hoursWorked) || 0;
      }
    }
    totalWeeklyHours += mHours;

    if (mLogs.length > 0) {
      var tasksRows = "";
      for (var tIdx = 0; tIdx < mLogs.length; tIdx++) {
        var log = mLogs[tIdx];
        var proj = projectMap[log.projectId];
        var actName = "Labor Técnica Asignada";
        if (proj && proj.activities) {
          for (var aIdx = 0; aIdx < proj.activities.length; aIdx++) {
            if (proj.activities[aIdx].id === log.activityId) {
              actName = proj.activities[aIdx].name;
              break;
            }
          }
        }
        tasksRows += "<tr style='border-bottom:" + (tIdx === mLogs.length - 1 ? "none" : "1px solid #f1f5f9") + ";'>" +
          "<td style='vertical-align:top;width:80px;padding:6px 6px 6px 0;font-family:monospace;font-size:10px;color:#64748b;'>" +
            "<strong>" + log.date + "</strong><br><span style='color:#004f2d;font-weight:bold;'>" + log.hoursWorked + " hrs</span>" +
          "</td>" +
          "<td style='vertical-align:top;padding:6px;'>" +
            "<div style='font-weight:bold;color:#0f172a;margin-bottom:2px;'><span style='color:#004f2d;font-family:monospace;'>[" + (proj ? proj.code : "PRJ") + "]</span> " + (proj ? proj.name : "Proyecto") + "</div>" +
            "<div style='color:#334155;font-size:11px;font-weight:600;margin-bottom:3px;'>Actividad: " + actName + "</div>" +
            "<div style='color:#1e293b;background-color:#f8fafc;border-left:3px solid #94b43b;padding:5px 8px;border-radius:4px;font-size:10.5px;line-height:1.4;margin-bottom:3px;'>" + log.notes + "</div>" +
            (log.reviewComments ? "<div style='font-size:10px;color:#64748b;font-style:italic;'>Validación: \"" + log.reviewComments + "\"</div>" : "") +
          "</td>" +
          "<td style='vertical-align:top;width:65px;text-align:right;padding:6px 0 6px 6px;'>" +
            "<span style='font-size:10px;font-weight:bold;color:#166534;background-color:#dcfce7;padding:2px 6px;border-radius:4px;'>" + log.progressReported + "%</span>" +
          "</td>" +
        "</tr>";
      }

      membersHtml += "<div style='background-color:#ffffff;border:1px solid #cbd5e1;border-radius:8px;margin-bottom:12px;overflow:hidden;'>" +
        "<div style='background-color:#f1f5f9;padding:8px 12px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;'>" +
          "<div><strong style='font-size:11.5px;color:#0f172a;'>" + m.name + "</strong><span style='font-size:10px;color:#475569;margin-left:6px;'>• " + m.role + "</span></div>" +
          "<div><span style='background-color:#e2e8f0;color:#00361f;font-weight:bold;font-size:10.5px;padding:2px 6px;border-radius:4px;font-family:monospace;'>" + mHours.toFixed(1) + " hrs dedicadas</span></div>" +
        "</div>" +
        "<div style='padding:8px 12px;'><table width='100%' cellpadding='4' cellspacing='0' style='border-collapse:collapse;font-size:11px;'>" + tasksRows + "</table></div>" +
      "</div>";
    }
  }

  // 3. Detalle de actividades por proyecto con ejecucion
  var projectsDetailHtml = "";
  for (var pActIdx = 0; pActIdx < projectsWithActivity.length; pActIdx++) {
    var item = projectsWithActivity[pActIdx];
    var actListHtml = "";
    for (var plIdx = 0; plIdx < item.logs.length; plIdx++) {
      var pl = item.logs[plIdx];
      var pActName = "Labor Técnica";
      if (item.project.activities) {
        for (var paIdx = 0; paIdx < item.project.activities.length; paIdx++) {
          if (item.project.activities[paIdx].id === pl.activityId) {
            pActName = item.project.activities[paIdx].name;
            break;
          }
        }
      }
      actListHtml += "<div style='border-bottom:1px solid #f1f5f9;padding:4px 0;'>" +
        "<div style='display:flex;justify-content:space-between;'><span style='font-weight:600;color:#0f172a;'>• " + pActName + "</span><span style='color:#64748b;font-size:10px;'>" + pl.memberName + " (" + pl.hoursWorked + " hrs, " + pl.date + ")</span></div>" +
        "<div style='color:#334155;font-size:10.5px;padding-left:10px;margin-top:2px;'>" + pl.notes + "</div>" +
      "</div>";
    }

    projectsDetailHtml += "<div style='background-color:#f8fafc;border:1px solid #cbd5e1;border-left:4px solid #00361f;border-radius:6px;padding:10px 12px;margin-bottom:10px;font-size:11px;'>" +
      "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;'>" +
        "<span style='font-weight:bold;font-size:11.5px;color:#00361f;'>[" + item.project.code + "] " + item.project.name + "</span>" +
        "<span style='font-size:10.5px;font-weight:bold;color:#004f2d;'>" + item.progress + "% WBS (" + item.hours + " hrs en semana)</span>" +
      "</div>" +
      "<div style='color:#64748b;font-size:10px;margin-bottom:6px;'>Entidad: " + (item.project.client || "UNAL") + " • Tipo: " + item.project.type + " • Estado: " + item.project.status + "</div>" +
      "<div style='background-color:#ffffff;border:1px solid #e2e8f0;border-radius:6px;padding:6px 8px;'>" + actListHtml + "</div>" +
    "</div>";
  }

  return "<!DOCTYPE html><html lang='es'><head><meta charset='UTF-8'></head>" +
    "<body style='font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif;background-color:#f1f5f9;margin:0;padding:20px 10px;color:#0f172a;line-height:1.45;'>" +
      "<div style='max-width:700px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #cbd5e1;box-shadow:0 4px 15px rgba(0,0,0,0.06);'>" +
        
        "<!-- Membrete Oficial UNAL -->" +
        "<div style='background-color:#00361f;background:linear-gradient(135deg,#002414 0%,#00361f 55%,#004f2d 100%);padding:22px 26px;border-bottom:4px solid #94b43b;color:#ffffff;'>" +
          "<table width='100%' cellpadding='0' cellspacing='0' border='0'><tr>" +
            "<td>" +
              "<span style='font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#94b43b;display:block;margin-bottom:4px;'>UNIVERSIDAD NACIONAL DE COLOMBIA • SEDE BOGOTÁ</span>" +
              "<h1 style='font-size:18px;font-weight:800;margin:0 0 4px 0;color:#ffffff;'>Informe Técnico Semanal de Gestión y Ensayos</h1>" +
              "<p style='font-size:11px;margin:0;color:#cbd5e1;'>Facultad de Ingeniería • Departamento de Ingeniería Civil y Agrícola • Laboratorio de Geotecnia</p>" +
            "</td>" +
            "<td align='right' style='vertical-align:top;'>" +
              "<div style='background:rgba(148,180,59,0.15);border:1px solid #94b43b;padding:5px 10px;border-radius:6px;text-align:center;'>" +
                "<span style='font-size:11px;font-weight:800;color:#94b43b;display:block;'>SEMANA " + semanaNum + "</span>" +
                "<span style='font-size:10px;color:#e2e8f0;font-family:monospace;'>AÑO " + new Date().getFullYear() + "</span>" +
              "</div>" +
            "</td>" +
          "</tr></table>" +
        "</div>" +

        "<div style='padding:22px 26px;'>" +
          
          "<!-- Ficha Técnica -->" +
          "<table width='100%' cellpadding='6' cellspacing='0' style='background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;font-size:11px;margin-bottom:20px;'>" +
            "<tr>" +
              "<td style='padding:8px 12px;border-bottom:1px solid #e2e8f0;'><strong style='color:#475569;'>Fecha de Corte:</strong> " + new Date().toLocaleDateString('es-CO') + "</td>" +
              "<td style='padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;'><strong style='color:#475569;'>Proyectos con Ejecución:</strong> " + projectsWithActivity.length + " de " + projects.length + "</td>" +
            "</tr>" +
            "<tr>" +
              "<td style='padding:8px 12px;'><strong style='color:#475569;'>Horas-Hombre en Semana:</strong> <span style='color:#004f2d;font-weight:bold;'>" + totalWeeklyHours.toFixed(1) + " hrs</span></td>" +
              "<td style='padding:8px 12px;text-align:right;'><strong style='color:#475569;'>Registros Validados:</strong> " + weeklyLogs.length + " actividades</td>" +
            "</tr>" +
          "</table>" +

          "<!-- 1. Labores de Integrantes -->" +
          "<div style='margin-bottom:24px;'>" +
            "<div style='border-bottom:2px solid #00361f;padding-bottom:4px;margin-bottom:12px;'>" +
              "<h2 style='font-size:13px;font-weight:800;text-transform:uppercase;color:#00361f;margin:0;'>1. Detalle de Labores y Ensayos Desarrollados por Integrante</h2>" +
              "<span style='font-size:10px;color:#64748b;'>Bitácora técnica de turnos, actividades y observaciones individuales</span>" +
            "</div>" +
            (membersHtml || "<p style='font-size:11px;color:#64748b;font-style:italic;'>No se registraron horas ni turnos de laboratorio validados en esta semana.</p>") +
          "</div>" +

          "<!-- 2. Estado por Proyecto -->" +
          "<div style='margin-bottom:24px;'>" +
            "<div style='border-bottom:2px solid #00361f;padding-bottom:4px;margin-bottom:12px;'>" +
              "<h2 style='font-size:13px;font-weight:800;text-transform:uppercase;color:#00361f;margin:0;'>2. Estado y Ejecución Técnica por Proyecto</h2>" +
              "<span style='font-size:10px;color:#64748b;'>Consolidado de avance ponderado WBS y actividades realizadas en el periodo</span>" +
            "</div>" +
            "<table width='100%' cellpadding='6' cellspacing='0' style='border-collapse:collapse;font-size:11px;margin-bottom:14px;border:1px solid #cbd5e1;'>" +
              "<thead><tr style='background-color:#00361f;color:#fff;text-align:left;font-size:10px;text-transform:uppercase;'>" +
                "<th style='padding:8px;'>Código</th><th style='padding:8px;'>Proyecto</th><th style='padding:8px;'>Tipo / Entidad</th><th style='padding:8px;text-align:center;'>Avance Global</th><th style='padding:8px;text-align:center;'>Horas</th><th style='padding:8px;text-align:center;'>Estado</th>" +
              "</tr></thead>" +
              "<tbody>" + projectsRows + "</tbody>" +
            "</table>" +
            (projectsDetailHtml || "") +
          "</div>" +

          "<!-- Control de Firmas -->" +
          "<table width='100%' cellpadding='0' cellspacing='0' style='margin-top:28px;padding-top:20px;border-top:2px solid #cbd5e1;font-size:10px;color:#475569;text-align:center;'><tr>" +
            "<td width='33%' style='padding:0 8px;vertical-align:top;'><div style='border-bottom:1px solid #64748b;margin:0 auto 4px auto;width:130px;'></div><strong style='color:#0f172a;display:block;'>Prof. Julio Esteban Colmenares, Ph.D.</strong>Director Laboratorio de Geotecnia</td>" +
            "<td width='33%' style='padding:0 8px;vertical-align:top;'><div style='border-bottom:1px solid #64748b;margin:0 auto 4px auto;width:130px;'></div><strong style='color:#0f172a;display:block;'>Ing. Daniel Felipe Rodríguez R.</strong>Coord. Laboratorio e Investigación</td>" +
            "<td width='33%' style='padding:0 8px;vertical-align:top;'><div style='border-bottom:1px solid #64748b;margin:0 auto 4px auto;width:130px;'></div><strong style='color:#0f172a;display:block;'>Ing. Edwin Alexander Prieto S.</strong>Coord. de Operaciones</td>" +
          "</tr></table>" +

        "</div>" +

        "<!-- Pie -->" +
        "<div style='background-color:#002414;padding:12px 20px;text-align:center;font-size:10px;color:#94a3b8;border-top:2px solid #94b43b;'>" +
          "Universidad Nacional de Colombia • Sede Bogotá • Facultad de Ingeniería • Edificio 407 (Manuel Ancízar)<br>" +
          "Sistema de Información y Control del Laboratorio de Geotecnia • <a href='mailto:labgeotec_fibog@unal.edu.co' style='color:#94b43b;text-decoration:none;'>labgeotec_fibog@unal.edu.co</a>" +
        "</div>" +

      "</div>" +
    "</body></html>";
}

function getOrCreateFolder(parent, folderName) {
  var folders = parent.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parent.createFolder(folderName);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;
  }
};


