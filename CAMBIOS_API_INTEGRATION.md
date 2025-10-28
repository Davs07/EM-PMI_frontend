# Integración de API - Resumen de Cambios

## Fecha: 26 de Octubre, 2025

### 📋 Resumen
Se actualizó el sistema para integrar correctamente la API de backend con el frontend, mapeando la entidad Java `Participante` a TypeScript y permitiendo mostrar los datos en las tablas de asistencia.

---

## 🔄 Archivos Modificados

### 1. **`components/ui/data/model.ts`**
**Cambios principales:**
- Se actualizó la interfaz `Participante` para mapear todos los campos de la entidad Java
- Se agregó la interfaz `Asistencia` para la relación one-to-many

**Nuevos campos:**
```typescript
export interface Participante {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni: string;
  email: string;
  numeroWhatsapp: string;
  ciudad: string;
  rol: string;
  gradoEstudio: string;
  evidenciaEstudio?: string; // Base64 o URL
  capituloPmi: string;
  idMiembroPmi: string;
  cuentaConCertificadoPmi: boolean;
  asistencias?: Asistencia[];
}
```

### 2. **`components/ui/data/api.ts`**
**Cambios principales:**
- Se actualizó la función `fetchParticipantes()` para mapear correctamente todos los campos
- Se agregó manejo de errores robusto
- Se agregaron validaciones y valores por defecto

**Características:**
```typescript
export const fetchParticipantes = async (): Promise<Participante[]> => {
  // Manejo de errores HTTP
  // Mapeo completo de campos
  // Valores por defecto para campos opcionales
}
```

### 3. **`components/event-landing.tsx`**
**Cambios principales:**
- Se agregó integración con la API usando `useEffect`
- Se creó una interfaz `Attendee` para transformar datos de `Participante` a formato de tabla
- Se implementó la función `loadParticipantes()` para cargar datos desde el backend
- Se agregó lógica de transformación de datos con `determineType()`
- Se implementó manejo de estados de carga y errores
- Se agregó función `handleViewDetails()` para mostrar detalles de participantes
- Se actualizaron las funciones de exportación (CSV y PDF) para usar `fullName`

**Nuevas funcionalidades:**
```typescript
// Estados de carga
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

// Transformación de datos
const transformedAttendees: Attendee[] = participantes.map((p) => ({
  id: p.id,
  dni: p.dni,
  fullName: `${p.apellidoPaterno} ${p.apellidoMaterno} ${p.nombres}`.trim(),
  email: p.email,
  registrationDate: new Date().toLocaleDateString("es-ES"),
  status: "absent",
  type: determineType(p),
  participante: p,
}))

// Determinar tipo basado en rol
const determineType = (participante: Participante): string => {
  const rol = participante.rol?.toLowerCase() || ""
  if (rol.includes("ponente") || rol.includes("speaker")) return "ponentes"
  if (rol.includes("virtual") || rol.includes("online")) return "virtual"
  return "presencial"
}
```

### 4. **`components/attendance-table.tsx`**
**Cambios principales:**
- Se agregó el import de `Participante` desde `model.ts`
- Se actualizó la interfaz `Attendee` para incluir `participante: Participante`

**Interfaz actualizada:**
```typescript
interface Attendee {
  id: number
  dni: string
  fullName: string
  email: string
  registrationDate: string
  status: "present" | "absent"
  type: string
  participante: Participante // ← Nueva propiedad
  [key: string]: any
}
```

---

## 🎯 Funcionalidades Implementadas

### ✅ Carga de Datos desde API
- Los participantes se cargan automáticamente al montar el componente
- Se muestra un indicador de carga mientras se obtienen los datos
- Se maneja correctamente los errores de conexión

### ✅ Transformación de Datos
- Los datos del backend se transforman al formato esperado por la tabla
- Se construye el nombre completo concatenando apellidos y nombres
- Se determina automáticamente el tipo (virtual/presencial/ponentes) basado en el rol

### ✅ Filtrado y Búsqueda
- Búsqueda por nombre completo, email o DNI
- Filtrado por tipo (virtual/presencial/ponentes)
- Filtrado por estado de asistencia (todos/presente/ausente)

### ✅ Vista de Detalles
- Se puede ver información detallada de cada participante
- Actualmente muestra un alert con los datos (puede expandirse a un modal)

### ✅ Exportación de Datos
- Exportación a CSV con los datos filtrados
- Generación de reportes de texto con estadísticas

---

## 🔧 Configuración Requerida

### Backend API
Asegúrate de que tu backend esté corriendo en:
```
http://localhost:8080/api/participante/listar
```

### Estructura de Respuesta Esperada
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
    "gradoEstudio": "Universitario",
    "evidenciaEstudio": null,
    "capituloPmi": "Lima",
    "idMiembroPmi": "PMI123",
    "cuentaConCertificadoPmi": true,
    "asistencias": []
  }
]
```

---

## 🚀 Próximos Pasos Sugeridos

1. **Modal de Detalles**: Implementar un modal completo en lugar del alert para mostrar detalles del participante
2. **Gestión de Asistencias**: Integrar el registro de asistencias con el backend
3. **QR Scanner**: Conectar el escáner QR con la búsqueda de participantes
4. **Actualización en Tiempo Real**: Implementar websockets o polling para actualizaciones automáticas
5. **Paginación**: Agregar paginación para listas grandes de participantes
6. **Filtros Avanzados**: Agregar más filtros (por ciudad, grado de estudio, etc.)

---

## 🐛 Solución de Problemas

### Error: "No se pudieron cargar los participantes"
- Verifica que el backend esté corriendo en `http://localhost:8080`
- Revisa la consola del navegador para más detalles del error
- Verifica que el endpoint `/api/participante/listar` esté disponible

### No se muestran participantes en la tabla
- Verifica que hay datos en el backend
- Revisa que los participantes tengan el campo `rol` correctamente configurado
- Comprueba los filtros de búsqueda y tabs activos

### Errores de CORS
Si ves errores de CORS, configura tu backend para permitir peticiones desde `http://localhost:3000`:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

---

## 📝 Notas Adicionales

- El campo `evidenciaEstudio` (byte[] en Java) se espera como string Base64 o URL en el frontend
- La fecha de registro actualmente usa la fecha actual; considera agregar un campo real en el backend
- El estado de asistencia por defecto es "ausente"
- La clasificación de tipo se basa en el campo `rol` del participante
