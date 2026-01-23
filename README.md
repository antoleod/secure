# OryxenTech Collateral Loans

Collateral-backed loan web app (React + Firebase) with auditable, role-based access. All monetary values are stored as integer cents.

---

## English (EN)

### What this is
- Customer portal for KYC, collateral registration, loan simulation/requests, payments, and loyalty view.
- Admin portal for reviewing requests, creating loans, confirming payments, adjusting business settings, and reading audit logs.
- GitHub Pages hosting with HashRouter for refresh-safe routing.

### Security & rules
- Firestore rules enforce role-based access (customer vs admin) and per-user scoping.
- Storage uploads are **disabled by default** (deny-all rules). UI shows a non-upload path when disabled.
- All admin actions generate audit-ready data; payments must be confirmed by admins.
- Never bypass rules in frontend logic; rely on Firestore permissions.

### Requirements
- Node.js 20+, npm
- Firebase project (configured: `oryxentech`)
- Firebase CLI (`npm i -g firebase-tools`)
- GitHub account for Pages deployment

### Setup
1) Install deps: `npm install`
2) Environment: `.env` already contains the public Firebase config. Feature flags:
   - `VITE_ENABLE_UPLOADS=false` (keep until storage rules are approved)
   - Optional: `.env.local` with `VITE_USE_EMULATORS=true` for local emulators
3) Run dev server: `npm run dev`
4) Lint/Test: `npm run lint` and `npm run test` (unit/UI)
5) Rules tests: start emulators (`npm run emulators`) then `npm run test:rules`

### Firebase notes
- Firestore rules: `firebase/firestore.rules`
- Storage rules (deny all): `firebase/storage.rules`
- Recommended storage rules: `firebase/storage.rules.recommended` (copy over when ready, then deploy)
- Auth domain: add `YOUR_USERNAME.github.io` to Firebase Auth → Settings → Authorized domains

### Deployment (GitHub Pages)
1) Push to `main`; GitHub Actions (`.github/workflows/deploy.yml`) builds & deploys to Pages.
2) Build uses `VITE_BASE_PATH=/<repo>/` automatically; adjust if repo name differs.
3) CI workflow (`.github/workflows/ci.yml`) runs lint + tests on pushes/PRs.

### Feature flags & UX
- Uploads off: UI requests text references instead of files and shows a notice.
- Uploads on: set `VITE_ENABLE_UPLOADS=true` **after** deploying safe storage rules.
- i18n: English, Spanish, French strings included; language switcher in headers.

### Key commands
- `npm run dev` – local dev
- `npm run lint` – ESLint
- `npm run test` – Vitest (jsdom)
- `npm run test:rules` – Firestore security tests (requires emulators)
- `npm run build` – TypeScript build + Vite bundle

### Important paths
- App entry & routing: `src/App.tsx`, `src/main.tsx`
- Auth & i18n: `src/contexts/AuthContext.tsx`, `src/contexts/I18nContext.tsx`
- Firestore helpers: `src/lib/firestoreClient.ts`, `src/lib/converters.ts`
- Security rules: `firebase/firestore.rules`, `firebase/storage.rules`
- Workflows: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`

---

## Español (ES)

### Descripción
- Portal de clientes para KYC, registro de garantía, simulación/solicitud de préstamos, pagos y estado de lealtad.
- Portal de administración para revisar solicitudes, crear préstamos, confirmar pagos, configurar límites y ver bitácoras de auditoría.
- Hosting en GitHub Pages con HashRouter.

### Seguridad
- Reglas de Firestore con control por rol y acceso por usuario.
- Storage bloqueado por defecto (reglas `deny all`). La UI muestra rutas sin carga de archivos.
- Acciones de admin auditables; los pagos requieren confirmación administrativa.

### Requisitos y configuración
1) Node.js 20+, npm; instalar deps: `npm install`
2) Variables en `.env` (Firebase público). Flags:
   - `VITE_ENABLE_UPLOADS=false` (mantener hasta aprobar reglas de storage)
   - Opcional `.env.local` con `VITE_USE_EMULATORS=true` para emuladores
3) Ejecutar: `npm run dev`
4) Lint/tests: `npm run lint`, `npm run test`
5) Pruebas de reglas: `npm run emulators` y luego `npm run test:rules`

### Firebase
- Reglas Firestore: `firebase/firestore.rules`
- Storage actual: `firebase/storage.rules` (denegar todo)
- Reglas recomendadas: `firebase/storage.rules.recommended` (copiar antes de habilitar cargas)
- Dominio autorizado: agregar `YOUR_USERNAME.github.io` en Firebase Auth → Settings → Authorized domains

### Despliegue (GitHub Pages)
- Push a `main`; Actions construye y publica (workflow `deploy.yml`).
- CI (`ci.yml`) valida con lint + tests.
- Si cambias el nombre del repo, ajusta `VITE_BASE_PATH` en el paso de build.

### Banderas y UX
- Cargas desactivadas: se pide referencia en texto y se muestra aviso.
- Para activar cargas: `VITE_ENABLE_UPLOADS=true` solo después de reglas seguras.
- i18n listo en EN/ES/FR con selector en el encabezado.

### Comandos clave
- `npm run dev`, `npm run lint`, `npm run test`, `npm run test:rules`, `npm run build`

---

## Français (FR)

### Présentation
- Portail client : KYC, garantie, simulation/demande de prêt, paiements, fidélité.
- Portail admin : revue des demandes, création de prêts, confirmation des paiements, paramètres métier, journal d’audit.
- Hébergement GitHub Pages (HashRouter pour les rafraîchissements).

### Sécurité
- Règles Firestore par rôle et par utilisateur.
- Stockage désactivé par défaut (deny all). L’UI propose une preuve textuelle.
- Actions admin auditables; les paiements doivent être confirmés par un admin.

### Mise en route
1) Prérequis: Node.js 20+, npm. Installer: `npm install`
2) Variables: `.env` avec config Firebase publique.
   - `VITE_ENABLE_UPLOADS=false` tant que les règles de stockage ne sont pas validées
   - Option: `.env.local` avec `VITE_USE_EMULATORS=true` pour les émulateurs
3) Dev: `npm run dev`
4) Lint/tests: `npm run lint`, `npm run test`
5) Tests de règles: lancer `npm run emulators`, puis `npm run test:rules`

### Firebase
- Règles Firestore: `firebase/firestore.rules`
- Stockage: `firebase/storage.rules` (refus total)
- Règles recommandées: `firebase/storage.rules.recommended`
- Domaine autorisé: ajouter `YOUR_USERNAME.github.io` (Firebase Auth → Settings → Authorized domains)

### Déploiement GitHub Pages
- Push sur `main`; workflow `deploy.yml` construit et publie.
- CI `ci.yml` exécute lint + tests.
- Adapter `VITE_BASE_PATH` si le nom du dépôt change.

### Flags / UX
- Téléversements désactivés: fournir une référence texte, message d’avertissement.
- Activer après validation des règles: `VITE_ENABLE_UPLOADS=true`.
- i18n prêt (EN/ES/FR) avec sélecteur.

### Commandes
- `npm run dev`, `npm run lint`, `npm run test`, `npm run test:rules`, `npm run build`
