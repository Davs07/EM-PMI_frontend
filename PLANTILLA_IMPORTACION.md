# Plantilla Excel para Importación de Participantes

## Descarga la Plantilla

Puedes crear tu propio archivo Excel con la siguiente estructura:

### Estructura de Columnas

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| **Nombres** | **Apellido Paterno** | **Apellido Materno** | **DNI** | **Email** | **Número de WhatsApp** | **Ciudad** | **Rol** |

### Ejemplo de Datos

```
Nombres          | Apellido Paterno | Apellido Materno | DNI      | Email                    | Número de WhatsApp | Ciudad    | Rol
Juan Carlos      | Pérez           | García          | 12345678 | juan.perez@example.com   | +51987654321      | Lima      | Estudiante
María Elena      | López           | Martínez        | 87654321 | maria.lopez@example.com  | +51912345678      | Arequipa  | Profesional
Pedro José       | Ramírez         | Torres          | 45678901 | pedro.ramirez@gmail.com  | +51998877665      | Cusco     | Docente
Ana Lucía        | González        | Flores          | 23456789 | ana.gonzalez@yahoo.com   | +51987766554      | Trujillo  | Estudiante
Carlos Alberto   | Sánchez         | Rojas           | 34567890 | carlos.sanchez@mail.com  | +51976655443      | Piura     | Ponente
```

### Instrucciones

1. **Copia esta estructura** a Excel
2. **Primera fila = Encabezados** (no modificar el orden)
3. **Segunda fila en adelante = Datos** de participantes
4. **Email es obligatorio** - no dejes esta columna vacía
5. **Guarda como** `.xlsx` o `.xls`
6. **Importa** desde el botón "Importar" en el dashboard

### Campos Obligatorios

- ✅ **Email** (Columna E) - OBLIGATORIO

### Campos Opcionales

- Nombres (Columna A)
- Apellido Paterno (Columna B)
- Apellido Materno (Columna C)
- DNI (Columna D)
- Número de WhatsApp (Columna F)
- Ciudad (Columna G)
- Rol (Columna H)

### Ejemplos de Roles

- Estudiante
- Profesional
- Docente
- Ponente
- Investigador
- Miembro PMI
- Otro

### Notas Importantes

⚠️ **No agregues columnas extra** al inicio o entre las columnas especificadas  
⚠️ **Mantén el orden** de las columnas como se muestra  
⚠️ Si un participante **ya existe** (mismo email), no se duplicará  
✅ Puedes dejar celdas vacías excepto el **Email**  
✅ El sistema **ignorará filas sin email**  

### Plantilla Descargable

Puedes crear un archivo Excel con estos datos de ejemplo para probar:

**Archivo:** `plantilla_participantes.xlsx`

```
| Nombres | Apellido Paterno | Apellido Materno | DNI | Email | Número de WhatsApp | Ciudad | Rol |
|---------|------------------|------------------|-----|-------|-------------------|--------|-----|
| | | | | | | | |
```

Copia esta tabla en Excel, agrega tus datos y guárdalo.
