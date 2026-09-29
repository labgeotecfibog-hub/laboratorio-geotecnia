// ====================================================================
// PLATAFORMA LABORATORIO DE GEOTECNIA - UNIVERSIDAD NACIONAL DE COLOMBIA
// Backend Google Apps Script: Carga en Drive, Base de Datos y Envío Semanal Automatizado
// Cuenta Oficial: labgeotec_fibog@unal.edu.co
// ====================================================================
//
// GUÍA RÁPIDA DE PUESTA EN MARCHA (3 MINUTOS):
// 1. Ingresa a https://script.google.com con la cuenta del laboratorio (labgeotec_fibog@unal.edu.co).
// 2. Haz clic en "Nuevo proyecto" (arriba a la izquierda) y nómbralo: "Backend_Laboratorio_Geotecnia".
// 3. Borra el contenido que aparece por defecto en Código.gs y PEGA TODO ESTE ARCHIVO.
// 4. Haz clic en el icono de guardar (💾).
// 5. Haz clic en el botón azul "Implementar" (arriba a la derecha) > "Nueva implementación".
//    - Tipo: selecciona el engranaje ⚙️ y elige "Aplicación web".
//    - Descripción: "Producción v1.0 Laboratorio Geotecnia".
//    - Ejecutar como: "Yo (labgeotec_fibog@unal.edu.co)".
//    - Quién tiene acceso: "Cualquier usuario" (o "Cualquiera con cuenta de Universidad Nacional de Colombia").
// 6. Haz clic en "Implementar", autoriza los permisos requeridos (Revisar permisos > Elegir cuenta > Opciones avanzadas > Ir a Backend_Laboratorio_Geotecnia).
// 7. COPIA la "URL de la aplicación web" que termina en "/exec".
// 8. En la plataforma web, haz clic en el botón de Google Drive (icono verde en el menú superior),
//    pega esa URL en el campo "URL de la Aplicación Web (Webhook)" y haz clic en "Probar Conexión" y "Guardar Configuración".
// 9. PARA ACTIVAR EL ENVÍO AUTOMÁTICO CADA VIERNES:
//    - En la barra de herramientas de Google Apps Script, en la lista desplegable de funciones, selecciona:
//      "configurarDisparadorViernes" y haz clic en "Ejecutar".
// ====================================================================

// Destinatarios oficiales predeterminados
var DIRECTOR_EMAIL = "jecolmenaresm@unal.edu.co";
var COORDINADORES_EMAIL = "dfrodriguezr@unal.edu.co, eaprietos@unal.edu.co, labgeotec_fibog@unal.edu.co";

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
      var ccRecipients = data.cc || COORDINADORES_EMAIL;
      var subject = data.subject || "[Informe Semanal] Laboratorio de Geotecnia UNAL";
      var htmlContent = data.htmlBody;

      MailApp.sendEmail({
        to: toRecipient,
        cc: ccRecipients,
        subject: subject,
        htmlBody: htmlContent,
        name: "Laboratorio de Geotecnia - UNAL Sede Bogotá"
      });

      return createJsonResponse({
        status: "success",
        message: "Informe semanal enviado con éxito al Director (" + toRecipient + ") y Coordinadores."
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
  
  var projectsRows = "";
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
    projectsRows += "<tr style='border-bottom:1px solid #e2e8f0;'>" +
      "<td style='padding:8px;font-family:monospace;font-weight:bold;'>" + p.code + "</td>" +
      "<td style='padding:8px;font-weight:600;'>" + p.name + "</td>" +
      "<td style='padding:8px;'>" + p.type + "</td>" +
      "<td style='padding:8px;text-align:center;font-weight:bold;color:#004f2d;'>" + progress + "%</td>" +
      "<td style='padding:8px;text-align:center;'>" + (p.status || "En Ejecución") + "</td>" +
    "</tr>";
  }

  return "<div style='font-family:Arial,sans-serif;max-width:650px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;'>" +
    "<div style='background-color:#00361f;padding:20px;color:#fff;border-bottom:4px solid #94b43b;'>" +
      "<span style='font-size:10px;font-weight:bold;color:#94b43b;letter-spacing:1px;text-transform:uppercase;'>UNIVERSIDAD NACIONAL DE COLOMBIA • SEDE BOGOTÁ</span>" +
      "<h2 style='margin:4px 0 0 0;font-size:18px;'>Informe Semanal Automatizado de Avance - Semana " + semanaNum + "</h2>" +
      "<p style='margin:2px 0 0 0;font-size:12px;color:#cbd5e1;'>Facultad de Ingeniería • Laboratorio de Geotecnia</p>" +
    "</div>" +
    "<div style='padding:20px;font-size:12px;color:#334155;'>" +
      "<p>Estimado <strong>Prof. Julio Esteban Colmenares Montañez, Ph.D.</strong>,<br>Director del Laboratorio de Geotecnia:</p>" +
      "<p>A continuación se presenta el consolidado automático del avance en los proyectos de extensión e investigación correspondiente al cierre de esta semana:</p>" +
      "<table width='100%' cellpadding='6' cellspacing='0' style='border-collapse:collapse;margin:15px 0;'>" +
        "<thead><tr style='background-color:#00361f;color:#fff;text-align:left;'>" +
          "<th style='padding:8px;'>Código</th><th style='padding:8px;'>Proyecto</th><th style='padding:8px;'>Tipo</th><th style='padding:8px;text-align:center;'>Avance WBS</th><th style='padding:8px;text-align:center;'>Estado</th>" +
        "</tr></thead>" +
        "<tbody>" + projectsRows + "</tbody>" +
      "</table>" +
      "<p style='color:#64748b;font-size:11px;'>Para consultar las evidencias, curvas de ensayos y bitácora completa, ingresa a la plataforma web del laboratorio o a la carpeta compartida en Google Drive.</p>" +
    "</div>" +
    "<div style='background-color:#f8fafc;padding:12px;text-align:center;font-size:10px;color:#64748b;border-top:1px solid #e2e8f0;'>" +
      "Generado automáticamente por el Sistema de Información Geotécnica • Universidad Nacional de Colombia" +
    "</div>" +
  "</div>";
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
}
