# 🔐 Configuración de Variables de Entorno

## Frontend (Next.js)

### Configuración Inicial

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env.local
```

2. Edita `.env.local` con tus valores:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=Sistema de Gestión de Eventos PMI
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Variables Disponibles

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `NEXT_PUBLIC_API_URL` | URL del backend API | `http://localhost:8080/api` |
| `NEXT_PUBLIC_APP_NAME` | Nombre de la aplicación | `Sistema de Gestión de Eventos PMI` |
| `NEXT_PUBLIC_APP_VERSION` | Versión de la aplicación | `1.0.0` |

### Notas Importantes

- Los archivos `.env.local` **NO se suben** a Git (están en `.gitignore`)
- Las variables con prefijo `NEXT_PUBLIC_` son **accesibles en el cliente**
- Reinicia el servidor de desarrollo después de cambiar las variables

---

## Backend (Spring Boot)

### Configuración Inicial

1. Copia el archivo de ejemplo:
```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

2. Edita `application.properties` con tus valores:

### Configuración de Base de Datos

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bd_gestion_eventos?createDatabaseIfNotExist=true
spring.datasource.username=TU_USUARIO
spring.datasource.password=TU_PASSWORD
```

### Configuración de Correo Electrónico

**IMPORTANTE:** Para Gmail, necesitas generar una **contraseña de aplicación**:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Seguridad → Verificación en 2 pasos (debe estar activada)
3. Contraseñas de aplicaciones: https://myaccount.google.com/apppasswords
4. Genera una contraseña para "Otra aplicación personalizada"
5. Usa esa contraseña en `spring.mail.password`

```properties
spring.mail.username=tu_correo@gmail.com
spring.mail.password=xxxx xxxx xxxx xxxx  # Contraseña de aplicación de 16 dígitos
```

### Variables de Configuración

#### Base de Datos
- `spring.datasource.url` - URL de conexión a MySQL
- `spring.datasource.username` - Usuario de MySQL
- `spring.datasource.password` - Contraseña de MySQL

#### Correo Electrónico
- `spring.mail.username` - Correo Gmail
- `spring.mail.password` - Contraseña de aplicación de Gmail
- `spring.mail.host` - Servidor SMTP (default: smtp.gmail.com)
- `spring.mail.port` - Puerto SMTP (default: 587)

#### JPA/Hibernate
- `spring.jpa.hibernate.ddl-auto` - Estrategia de creación de tablas (update, create, none)
- `spring.jpa.show-sql` - Mostrar SQL en logs (true/false)

### Notas de Seguridad

- El archivo `application.properties` **NO se sube** a Git (está en `.gitignore`)
- **NUNCA** uses contraseñas reales en `application.properties.example`
- Para producción, considera usar variables de entorno del sistema
- Mantén las credenciales fuera del código fuente

---

## 🚀 Inicio Rápido

### Frontend
```bash
cd Registro-Asistencia
cp .env.example .env.local
# Editar .env.local con tus valores
npm install
npm run dev
```

### Backend
```bash
cd Gestion_Eventos/Gestion_Eventos
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Editar application.properties con tus valores
./mvnw spring-boot:run
```

---

## ⚠️ Troubleshooting

### Frontend no se conecta al backend
- Verifica que `NEXT_PUBLIC_API_URL` apunte a `http://localhost:8080/api`
- Asegúrate de que el backend esté corriendo en el puerto 8080

### Error de autenticación de correo
- Verifica que estés usando una **contraseña de aplicación**, no tu contraseña de Gmail
- Asegura que la verificación en 2 pasos esté activada en tu cuenta Google

### Error de conexión a base de datos
- Verifica que MySQL esté corriendo
- Confirma usuario y contraseña en `application.properties`
- Verifica que el puerto 3306 esté disponible
