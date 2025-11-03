# Integración del Servicio de Emails

## 📧 Descripción General

Se ha integrado completamente el servicio de emails del backend con el frontend, permitiendo enviar tres tipos de comunicaciones a los participantes registrados en un evento:

1. **Recordatorio con Calendario** (.ics)
2. **Invitación Virtual** (con link de Google Meet)
3. **Invitación Presencial** (con código QR único)

## 🎯 Acceso a la Funcionalidad

### Ubicación
En el **Dashboard de cada Evento**, dentro de la pestaña **"Asistentes"**, encontrarás un botón azul con el icono de sobre:

```
📬 Enviar Invitaciones
```

### Requisitos Previos
- El evento debe tener al menos un participante registrado
- Los participantes deben tener email válido
- El backend debe estar ejecutándose en `http://localhost:8080`

## 📋 Tipos de Invitaciones

### 1️⃣ Recordatorio con Archivo .ics

**Uso:** Enviar recordatorios generales con archivo de calendario adjunto.

**Campos:**
- **Asunto**: Título del email (pre-rellenado con el nombre del evento)
- **Mensaje**: Cuerpo del email. Usa `{nombre}` para personalizar con el nombre del participante
- **Resumen del Evento**: Breve descripción para el archivo .ics
- **Descripción del Evento**: Detalle completo del evento
- **Fecha de Inicio**: Fecha y hora de inicio (formato: datetime-local)
- **Fecha de Fin**: Fecha y hora de término
- **Lugar**: Ubicación física o virtual del evento
- **Flyer**: Imagen o PDF opcional para adjuntar

**Funcionalidades:**
- ✅ Genera archivo `.ics` automáticamente
- ✅ Los participantes pueden agregar el evento a su calendario con un clic
- ✅ Personalización con el nombre del participante
- ✅ Adjunta flyer si se proporciona
- ✅ Muestra estadísticas de envío (total, enviados, fallidos)
- ✅ Lista detallada de errores si los hay

**Endpoint Backend:**
```
POST /api/email/recordatorio
Content-Type: multipart/form-data

Parámetros:
- eventoId: Long
- asunto: String
- mensaje: String
- resumenEvento: String
- descripcionEvento: String
- inicio: String (ISO 8601)
- fin: String (ISO 8601)
- lugar: String
- flyer: MultipartFile (opcional)
```

**Respuesta:**
```json
{
  "total": 50,
  "enviados": 48,
  "fallidos": 2,
  "errores": [
    "id=123, email=invalid@example.com",
    "id=456, nombre=Juan Pérez"
  ]
}
```

---

### 2️⃣ Invitación Virtual (con Google Meet)

**Uso:** Para eventos virtuales con enlace de reunión en línea.

**Campos:**
- **Asunto**: Título del email
- **Mensaje**: Cuerpo del email (usa `{nombre}` para personalización)
- **Enlace de Google Meet**: URL de la reunión (REQUERIDO)
  - Ejemplo: `https://meet.google.com/xxx-xxxx-xxx`
- **Fecha de Inicio**: Fecha y hora de inicio
- **Fecha de Fin**: Fecha y hora de término

**Características:**
- ✅ El link de Google Meet se añade automáticamente al final del mensaje con emoji 🔗
- ✅ Genera archivo `.ics` para que agreguen al calendario
- ✅ El lugar se establece automáticamente como "Evento Virtual - Google Meet"

**Endpoint Backend:**
```
POST /api/email/virtual?eventoId={eventoId}
Content-Type: application/json

Body:
{
  "asunto": "Invitación Virtual: Nombre del Evento",
  "mensaje": "Hola {nombre}, estás invitado...",
  "googleMeetLink": "https://meet.google.com/xxx-xxxx-xxx",
  "inicio": "2025-11-15T10:00:00Z",
  "fin": "2025-11-15T12:00:00Z",
  "lugar": "Evento Virtual - Google Meet",
  "flyerPath": "/path/to/flyer.png" (opcional)
}
```

**Respuesta:**
```
"Invitaciones virtuales enviadas exitosamente"
```

---

### 3️⃣ Invitación Presencial (con Código QR)

**Uso:** Para eventos presenciales, genera un código QR único por participante.

**Campos:**
- **Asunto**: Título del email
- **Mensaje**: Cuerpo del email (usa `{nombre}` para personalización)
- **Fecha de Inicio**: Fecha y hora de inicio del evento
- **Fecha de Fin**: Fecha y hora de término
- **Lugar**: Dirección física del evento

