# EM-PMI_frontend

Proyecto frontend creado con Next.js + TypeScript. Interfaz para la aplicación EM-PMI (deploy: https://em-pmi.vercel.app).

Tecnologías principales
- Next.js
- React
- TypeScript
- Tailwind CSS
- Radix UI
- Otras: react-hook-form, zod, recharts, date-fns

Requisitos
- Node.js (recomendado >= 18)
- npm o pnpm (el repo contiene lockfiles para npm y pnpm)

Instalación (básica)
1. Clona el repositorio:
   git clone https://github.com/Davs07/EM-PMI_frontend.git
2. Entra al directorio:
   cd EM-PMI_frontend
3. Instala dependencias:
   - con npm: npm install
   - con pnpm: pnpm install

Variables de entorno
- Revisa `.env.example` y `ENV_CONFIG.md` para las variables necesarias y su explicación.
- Crea un archivo `.env` o configura las variables según tu entorno antes de ejecutar la app.

Comandos útiles
- Desarrollo: npm run dev
- Build (producción): npm run build
- Ejecutar (producción): npm start
- Lint: npm run lint

Estructura (resumen)
- app/         — rutas y páginas de Next.js (carpeta principal de la app)
- components/  — componentes reutilizables
- services/    — llamadas a APIs / lógica de servicios
- styles/      — estilos globales / utilidades de Tailwind
- public/      — assets públicos
- types/       — tipos TypeScript
- lib/         — utilidades y configuración
- ENV_CONFIG.md y .env.example — configuración de variables de entorno

Cómo contribuir
- Crea una rama nueva para tu cambio: git checkout -b feature/mi-cambio
- Haz commits claros y descriptivos.
- Abre un Pull Request contra `main`.

Más info
- Repo: https://github.com/Davs07/EM-PMI_frontend
- Sitio en producción: https://em-pmi.vercel.app
