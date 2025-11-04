# Solución al Problema de Asistencias No Visibles

## Problema Identificado

Las asistencias no se muestran en el frontend después de cambiar la entidad `Participante`.

## Cambios en la Entidad Participante

### ⚠️ Problema Principal: FetchType.EAGER

Tu entidad tiene:
```java
@OneToMany(mappedBy = "participante", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
private Set<Asistencia> asistencias = new HashSet<>();
```

**Problemas con EAGER:**
1. **Serialización circular**: Cuando Jackson intenta serializar un `Participante`, también serializa todas sus `Asistencias`, y cada `Asistencia` tiene una referencia al `Participante`, creando un ciclo infinito.
2. **Rendimiento**: Carga todas las asistencias incluso cuando no las necesitas.
3. **N+1 queries**: Puede generar múltiples consultas a la base de datos.

### ✅ Solución Recomendada

#### Opción 1: Cambiar a LAZY y usar @JsonIgnore (Recomendado)

```java
@Entity
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = "email", name = "uk_participante_email"),
        @UniqueConstraint(columnNames = "numeroWhatsapp", name = "uk_participante_telefono")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Participante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String dni;
    private String email;
    private String numeroWhatsapp;  // ✅ Cambiado de telefono
    private String ciudad;
    private String rol;
    private String gradoEstudio;
    private String especialidad;     // Campo adicional
    private String ieEducativa;      // Campo adicional
    private String evidenciaEstudio;
    private String capituloPmi;
    private String idMiembroPmi;
    private boolean cuentaConCertificadoPmi = true;

    // ⚠️ Cambiar a LAZY y agregar @JsonIgnore
    @OneToMany(mappedBy = "participante", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  // Evita serialización circular
    private Set<Asistencia> asistencias = new HashSet<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Participante)) return false;
        Participante that = (Participante) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
```

#### Opción 2: Usar DTOs (Mejor práctica)

Crear un DTO sin la relación circular:

```java
@Data
@Builder
public class ParticipanteDTO {
    private Long id;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String dni;
    private String email;
    private String numeroWhatsapp;
    private String ciudad;
    private String rol;
    private String gradoEstudio;
    private String especialidad;
    private String ieEducativa;
    private String evidenciaEstudio;
    private String capituloPmi;
    private String idMiembroPmi;
    private boolean cuentaConCertificadoPmi;
    // NO incluir asistencias aquí
}
```

Y en tu servicio/controlador:

```java
public ParticipanteDTO toDTO(Participante participante) {
    return ParticipanteDTO.builder()
        .id(participante.getId())
        .nombres(participante.getNombres())
        .apellidoPaterno(participante.getApellidoPaterno())
        .apellidoMaterno(participante.getApellidoMaterno())
        .dni(participante.getDni())
        .email(participante.getEmail())
        .numeroWhatsapp(participante.getNumeroWhatsapp())
        .ciudad(participante.getCiudad())
        .rol(participante.getRol())
        .gradoEstudio(participante.getGradoEstudio())
        .especialidad(participante.getEspecialidad())
        .ieEducativa(participante.getIeEducativa())
        .evidenciaEstudio(participante.getEvidenciaEstudio())
        .capituloPmi(participante.getCapituloPmi())
        .idMiembroPmi(participante.getIdMiembroPmi())
        .cuentaConCertificadoPmi(participante.isCuentaConCertificadoPmi())
        .build();
}
```

## Verificación del Frontend

El frontend ya está preparado para manejar las asistencias correctamente:

### 1. Servicio de Asistencias (`attendance-service.ts`)
- ✅ Tiene métodos para cargar asistencias por participante y evento
- ✅ Puede actualizar el estado de asistencia
- ✅ Maneja el registro por QR

### 2. Dashboard (`event-dashboard.tsx`)
- ✅ Carga participantes del evento específico
- ✅ Para cada participante, consulta su estado de asistencia
- ✅ Actualiza el estado localmente cuando cambia

### 3. Flujo de Carga de Datos

```typescript
// 1. Cargar participantes del evento
const participantes = await participantService.getByEventId(eventId)

// 2. Para cada participante, cargar su asistencia
const asistencia = await attendanceService.getByParticipantAndEvent(p.id, eventId)

// 3. Combinar la información
attendanceStatus = asistencia.asistio ? "present" : "absent"
```

## Verificación de Endpoints del Backend

Asegúrate de que estos endpoints estén funcionando:

### 1. Obtener Participantes por Evento
```
GET /api/participante/evento/{eventoId}
```

### 2. Obtener Asistencia de un Participante en un Evento
```
GET /api/asistencias/participante/{participanteId}/evento/{eventoId}
```

### 3. Actualizar Estado de Asistencia
```
PATCH /api/asistencias/participante/{participanteId}/evento/{eventoId}/estado
Body: { "asistio": true/false }
```

## Pasos para Resolver el Problema

1. **Actualizar la entidad Participante**:
   - Cambiar `FetchType.EAGER` a `FetchType.LAZY`
   - Agregar `@JsonIgnore` a la relación `asistencias`

2. **Verificar que la tabla se actualizó correctamente**:
   ```sql
   -- Verificar estructura de la tabla
   DESCRIBE participante;
   
   -- Debe tener numeroWhatsapp en lugar de telefono
   -- Si no, ejecutar:
   ALTER TABLE participante CHANGE telefono numeroWhatsapp VARCHAR(255);
   ```

3. **Reiniciar el servidor backend**:
   - Detener el servidor Java
   - Limpiar y compilar: `mvn clean install`
   - Iniciar el servidor nuevamente

4. **Verificar en el frontend**:
   - Abrir el navegador en el dashboard
   - Abrir la consola del navegador (F12)
   - Verificar que no haya errores 404 o 500
   - Verificar que se cargan los participantes y sus asistencias

## Debugging

### En el Backend (Java)

Agregar logs en tu controlador:

```java
@GetMapping("/participante/evento/{eventoId}")
public ResponseEntity<List<ParticipanteDTO>> getParticipantesByEvento(@PathVariable Long eventoId) {
    logger.info("Obteniendo participantes para evento: {}", eventoId);
    List<Participante> participantes = participanteService.findByEventoId(eventoId);
    logger.info("Encontrados {} participantes", participantes.size());
    return ResponseEntity.ok(participantes.stream()
        .map(this::toDTO)
        .collect(Collectors.toList()));
}
```

### En el Frontend (TypeScript)

El código ya tiene logs. Verifica en la consola del navegador:

```javascript
console.log("Participantes cargados:", participantes.length)
console.log("Estado de asistencia:", asistencia)
```

## Migración de Datos

Si tienes datos antiguos con el campo `telefono`, necesitas migrar:

```sql
-- Si la columna numeroWhatsapp no existe
ALTER TABLE participante ADD COLUMN numeroWhatsapp VARCHAR(255);

-- Copiar datos de telefono a numeroWhatsapp
UPDATE participante SET numeroWhatsapp = telefono WHERE numeroWhatsapp IS NULL;

-- Opcional: Eliminar la columna antigua
ALTER TABLE participante DROP COLUMN telefono;
```

## Resumen

El problema no está en el frontend (que ya está bien configurado), sino en:

1. ⚠️ **FetchType.EAGER** causando problemas de serialización
2. ⚠️ Falta de **@JsonIgnore** en la relación bidireccional
3. ⚠️ Posibles datos inconsistentes si no migraste correctamente

**Acción principal**: Cambiar a `FetchType.LAZY` y agregar `@JsonIgnore` en la relación `asistencias`.
