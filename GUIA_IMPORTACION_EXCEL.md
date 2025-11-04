# Guía de Importación de Participantes desde Excel

## Descripción

La funcionalidad de importación permite cargar múltiples participantes a un evento desde un archivo Excel (.xlsx o .xls), automatizando el proceso de registro masivo.

## Características

✅ Importación masiva desde Excel  
✅ Validación de formato de archivo  
✅ Creación automática de participantes  
✅ Creación automática de registros de asistencia  
✅ Detección de participantes duplicados (por email)  
✅ Feedback visual del proceso de carga  

## Cómo Usar

### 1. Acceder a la Funcionalidad

En el dashboard de un evento, ve a la pestaña **"Asistentes"** y haz clic en el botón **"Importar"**.

### 2. Seleccionar el Archivo

- Haz clic en "Selecciona un archivo Excel"
- Selecciona un archivo con extensión `.xlsx` o `.xls`
- El sistema validará que sea un formato Excel válido

### 3. Procesar la Importación

- Haz clic en **"Importar Archivo"**
- El sistema procesará el archivo y mostrará el resultado
- La lista de participantes se actualizará automáticamente

## Formato del Archivo Excel

### Estructura de Columnas

El archivo Excel debe tener las siguientes columnas **en este orden**:

| # | Columna | Descripción | Obligatorio |
|---|---------|-------------|-------------|
| **A** | **Nombres** | Nombres del participante | No |
| **B** | **Apellido Paterno** | Primer apellido | No |
| **C** | **Apellido Materno** | Segundo apellido | No |
| **D** | **DNI** | Documento de identidad | No |
| **E** | **Email** | Correo electrónico | ⚠️ **SÍ** |
| **F** | **Número de WhatsApp** | Teléfono con WhatsApp | No |
| **G** | **Ciudad** | Ciudad de residencia | No |
| **H** | **Rol** | Rol del participante (ej: "Estudiante", "Profesional", "Ponente") | No |

### ⚠️ Importante

- La **primera fila** debe ser el encabezado (se omite en el procesamiento)
- El campo **Email** es **obligatorio** para cada participante
- Los participantes con email duplicado **no se crearán** nuevamente
- Las filas sin email serán **ignoradas**

### Ejemplo de Estructura

```
| Nombres | Apellido Paterno | Apellido Materno | DNI | Email | Número de WhatsApp | Ciudad | Rol |
|---------|------------------|------------------|-----|-------|-------------------|--------|-----|
| Juan | Pérez | García | 12345678 | juan.perez@example.com | +51987654321 | Lima | Estudiante |
| María | López | Martínez | 87654321 | maria.lopez@example.com | +51912345678 | Arequipa | Profesional |
```

## Proceso Backend

### 1. Validación del Archivo

```java
// Validar tipo de archivo
String contentType = archivo.getContentType();
if (!contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") &&
    !contentType.equals("application/vnd.ms-excel")) {
    return error("El archivo debe ser un Excel (.xlsx o .xls)");
}
```

### 2. Lectura de Datos

El servicio `LecturaArchivoService` lee el archivo usando Apache POI:

```java
Workbook workbook = WorkbookFactory.create(archivo.getInputStream());
Sheet sheet = workbook.getSheetAt(0);
```

### 3. Procesamiento de Filas

Para cada fila del Excel:

1. **Extrae los datos** de las celdas
2. **Valida el email** (campo obligatorio)
3. **Busca si el participante ya existe** por email
4. **Crea el participante** si no existe
5. **Crea el registro de asistencia** para el evento

```java
// Buscar o crear participante
Participante participante = participanteRepository
    .findByEmail(email.trim())
    .orElse(null);

if (participante == null) {
    participante = Participante.builder()
        .nombres(nombres)
        .apellidoPaterno(apellidoPaterno)
        // ... otros campos
        .build();
    participante = participanteRepository.save(participante);
}

// Crear asistencia
asistenciaService.crearAsistencia(participante, evento);
```

### 4. Respuesta

El backend devuelve una respuesta JSON con:

```json
{
  "success": true,
  "message": "Archivo procesado correctamente",
  "eventoId": 123,
  "archivo": "participantes.xlsx"
}
```

## Endpoint del Backend

### POST `/api/test/cargar-archivo`

