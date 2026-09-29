# Plataforma de Gestión y Seguimiento - Laboratorio de Geotecnia
## Universidad Nacional de Colombia • Sede Bogotá • Facultad de Ingeniería

Plataforma web moderna desarrollada bajo los **Lineamientos Oficiales de Identidad Visual de la Universidad Nacional de Colombia**, diseñada específicamente para el **Laboratorio de Geotecnia** (Departamento de Ingeniería Civil y Agrícola).

---

## 🎨 Identidad Visual Institucional Implementada

* **Tipografía Oficial:** Familia tipográfica **Ancízar Sans** (Variable Font, Regular, Medium, SemiBold, Bold, ExtraBold, Black e Itálica).
* **Paleta de Color Institucional UNAL:**
  * **Verde Institucional:** `#94B43B` (verde manzana institucional para acentos, botones primarios e indicadores de avance).
  * **Verde Oscuro Tradicional:** `#004F2D` y `#00361F` (franja institucional y barra de navegación).
  * **Gris Institucional:** `#5C666A` (textos complementarios y bordes).
  * **Rojo Alterno UNAL:** `#C4261D` (alertas de entrega y retrasos).
* **Elementos y Logosímbolos Institucionales:**
  * **Escudo Oficial en Colores** de la Universidad Nacional de Colombia.
  * **Logosímbolo Central a 2 colores** (Escudo + Universidad Nacional de Colombia).
  * **Logotipo UN Circular** (ambigrama institucional) y **Marca Nominativa UNAL**.
  * **Barra Superior Institucional:** Enlaces a todas las sedes (Bogotá, Medellín, Manizales, Palmira, Amazonia, Caribe, Orinoquia, Tumaco) y servicios directos (Correo institucional `@unal.edu.co`, SIA, Bibliotecas).
  * **Pie de Página Oficial:** Sede Bogotá, Facultad de Ingeniería, Edificio 407, enlaces de interés y régimen legal.

---

## 🚀 Características del Sistema

1. **⚡ Registro Ágil de Avance ("Kiosco Público"):**
   * Selector público de integrantes sin contraseñas para registrar ensayos y tareas en menos de 30 segundos.
   * Filtro dinámico: al elegir el proyecto (Extensión o Investigación), se cargan únicamente las actividades activas correspondientes.
   * Carga de evidencias y anexos (curvas granulométricas, lecturas edométricas, ensayos triaxiales ASTM/NTC, fotos de núcleos, hojas de cálculo en Excel y PDFs) con progreso en vivo.

2. **📁 Integración Real con Google Drive Institucional (@unal.edu.co):**
   * Clasificación automática de carpetas:  
     `Laboratorio_Geotecnia / [Año] / [Extension_o_Investigacion] / [Codigo_Proyecto] / Anexos / Semana_[XX] / archivo.xlsx`
   * **Subida real en la nube** mediante Google Apps Script Webhook.
   * Botón de **Prueba de Conexión en vivo** en el panel de configuración.
   * Respaldo y sincronización centralizada de toda la base de datos del laboratorio en Google Drive.

3. **📊 Gestión Integral de Proyectos y Tareas ($WBS$):**
   * **Nuevo:** Botones para **Editar** información general (nombre, entidad, fecha de entrega, tipo, carpeta de Drive) y **Eliminar** proyectos.
   * Configuración de actividades WBS con pesos porcentuales, normalización automática a 100% y asignación de responsables.
   * Cálculo automático de avance ponderado en tiempo real:
     $$\text{Avance Total} = \sum (\% \text{Avance Actividad}_i \times \text{Peso}_i)$$

4. **👥 Gestión Completa del Equipo:**
   * Botones de **Editar** (nombre, rol, categoría, correo institucional, siglas e inactivación) y **Eliminar** en cada integrante.
   * Monogramas institucionales oficiales y registro de horas y ensayos validados por persona.

5. **✅ Bandeja de Revisión Rápida (Inbox de Coordinación):**
   * Acciones rápidas: **Aprobar** (actualiza el avance del proyecto), **Requerir Ajustes** (con observaciones técnicas) o **Eliminar Registro**.

6. **📄 Generador de Informes Semanales con Formato Oficial UNAL:**
   * Membrete institucional: Universidad Nacional de Colombia • Facultad de Ingeniería • Laboratorio de Geotecnia.
   * Resumen ejecutivo del estado de todos los proyectos y firmas de la dirección y coordinadores.
   * Exportación instantánea a **PDF Oficial listo para firma** y **Excel (.xlsx)**.

7. **📧 Envío Automático Semanal por Correo al Director:**
   * Botón directo **"Enviar al Director por Correo"** con plantilla HTML oficial UNAL responsive.
   * **Activador Cron Autónomo en Google Apps Script**: se ejecuta automáticamente **cada viernes a las 17:00 (5:00 PM)** y envía el consolidado al Director (`jecolmenaresm@unal.edu.co`) con copia a los coordinadores, sin necesidad de abrir la aplicación.

---

## ☁️ Guía Rápida: Conectar Google Drive y Activar el Envío Semanal Automático

1. En la barra superior de la plataforma, haz clic en el icono de **disco duro / Drive**.
2. Haz clic en el botón **"Copiar Script"** para obtener el código completo de Google Apps Script.
3. Abre [script.google.com](https://script.google.com) e inicia sesión con la cuenta del laboratorio (`@unal.edu.co`).
4. Crea un **Nuevo proyecto** (ej. *Backend_Laboratorio_Geotecnia*).
5. Borra el código existente, pega el script copiado y haz clic en **Guardar** (`Ctrl + S`).
6. **Publicar Aplicación Web:**
   * Haz clic en **Implementar > Nueva implementación**.
   * **Tipo:** Aplicación web.
   * **Descripción:** API Laboratorio de Geotecnia.
   * **Ejecutar como:** Yo (tu cuenta institucional).
   * **Quién tiene acceso:** Cualquier usuario.
   * Haz clic en **Implementar**, concede los permisos y copia la **URL de la aplicación web** (`https://script.google.com/macros/s/.../exec`).
7. **Vincular en la Plataforma:**
   * Regresa a la plataforma web, pega la URL en el campo del Webhook, haz clic en **"Probar Conexión"** y luego en **"Guardar Configuración"**.
8. **Activar el Envío Automático de Correos cada Viernes (Cron):**
   * En el editor de [script.google.com](https://script.google.com), en la barra superior junto al botón "Depurar", selecciona en el menú desplegable la función:  
     👉 **`configurarDisparadorViernes`**
   * Haz clic en **"Ejecutar"** (Run).
   * Autoriza los permisos de envío de correo una única vez.
   * ¡Listo! Google Apps Script activará un reloj interno que cada **viernes a las 17:00** leerá los avances y enviará automáticamente el correo institucional al Director (`jecolmenaresm@unal.edu.co`) con copia a los coordinadores.

---

## 💻 Cómo Usar Localmente

Abre directamente el archivo [`index.html`](./index.html) en cualquier navegador web moderno (Chrome, Edge, Firefox, Opera). No requiere Node.js ni instalación de servidores.

---

## 🌐 Despliegue Gratuito en la Nube (Acceso para todo el Laboratorio)

* **Vercel / Netlify / GitHub Pages:** Sube la carpeta a un repositorio de GitHub o arrástrala a Netlify Drop para tenerla en línea con certificado SSL gratuito (ej. `https://geotecnia-unal.vercel.app`).

