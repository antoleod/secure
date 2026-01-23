
@@ -1,73 +1 @@
# OryxenTech Collateral Loans

Aplicacion web (React + Firebase) para prestamos con garantia, control de roles y trazabilidad completa. Montada en GitHub Pages usando HashRouter.

## Que incluye
- Portales separados: cliente (KYC, solicitudes, pagos, lealtad) y admin (aprobaciones, bitacora, settings).
- Seguridad base: Storage bloqueado por defecto, reglas de Firestore listas, rutas protegidas por rol, bandera `VITE_ENABLE_UPLOADS`.
- CI/CD en GitHub Actions con lint, typecheck, tests (Vitest) y build antes de publicar en Pages.
- Plantilla de secretos (`.env.example`) y reglas para no exponer credenciales.

## Requisitos
- Node.js 20+
- npm
- Proyecto de Firebase (Auth, Firestore, Storage) y Firebase CLI (`npm i -g firebase-tools`).

## Configuracion local (sin exponer secretos)
1. `cp .env.example .env` y completa los valores reales (no los subas a git).
   - **IMPORTANTE**: Crea un archivo `.env.local` para tus credenciales locales. Este archivo está ignorado por git.
   - Copia las variables de `.env.example` a `.env.local` y asigna los valores de tu proyecto Firebase.
   - Opcional: `VITE_USE_EMULATORS=true` y corre `npm run emulators` antes de `npm run dev`.
2. `npm install`
3. `npm run dev`
4. Calidad: `npm run lint`, `npm run typecheck`, `npm run test` (o `npm run test:ci` para modo no interactivo).
5. Reglas Firestore: `npm run emulators` y luego `npm run test:rules` (requiere FIRESTORE_EMULATOR_HOST).

## Despliegue a GitHub Pages
Configura el repo en GitHub -> Settings -> Secrets and variables:
- Secrets: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`.
- Variables: `VITE_ENABLE_UPLOADS` (default `false`), `VITE_USE_EMULATORS` (default `false`).

Workflows:
- `.github/workflows/ci.yml`: checkout -> .env desde secretos -> install -> typecheck -> lint -> test -> build.
- `.github/workflows/deploy.yml`: igual que CI y luego publica a GitHub Pages (`actions/deploy-pages`), usando `VITE_BASE_PATH=/<repo>/`.

Dominios: añade `YOUR_USERNAME.github.io` (o tu custom domain) en Firebase Auth -> Authorized domains.

## Scripts clave
- `npm run dev` – desarrollo
- `npm run build` – build de produccion (tsc + vite)
- `npm run typecheck` – TypeScript build mode
- `npm run lint` – ESLint
- `npm run test` – Vitest interactivo (jsdom)
- `npm run test:ci` – Vitest en modo run
- `npm run test:rules` – pruebas de reglas (requiere emuladores)
- `npm run emulators` – emuladores Firebase

## Seguridad y secretos
- No commitear `.env` ni credenciales reales; usa `.env.example`.
- Restringe la API key por referer y habilita App Check antes de activar cargas (`VITE_ENABLE_UPLOADS=true`).
- Revisa y despliega reglas en `firebase/firestore.rules` y `firebase/storage.rules`. Storage queda deny-all por defecto.
- Pre-commit: instala `pre-commit` y corre `pre-commit install` para habilitar el hook de `gitleaks`.
- Reporte de vulnerabilidades: ver `SECURITY.md`.

## Arquitectura breve
- `src/App.tsx`: routing con HashRouter, rutas protegidas por rol.
- `src/contexts/AuthContext.tsx`, `src/contexts/I18nContext.tsx`: auth + i18n.
- `src/lib/firebase.ts`: inicializacion de Firebase via `import.meta.env`.
- `src/pages/*`: pantallas publicas, cliente y admin.
- `firebase/*.rules`: reglas de seguridad (storage deny-all por defecto, recomendadas en `storage.rules.recommended`).
- `tests/ui/landing.spec.tsx`: smoke test de UI; `tests/rules/firestore.test.ts`: pruebas de reglas (skip si no hay emulador).

## Notas de UX/UI
- Landing redisenada con fondo gradiente, cards de valor, checklist de seguridad y CTAs claros.
- ErrorBoundary global (`src/components/ErrorBoundary.tsx`) con fallback y reload.
- Tipografia Space Grotesk, sombras suaves y helpers de decoracion (`pattern-grid`, `soft-shadow`).

## Flujo recomendado antes de PR
```bash
npm run lint
npm run typecheck
npm run test:ci
npm run build
