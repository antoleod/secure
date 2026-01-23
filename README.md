# OryxenTech Collateral Loans

Aplicación web (React + Firebase) para gestión de préstamos con control de roles y trazabilidad. Todas las cantidades monetarias se guardan en centavos enteros.

## Resumen rápido
- Portal de clientes: KYC, registro de garantía, solicitudes, pagos, estado de lealtad.
- Portal de administración: aprobación de solicitudes, creación de préstamos, confirmación de pagos, parámetros de negocio y bitácora.
- Hosting en GitHub Pages con `HashRouter` para rutas seguras ante refresh.
- Storage **deshabilitado por defecto** (reglas deny-all); habilitar solo tras publicar reglas seguras.

## Requisitos
- Node.js 20+, npm
- Proyecto de Firebase propio (Firestore, Auth y Storage)
- Firebase CLI (`npm i -g firebase-tools`)
- Cuenta de GitHub para Pages (deploy vía Actions)

## Configuración local (sin exponer secretos)
1) Instala dependencias: `npm install`
2) Copia `.env.example` a `.env` y rellena los placeholders con las credenciales **fuera del control de Git**.
   - `VITE_ENABLE_UPLOADS=false` hasta tener reglas de Storage aprobadas.
   - Opcional para emuladores: `VITE_USE_EMULATORS=true` y ejecuta `npm run emulators` antes de `npm run dev`.
3) Ejecuta el dev server: `npm run dev`
4) Calidad: `npm run lint` y `npm run test`
5) Pruebas de reglas de Firestore: `npm run emulators` luego `npm run test:rules`

## Despliegue a GitHub Pages
0) Configura los secretos del repo (GitHub → Settings → Secrets/Variables):
   - Secretos: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`
   - Variables (no sensibles): `VITE_ENABLE_UPLOADS` (default `false`), `VITE_USE_EMULATORS` (default `false`)
1) Push a `main`; `.github/workflows/deploy.yml` construye y publica.
2) El build usa `VITE_BASE_PATH=/<repo>/` automáticamente; ajústalo si cambias el nombre del repositorio.
3) Añade `YOUR_USERNAME.github.io` (o dominio propio) en Firebase Auth → Authorized domains.

## Seguridad y secretos
- **Nunca** commitees `.env` ni credenciales reales. Usa `.env.example` como plantilla.
- Elimina y regenera cualquier clave que haya sido expuesta previamente.
- Restringe la Firebase API key por origen HTTP (referers) y habilita reglas estrictas en Firestore/Storage; la “API key pública” no debe dar acceso por sí sola.
- Habilita App Check y reglas de seguridad antes de activar cargas (`VITE_ENABLE_UPLOADS=true`).
- Herramientas preventivas:
  - Pre-commit con `gitleaks` (ver `.pre-commit-config.yaml`).
  - Secret scanning en GitHub Security (o gitleaks en CI si Advanced Security no está disponible).
- Reporte de vulnerabilidades: sigue `SECURITY.md`.

## Scripts clave
- `npm run dev` — desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npm run test` — Vitest (jsdom)
- `npm run emulators` — arranca emuladores de Firebase
- `npm run test:rules` — pruebas de reglas (requiere emuladores corriendo)

## Estructura relevante
- `src/lib/firebase.ts` — inicialización de Firebase (solo lee `import.meta.env.*`).
- `firebase/firestore.rules` y `firebase/storage.rules` — reglas vigentes (storage deniega todo).
- `firebase/storage.rules.recommended` — reglas listas para habilitar cargas seguras.
- `.github/workflows/ci.yml` y `deploy.yml` — validación y despliegue a Pages.

## Flags y UX
- `VITE_ENABLE_UPLOADS=false`: UI pide referencia textual en vez de archivos y muestra aviso.
- i18n listo (EN/ES/FR) con selector en encabezados.