**Características:**
- ✅ Genera un código QR único para cada participante
- ✅ El QR se adjunta como imagen PNG (qr_123.png)
- ✅ El QR contiene el ID de asistencia o datos del participante
- ✅ Adjunta archivo `.ics` para calendario
- ✅ Ideal para control de acceso en la entrada del evento

**Contenido del QR:**
Si la asistencia tiene `codigoQr` definido:
```
<codigoQr de la asistencia>
```

Si no:
```
ASISTENCIA|ID:123|EMAIL:participante@example.com|EVENTO:Nombre del Evento
```

**Endpoint Backend:**
```
POST /api/email/presencial?eventoId={eventoId}
Content-Type: application/json

Body:
{
  "asunto": "Invitación Presencial: Nombre del Evento",
  "mensaje": "Hola {nombre}, tu código QR va adjunto...",
  "inicio": "2025-11-15T10:00:00Z",
  "fin": "2025-11-15T12:00:00Z",
  "lugar": "Auditorio Principal, Av. Universidad 123",
  "flyerPath": "/path/to/flyer.png" (opcional)
}
```

**Respuesta:**
```
"Invitaciones presenciales enviadas exitosamente"
```

---

## 🔄 Flujo de Trabajo Recomendado

### Escenario 1: Evento Presencial Completo

1. **Crear el evento** en el sistema
2. **Registrar participantes** (manualmente o importación)
3. **Enviar Recordatorio** con flyer y detalles (1-2 semanas antes)
4. **Enviar Invitación Presencial** con QR (3-5 días antes)
5. **Escanear QR** el día del evento para marcar asistencia

### Escenario 2: Evento Virtual

1. **Crear el evento** con tipo "Virtual"
2. **Registrar participantes**
3. **Crear reunión en Google Meet**
4. **Enviar Invitación Virtual** con el link de Meet (1 semana antes)
5. **Enviar Recordatorio** adicional (1 día antes)

### Escenario 3: Evento Híbrido

1. **Crear el evento** con tipo "Híbrido"
2. **Registrar participantes** (identificar modalidad de cada uno)
3. **Enviar Recordatorio general** con archivo .ics
4. Opcionalmente:
   - Enviar **Invitación Virtual** a participantes remotos
   - Enviar **Invitación Presencial** a participantes in-situ

---

## 💡 Tips y Mejores Prácticas

### Personalización de Mensajes

Usa el placeholder `{nombre}` en el campo de mensaje:

**Ejemplo:**
```
Hola {nombre},

Nos complace confirmar tu registro para el evento "Taller de React".

Te esperamos el próximo viernes a las 10:00 AM.

¡No faltes!

Saludos,
El equipo organizador
```

Se convertirá en:
```
Hola Juan Pérez,

Nos complace confirmar tu registro para el evento "Taller de React".
...
```

### Asunto Efectivo

- ✅ **Claro y conciso**: "Invitación: Workshop de Node.js - 15 Nov"
- ✅ **Con urgencia**: "¡Solo 3 días! Confirmación de asistencia"
- ✅ **Con emoji**: "🎓 Certificación PMI - Detalles de tu registro"

### Gestión de Errores

El sistema te mostrará:
- ✅ **Mensajes de éxito**: "Se enviaron 48 de 50 recordatorios"
- ⚠️ **Mensajes de alerta**: "2 correos fallaron"
- ❌ **Lista de errores**: Participantes sin email o con errores de envío

**Ejemplo de respuesta:**
```
✅ Se enviaron 48 de 50 recordatorios
⚠️ 2 correos fallaron

Errores:
• id=123, email=invalid@example.com
• id=456, nombre=María García
```

### Fechas y Horarios

- El formato de fecha es **ISO 8601** (se convierte automáticamente)
- Las fechas se pre-rellenan con los datos del evento
- Puedes ajustarlas manualmente antes de enviar
- Asegúrate de que `fechaFin` sea posterior a `fechaInicio`

---

## 🛠️ Archivos Creados/Modificados

### Nuevos Archivos

1. **`services/email-service.ts`**
   - Servicio frontend para comunicación con endpoints de email
   - Funciones: `enviarRecordatorio()`, `enviarInvitacionVirtual()`, `enviarInvitacionPresencial()`
   - Maneja FormData para el flyer en recordatorios

2. **`components/send-invitations-modal.tsx`**
   - Modal con 3 pestañas (Recordatorio, Virtual, Presencial)
   - Validación de campos requeridos
   - Manejo de estados (loading, success, error)
   - Interfaz intuitiva con iconos y mensajes de feedback

### Archivos Modificados