**Parámetros:**
- `archivo` (MultipartFile): Archivo Excel a procesar
- `eventoId` (Long): ID del evento al que se agregarán los participantes

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Archivo procesado correctamente",
  "eventoId": 123,
  "archivo": "participantes.xlsx"
}
```

**Respuesta de Error (400/500):**
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

## Logs del Backend

Durante el procesamiento, el backend registra información útil:

```
INFO  - Procesando archivo: participantes.xlsx para evento ID: 123
INFO  - Participante creado: juan.perez@example.com
INFO  - Participante ya existe: maria.lopez@example.com
WARN  - Fila 5 ignorada: email vacío
INFO  - Importación completada - Participantes creados: 15, existentes: 3, asistencias creadas: 18
```

## Manejo de Duplicados

### Detección por Email

El sistema detecta participantes duplicados usando el **email** como identificador único:

- Si el email **ya existe** en la base de datos → No se crea un nuevo participante
- Si el email **no existe** → Se crea el participante
- En ambos casos → Se crea el registro de asistencia para el evento actual

### Ventajas

✅ Evita duplicar participantes en la base de datos  
✅ Permite que un participante asista a múltiples eventos  
✅ Mantiene la integridad de los datos  

## Código Frontend

### Componente ImportDialog

El componente actualizado (`import-dialog.tsx`) ahora:

1. **Acepta solo archivos Excel** (.xlsx, .xls)
2. **Envía el archivo al backend** usando FormData
3. **Muestra el progreso** con un spinner durante la carga
4. **Muestra mensajes** de éxito o error
5. **Recarga la lista** de participantes automáticamente

```typescript
const handleImport = async () => {
  const formData = new FormData()
  formData.append("archivo", file)
  formData.append("eventoId", eventId)

  const response = await fetch(`${API_BASE_URL}/test/cargar-archivo`, {
    method: "POST",
    body: formData,
  })

  const data = await response.json()
  
  if (data.success) {
    // Éxito: recargar participantes
    onImport([])
    onClose()
  }
}
```

## Solución de Problemas

### ❌ Error: "El archivo debe ser un Excel"

**Causa:** Archivo con formato incorrecto  
**Solución:** Asegúrate de usar `.xlsx` o `.xls`

### ❌ Error: "El archivo está vacío"

**Causa:** Archivo sin datos  
**Solución:** Verifica que el archivo tenga al menos una fila con datos (además del encabezado)

### ❌ Error: "Evento no encontrado"

**Causa:** El ID del evento no existe  
**Solución:** Verifica que estás en un evento válido

### ⚠️ Advertencia: "Fila X ignorada: email vacío"

**Causa:** Fila sin email  
**Solución:** Agrega el email en la columna E o elimina la fila

### ⚠️ Participantes no aparecen

**Causa:** No se recargó la lista  
**Solución:** Haz clic en el botón "Recargar" en el dashboard

## Mejoras Futuras

- [ ] Vista previa de datos antes de importar
- [ ] Validación de formato de email
- [ ] Validación de formato de DNI
- [ ] Estadísticas detalladas de la importación
- [ ] Descarga de plantilla Excel
- [ ] Soporte para más columnas (especialidad, IE educativa, etc.)
- [ ] Importación incremental (actualizar datos existentes)
- [ ] Manejo de errores por fila (continuar aunque haya errores)

## Ejemplo de Uso Completo

### Paso 1: Preparar el Excel

Crea un archivo Excel con esta estructura:

```
Nombres | Apellido Paterno | Apellido Materno | DNI | Email | WhatsApp | Ciudad | Rol
Juan    | Pérez           | García          | 12345678 | juan@mail.com | 987654321 | Lima | Estudiante
María   | López           | Torres          | 87654321 | maria@mail.com | 912345678 | Cusco | Profesional
```

### Paso 2: Acceder al Dashboard

1. Ve a la página del evento
2. Haz clic en "Dashboard"
3. Selecciona la pestaña "Asistentes"

### Paso 3: Importar

1. Haz clic en el botón "Importar"
2. Selecciona tu archivo Excel
3. Haz clic en "Importar Archivo"
4. Espera la confirmación

### Paso 4: Verificar

1. Los participantes aparecerán en la tabla
2. Puedes marcar su asistencia
3. Puedes ver sus detalles haciendo clic en su nombre

## Notas Técnicas

- **Apache POI** se usa para leer archivos Excel en el backend
- **MultipartFile** maneja la carga de archivos en Spring Boot
- **@Transactional** asegura que la importación sea atómica
- El **frontend** usa **FormData** para enviar archivos
- La validación de tipo MIME previene archivos maliciosos

## Conclusión

Esta funcionalidad permite importar participantes de manera rápida y eficiente, reduciendo el trabajo manual y minimizando errores de captura. Asegúrate de seguir el formato especificado para una importación exitosa.
