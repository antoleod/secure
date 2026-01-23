# Política de Seguridad y Gestión de Secretos

## Reporte de vulnerabilidades
- No abras issues públicos para incidentes de seguridad.
- Envía un correo a `security@oryxen.tech` con: descripción, pasos para reproducir, impacto y cualquier log relevante sin credenciales.
- Incluye un medio de contacto para coordinar el seguimiento.

### Flujo de respuesta
1) Acuse de recibo ≤ 2 días hábiles.
2) Análisis y mitigación priorizada según impacto.
3) Comunicación de estado y ventana estimada de parche.
4) Publicación del fix y verificación de que los secretos comprometidos fueron rotados.

## Manejo de secretos
- Nunca commitear `.env` ni credenciales reales. Usa `.env.example` como plantilla.
- Mantén las claves de Firebase restringidas por origen (HTTP referrers) y reglas en Firestore/Storage.
- Habilita App Check antes de permitir cargas (`VITE_ENABLE_UPLOADS=true`).
- Regenera y revoca cualquier credencial que haya sido expuesta.

## Controles preventivos
- **Pre-commit**: instala `pre-commit` y ejecuta `pre-commit install` para habilitar el hook de `gitleaks` definido en `.pre-commit-config.yaml`.
- **Secret scanning**: activa GitHub Advanced Security / secret scanning (o ejecuta gitleaks en CI si no está disponible).
- **Revisiones**: aplica branch protection y revisiones obligatorias para cambios en workflows, reglas de Firestore/Storage y archivos de configuración.

## En caso de exposición de credenciales
1) Remueve los archivos sensibles y actualiza `.gitignore`.
2) Purga el historial con `git filter-repo` o BFG (ver instrucciones en README o playbook interno).
3) Rota las credenciales afectadas (Firebase/GCP y GitHub) y limita el alcance de las nuevas.
4) Ejecuta `gitleaks detect --redact --source .` para confirmar que no quedan secretos.