1. **`components/event-dashboard.tsx`**
   - Importación del nuevo modal
   - Estado `currentEvent` para almacenar datos del evento
   - Función `loadEventData()` para cargar el evento
   - Botón "Enviar Invitaciones" en pestaña de Asistentes
   - Renderizado condicional del modal

---

## 🔐 Consideraciones de Seguridad

1. **CORS**: El backend debe tener configurado `@CrossOrigin(origins = "*")` o la URL del frontend
2. **Validación de Email**: El servicio valida emails antes de enviar
3. **Manejo de Errores**: Los errores se registran en el backend y se retornan al frontend
4. **Archivos Adjuntos**: Solo se permiten imágenes y PDFs para el flyer

---

## 📊 Monitoreo y Logs

### Backend Logs
El servicio registra en logs:
- ✅ Correos enviados exitosamente
- ❌ Correos fallidos con razón del error
- ⚠️ Participantes sin email
- 🔍 Detalles de generación de QR y archivos .ics

**Ejemplo:**
```
INFO: Participante sin email: id=123, nombre=Juan Pérez
ERROR: Error enviando correo a id=456, email=test@example.com: SMTP error
INFO: Invitaciones virtuales enviadas exitosamente
```

### Frontend Feedback
- **Loading spinner** mientras se envían los emails
- **Mensajes de éxito** en verde con icono ✅
- **Mensajes de error** en rojo con icono ❌
- **Lista desplegable** de errores específicos

---

## 🐛 Troubleshooting

### Problema: "Error al enviar recordatorios"

**Posibles causas:**
1. Backend no está ejecutándose
2. Configuración incorrecta de SMTP en el backend
3. Puerto 8080 no disponible

**Solución:**
- Verifica que el backend esté corriendo: `http://localhost:8080/api/eventos/listar`
- Revisa logs del backend para errores SMTP
- Confirma configuración de `application.properties`:
  ```properties
  spring.mail.host=smtp.gmail.com
  spring.mail.port=587
  spring.mail.username=tu-email@gmail.com
  spring.mail.password=tu-contraseña-app
  ```

### Problema: "Participante sin email"

**Causa:** El participante no tiene email registrado en la base de datos.

**Solución:**
- Editar el participante y agregar un email válido
- Los participantes sin email aparecerán en la lista de errores

### Problema: "Error generando QR"

**Causa:** El servicio QrCodeService del backend falló.

**Solución:**
- Verificar que la dependencia ZXing esté en el `pom.xml`
- Revisar permisos de escritura en `uploads/QR/`
- Verificar logs del backend para detalles

---

## 📚 Referencias

### Endpoints del Backend

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/email/recordatorio` | POST | Enviar recordatorio con .ics |
| `/api/email/virtual` | POST | Enviar invitación virtual |
| `/api/email/presencial` | POST | Enviar invitación presencial con QR |

### Entidades Relacionadas

- **EmailService**: Servicio principal de envío de emails
- **CalendarUtil**: Utilidad para generar archivos .ics
- **QrCodeService**: Generación de códigos QR
- **AsistenciaRepository**: Consulta de participantes por evento
- **InvitacionVirtual**: DTO para invitaciones virtuales
- **InvitacionPresencial**: DTO para invitaciones presenciales

---

## ✅ Checklist de Implementación

- [x] Crear servicio de email en frontend
- [x] Crear modal de invitaciones con 3 pestañas
- [x] Integrar modal en dashboard de eventos
- [x] Manejar conversión de tipos (string → number para IDs)
- [x] Implementar feedback visual (loading, success, error)
- [x] Validar campos requeridos
- [x] Manejo de archivos adjuntos (flyer)
- [x] Personalización con placeholder {nombre}
- [x] Pre-rellenado de campos desde datos del evento
- [x] Documentación completa

---

## 🚀 Próximas Mejoras

1. **Preview de Email**: Vista previa antes de enviar
2. **Programación de Envíos**: Agendar envío para fecha/hora específica
3. **Plantillas de Email**: Guardar y reutilizar mensajes personalizados
4. **Filtros de Destinatarios**: Enviar solo a ciertos grupos (ej: solo confirmados)
5. **Historial de Envíos**: Registro de todos los emails enviados
6. **Reintentos Automáticos**: Para correos fallidos
7. **Estadísticas Avanzadas**: Tasas de apertura y clics (requiere tracking)

---

## 📞 Soporte

Si encuentras problemas o necesitas ayuda:
1. Revisa los logs del backend en la consola
2. Verifica la consola del navegador para errores del frontend
3. Consulta este documento para casos de uso específicos
4. Revisa el código fuente en:
   - `services/email-service.ts`
   - `components/send-invitations-modal.tsx`
   - Backend: `EmailService.java`, `EmailController.java`
