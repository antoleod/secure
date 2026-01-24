# Secure · Plataforma de préstamos con garantía (Bruselas)

Aplicación React + Vite + Firebase con HashRouter para el panel (`/#/…`) y landings estáticas listas para SEO en Bruselas.

## Qué hay ahora
- Landings SEO: `/es/prestamo-dinero-bruselas/`, `/fr/pret-argent-bruxelles/`, `/nl/geld-lenen-brussel/`, `/en/loan-money-brussels/` con `<title>`, meta description, canonical, hreflang, OG/Twitter y JSON-LD (Organization, FinancialService, FAQPage, Breadcrumb).
- Páginas legales: `/privacy/`, `/terms/`, `/cookies/`, `/responsible-lending/`.
- `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `CNAME` (`secure.oryxen.tech`) y `404.html` para fallback en GitHub Pages.
- SPA protegida con roles: login/registro/reset + panel admin/customer. Storage deshabilitado por defecto (`VITE_ENABLE_UPLOADS=false`).

## Stack y scripts
- React 19 + TS, Vite, Tailwind utilities, Firebase (Auth/Firestore/Storage).
- CI/CD en GitHub Actions (`ci.yml`, `deploy.yml`) con lint, typecheck, tests y build antes de publicar (base `/`).
- Scripts: `npm run dev`, `npm run build`, `npm run typecheck`, `npm run lint`, `npm run format` (Prettier), `npm run test` / `npm run test:ci`, `npm run test:rules`, `npm run emulators`.

## Configuración local (sin exponer secretos)
1. `cp .env.example .env` y completa con tus valores (no los subas). Usa `.env.local` para desarrollo (ignorado).
2. `npm ci`
3. Opcional: `VITE_USE_EMULATORS=true` y `npm run emulators`. Luego `npm run dev`.

## Despliegue GitHub Pages + dominio
- Secrets necesarios: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`.
- Variables opcionales: `VITE_ENABLE_UPLOADS` (default `false`), `VITE_USE_EMULATORS` (default `false`), `VITE_BASE_PATH` (default `/`).
- DNS: CNAME `secure.oryxen.tech` -> `antoleod.github.io`. Añade el dominio en Firebase Auth (Authorized domains).
- Deploy automático en push a `main` vía `.github/workflows/deploy.yml`.

## Seguridad y cumplimiento
- Sin claves reales en el repo (`.env.example` usa placeholders).
- Firestore rules deny-by-default (ver `firestore.rules`).
- Sin “aprobación garantizada”; todas las landings incluyen ejemplo representativo y aviso de préstamo responsable.
- `404.html` redirige al root para evitar errores de enrutado en Pages.

## Rutas principales
- SEO: `/es/prestamo-dinero-bruselas/`, `/fr/pret-argent-bruxelles/`, `/nl/geld-lenen-brussel/`, `/en/loan-money-brussels/`
- Legales: `/privacy/`, `/terms/`, `/cookies/`, `/responsible-lending/`
- App: `/#/login`, `/#/register`, `/#/reset`, `/#/dashboard`, `/#/admin/*`, `/#/app/*`

## Antes de hacer PR
```bash
npm run lint
npm run typecheck
npm run test:ci
npm run build
```
