# EM-PMI Frontend

## Descripción

Frontend del Sistema de Gestión de Eventos del Project Management Institute (PMI). Esta aplicación web desarrollada con Next.js proporciona una interfaz de usuario moderna y responsiva para la gestión integral de eventos, participantes, certificaciones y recursos del PMI.

El frontend se conecta con la API del backend para ofrecer funcionalidades completas de administración de eventos, registro de participantes, generación de certificados y gestión de contenido multimedia.

## Tecnologías Utilizadas

- **Next.js 15.2.4** - Framework de React para producción
- **React 19** - Biblioteca de JavaScript para interfaces de usuario
- **TypeScript 5** - Superset tipado de JavaScript
- **Tailwind CSS 4.1.9** - Framework de CSS utilitario
- **Radix UI** - Componentes de interfaz accesibles y personalizables
- **React Hook Form** - Gestión eficiente de formularios
- **Zod** - Validación de esquemas TypeScript
- **Lucide React** - Iconografía moderna
- **Date-fns** - Manipulación de fechas
- **Recharts** - Gráficos y visualización de datos
- **ZXing Library** - Lectura de códigos QR
- **Vercel Analytics** - Análisis de rendimiento

## Requisitos Previos

- Node.js 18.0 o superior
- pnpm, npm o yarn
- Acceso a la API del backend del sistema EM-PMI

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/Davs07/EM-PMI_frontend.git
cd EM-PMI_frontend
```

2. Instalar dependencias:
```bash
pnpm install
# o
npm install
# o
yarn install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env.local
```

4. Editar el archivo `.env.local` con las configuraciones necesarias.

## Configuración del Entorno

Crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# URL de la API del backend
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Configuración de autenticación
NEXT_PUBLIC_JWT_SECRET=tu_jwt_secret_key

# URLs de servicios externos
NEXT_PUBLIC_STORAGE_URL=https://tu-storage-url.com

# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME=EM-PMI
NEXT_PUBLIC_APP_VERSION=1.0.0

# Variables de producción (Vercel)
VERCEL_URL=https://em-pmi.vercel.app
```

Consultar el archivo `ENV_CONFIG.md` para obtener una descripción detallada de todas las variables de entorno disponibles.

## Comandos Principales

### Desarrollo
```bash
pnpm dev
# Ejecuta la aplicación en modo desarrollo en http://localhost:3000
```

### Compilación
```bash
pnpm build
# Genera la compilación optimizada para producción
```

### Ejecución en Producción
```bash
pnpm start
# Ejecuta la aplicación compilada en modo producción
```

### Linting
```bash
pnpm lint
# Ejecuta ESLint para verificar la calidad del código
```

## Estructura del Proyecto

```
EM-PMI_frontend/
├── app/                    # Directorio de aplicación (App Router)
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes reutilizables de UI
│   ├── ui/               # Componentes base de Radix UI
│   └── custom/           # Componentes personalizados
├── lib/                  # Utilidades y configuraciones
│   ├── utils.ts          # Funciones utilitarias
│   └── validations.ts    # Esquemas de validación
├── services/             # Servicios de API y lógica de negocio
│   ├── api.ts           # Cliente HTTP
│   └── auth.ts          # Servicios de autenticación
├── styles/              # Estilos adicionales
├── types/               # Definiciones de tipos TypeScript
├── public/              # Archivos estáticos
├── .env.example         # Plantilla de variables de entorno
├── components.json      # Configuración de componentes UI
├── next.config.mjs      # Configuración de Next.js
├── tailwind.config.js   # Configuración de Tailwind CSS
└── tsconfig.json        # Configuración de TypeScript
```

## Conexión con el Backend

La aplicación se conecta con la API del backend a través de servicios HTTP configurados en el directorio `services/`. Asegurar que:

1. El backend esté ejecutándose en la URL especificada en `NEXT_PUBLIC_API_URL`
2. Las credenciales de autenticación estén configuradas correctamente
3. Los endpoints de la API sean accesibles desde el frontend

## Guía de Contribución

### Flujo de Trabajo

1. **Crear una rama de feature:**
```bash
git checkout -b feature/nueva-funcionalidad
```

2. **Realizar cambios y commits:**
```bash
git add .
git commit -m "feat: agregar nueva funcionalidad de gestión de eventos"
```

3. **Enviar cambios:**
```bash
git push origin feature/nueva-funcionalidad
```

4. **Crear Pull Request:**
   - Usar títulos descriptivos
   - Incluir descripción detallada de los cambios
   - Asignar revisores apropiados
   - Vincular issues relacionados

### Convenciones de Código

- Usar TypeScript para todos los archivos
- Seguir las reglas de ESLint configuradas
- Implementar componentes con Radix UI cuando sea posible
- Usar Tailwind CSS para estilos
- Mantener la estructura de carpetas establecida
- Escribir tests para funcionalidades críticas

### Convenciones de Commits

- `feat:` nueva funcionalidad
- `fix:` corrección de errores
- `docs:` cambios en documentación
- `style:` cambios de formato
- `refactor:` refactorización de código
- `test:` adición o modificación de tests
- `chore:` tareas de mantenimiento

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Autores

- **David Sánchez** - [@Davs07](https://github.com/Davs07)

## Enlaces

- **Aplicación en Producción:** [https://em-pmi.vercel.app](https://em-pmi.vercel.app)
- **Repositorio del Backend:** [Enlace al repositorio del backend]
- **Documentación de la API:** [Enlace a la documentación de la API]

---

**Sistema de Gestión de Eventos PMI** - Desarrollado con Next.js y TypeScript
