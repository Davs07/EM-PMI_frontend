# 🔍 Solución: Por qué no aparecen los datos

## ✅ Cambios Realizados

He actualizado el componente `event-dashboard.tsx` para que **cargue los datos desde la API** en lugar de usar datos hardcodeados.

---

## 📋 Verificaciones Necesarias

### 1. **¿Está el Backend Corriendo?**

El backend debe estar ejecutándose en `http://localhost:8080`. Para verificar:

```bash
# En una terminal, ve a tu proyecto backend y ejecuta:
./mvnw spring-boot:run
# O si usas Maven directamente:
mvn spring-boot:run
```

### 2. **¿Tiene Datos el Backend?**

Verifica que tu base de datos tenga participantes registrados. Puedes probar el endpoint directamente desde tu navegador:

```
http://localhost:8080/api/participante/listar
```

Deberías ver un JSON con el listado de participantes:

```json
[
  {
    "id": 1,
    "nombres": "Juan",
    "apellidoPaterno": "Pérez",
    "apellidoMaterno": "García",
    "dni": "12345678",
    "email": "juan.perez@example.com",
    "numeroWhatsapp": "+51987654321",
    "ciudad": "Lima",
    "rol": "Participante",
    ...
  }
]
```

### 3. **¿Hay Errores de CORS?**

Si el backend está corriendo pero no aparecen datos, puede ser un problema de CORS. Abre la consola del navegador (F12) y busca errores como:

```
Access to fetch at 'http://localhost:8080/api/participante/listar' from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Solución:** Configura CORS en tu backend. Agrega esta anotación a tu controlador:

```java
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RestController
@RequestMapping("/api/participante")
public class ParticipanteController {
    // ...
}
```

O configura CORS globalmente:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:3001")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowCredentials(true);
    }
}
```

---

## 🔄 Flujo Actualizado

1. **Usuario abre la aplicación** → `http://localhost:3001`
2. **Navega a un evento** → Click en "Ver Evento"
3. **EventDetailView carga** → Muestra detalles del evento
4. **EventDashboard se monta** → `useEffect()` se ejecuta
5. **Llama a `loadParticipantes()`** → Hace fetch a `http://localhost:8080/api/participante/listar`
6. **Transforma los datos** → Convierte `Participante` a `Attendee`
7. **Clasifica por tipo** → Basado en el campo `rol`
8. **Muestra en tabs** → Virtual, Presencial, Ponentes

---

## 🐛 Cómo Verificar el Problema

### Paso 1: Abrir la Consola del Navegador
1. Abre tu aplicación en `http://localhost:3001`
2. Presiona `F12` para abrir las herramientas de desarrollador
3. Ve a la pestaña **Console**

### Paso 2: Buscar Mensajes
Busca uno de estos mensajes:

#### ✅ **SI VES ESTO (Bueno):**
```
Cargando participantes desde el backend...
```
Luego debería mostrar la tabla con datos.

#### ⚠️ **SI VES ESTO (Error de Conexión):**
```
Error al cargar participantes: Error: Failed to fetch
No se pudieron cargar los participantes. Verifica que el servidor esté en ejecución.
```
**Solución:** Inicia tu backend.

#### ⚠️ **SI VES ESTO (Error de CORS):**
```
Access to fetch at 'http://localhost:8080/...' has been blocked by CORS policy
```
**Solución:** Configura CORS en el backend (ver arriba).

#### ⚠️ **SI VES ESTO (Endpoint no encontrado):**
```
Error al cargar participantes: Error: Error al obtener participantes: 404
```
**Solución:** Verifica que el endpoint `/api/participante/listar` exista en tu backend.

### Paso 3: Verificar la Pestaña Network
1. Ve a la pestaña **Network** en las herramientas de desarrollador
2. Recarga la página (`Ctrl+R` o `Cmd+R`)
3. Busca la petición a `listar`
4. Verifica:
   - **Status Code**: Debería ser `200 OK`
   - **Response**: Debería mostrar el JSON con los participantes

---

## 🎯 Estados de Carga

El componente ahora muestra diferentes estados:

### 1. **Estado de Carga** (mientras consulta la API)
```
"Cargando participantes desde el backend..."
```

### 2. **Estado de Error** (si falla la conexión)
```
"No se pudieron cargar los participantes. Verifica que el servidor esté en ejecución."
[Botón: Reintentar]
```

### 3. **Estado con Datos** (cuando carga exitosamente)
- Muestra la tabla con los participantes
- Clasifica en tabs: Virtual, Presencial, Ponentes
- Permite filtrar y buscar

---

## 📝 Campos Mapeados

Los datos del backend se transforman así:

| Backend (Participante) | Frontend (Attendee) |
|------------------------|---------------------|
| `id` | `id` |
| `dni` | `dni` |
| `apellidoPaterno + apellidoMaterno + nombres` | `fullName` |
| `email` | `email` |
| `numeroWhatsapp` | `phone` |
| `ciudad` | `city` |
| `rol` | `role` |
| `gradoEstudio` | `studyProgram` |
| `capituloPmi` | `pmiChapter` |
| `idMiembroPmi` | `pmiMemberId` |
| `cuentaConCertificadoPmi` | `pmiCertification` |
| `evidenciaEstudio` | `studentCardLink` |

---

## 🔧 Clasificación Automática

Los participantes se clasifican automáticamente en tabs según su `rol`:

### Tab "Ponentes"
Si el rol contiene:
- "ponente"
- "speaker"
- "expositor"

### Tab "Virtual"
Si el rol contiene:
- "virtual"
- "online"

### Tab "Presencial" (Por defecto)
Cualquier otro rol

---

## ✨ Próximos Pasos

Si todo funciona correctamente, verás:

1. ✅ Los participantes cargados desde el backend
2. ✅ Clasificados en las tabs correctas
3. ✅ Búsqueda funcionando (por nombre, DNI, email)
4. ✅ Filtros de asistencia funcionando
5. ✅ Exportación de datos funcionando

---

## 🆘 ¿Aún no funciona?

Si después de verificar todo lo anterior aún no aparecen datos:

1. **Verifica en la consola del navegador** (F12 → Console)
2. **Copia el mensaje de error completo**
3. **Verifica el endpoint en el navegador**: `http://localhost:8080/api/participante/listar`
4. **Comprueba que el backend tenga datos** en la base de datos

### Comando para verificar si el backend responde (en PowerShell):
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/participante/listar" | Select-Object -Expand Content
```

---

## 📌 Resumen

**Problema:** No aparecían los datos porque el componente tenía datos hardcodeados.

**Solución:** Actualicé `event-dashboard.tsx` para:
- ✅ Llamar a la API en el `useEffect()`
- ✅ Transformar los datos del backend
- ✅ Mostrar estados de carga y error
- ✅ Clasificar automáticamente por tipo
- ✅ Mantener toda la funcionalidad existente

**Requisito:** El backend debe estar corriendo en `http://localhost:8080` con datos en la base de datos.
