# Changelog

## 2026-01-22

- Added multilingual (EN/ES/FR) copy, language switcher, and i18n context; updated landing/auth flows accordingly.
- Implemented customer flows: KYC submission, collateral registry, loan simulation/request, contract acknowledgement, loan list/details, payments with upload-aware UI, loyalty view, and help/FAQ.
- Implemented admin flows: request review with approval/rejection, loan portfolio views, payment confirmation, business settings editor, and audit log viewer.
- Hardened auth guard to block inactive users; normalized credentials handling; added Firestore helper layer with safe converters and money calculations.
- Expanded Firestore rules tests path fix; added CI workflow plus lint/test gates in deployment pipeline.
- Documented setup/deploy in EN/ES/FR; noted storage deny-all state and feature flags for uploads.
