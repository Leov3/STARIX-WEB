# Registro de implementación de Jitsi STARIX

## Fase 1 — Base y prueba real · 2026-11-03 · Completada

- Estado inicial: Jitsi `stable-9823` con `web`, `prosody`, `jicofo` y `jvb` activos; autenticación desactivada. La ruta pública `meet.starix.tech` responde.
- Respaldo en el servidor: `/root/starix-backups/jitsi-before-starix-20261103.tar.gz` (permiso `600`, SHA-256 `377e6cdb7b464948ed7edae4f0b8ae258765e2dd7d63320b3a162eb66808863d`). Contiene Compose, configuración de Jitsi y ruta Traefik; no se subió a Git.
- Ensayo aislado: `/opt/jitsi-starix-stage`, Compose `starix-jitsi-stage`, web en `127.0.0.1:18443` con certificado local, JVB en UDP `10001`. No comparte Prosody, Jicofo ni JVB con producción.
- Prueba automatizada: dos navegadores Chromium con cámara y micrófono simulados entraron en la misma sala. En producción y ensayo ambos vieron al otro y hubo paquetes RTP de audio y video recibidos y enviados en ambas direcciones. Script: `scripts/jitsi-smoke.cjs`.
- Límite de la prueba: comprueba transporte WebRTC con dispositivos simulados; no sustituye la comprobación perceptiva de una llamada humana.
- Reversión de esta fase: detener el ensayo con `docker compose -p starix-jitsi-stage -f /opt/jitsi-starix-stage/docker-compose.yml down`. Producción no se modificó en esta fase. El respaldo se conserva para fases posteriores.
- Pendiente para fase 2: interfaz STARIX y personalización persistente de Jitsi en ensayo antes de producción.
- Commit de fase 1: `6fd0e19`.

## Fase 2 — Interfaz STARIX · 2026-11-03 · Completada en ensayo

- Commit de implementación: `7b121f3`.
- Se añadió `/reunion` con entrada, prueba opcional de cámara y micrófono, llamada integrada, estado de conexión y cierre. El acceso normal muestra una invitación privada requerida; `?preview=1` permite revisar el diseño con datos ficticios. La sesión real se conectará en la fase 3.
- Se preparó la configuración persistente de Jitsi en `integrations/jitsi/custom-config.js` y `custom-interface_config.js`: idioma español, nombre STARIX, fondo oscuro, logo y tema dorado mediante `/api/jitsi/branding`.
- Pruebas: `next build` completó sin errores. Capturas de Chromium a 1440×900 y tamaño iPhone 13 confirmaron encabezados, controles, márgenes y ausencia de desbordamiento horizontal. Jitsi de ensayo consultó `branding.json` con HTTP 200 y mostró el botón dorado y textos en español.
- Resultado: interfaz validada en el contenedor web de ensayo; Jitsi y web públicos conservan su versión anterior hasta el lanzamiento de la fase 4.
- Reversión: retirar los archivos `custom-config.js` y `custom-interface_config.js` del ensayo y recrear solo su contenedor `web`; los cambios web aún no se publicaron.
- Pendiente para fase 3: acceso temporal vinculado a reservas, autenticación de colaboradores activos en Odoo y prueba de moderación y espera.

## Fase 3 — Identidades y permisos · 2026-11-03 · Completada en ensayo

- Commit de implementación: `85fcf46`.
- Respaldo previo de Odoo: `/root/starix-backups/odoo-before-jitsi-20261103.dump` (SHA-256 `5076073071e207e72444761e6d73d26271fcc96ad137a602fc489bff28f45c44`) y `/root/starix-backups/starix-booking-callback-before-jitsi-20261103.tar.gz` (SHA-256 `9d721bd313a69218275e0b159872f77db68d882a5f2c9993a5f6cddc86a46314`), ambos con permisos `600`.
- Se amplió el módulo Odoo para emitir un acceso corto solo a usuarios internos activos y mostrar “Entrar a videollamada STARIX” en la oportunidad con reserva. El módulo `20.0.1.3.0` se actualizó y reinició en producción; la web pública aún no emite enlaces de reunión.
- El cliente recibe un código opaco derivado de la reserva; Odoo valida la reserva confirmada y caducidad. Next emite JWT distintos: `member` para cliente y `owner` para colaborador. El secreto de prueba reside solo en el servidor.
- El Jitsi de ensayo usa una sala de espera automática. Su versión del módulo de lobby esperaba `create-lobby-room`, mientras el módulo contrib emitía un nombre antiguo; `mod_starix_lobby.lua` resuelve la incompatibilidad.
- Pruebas: ambos órdenes de llegada; cliente en espera, colaborador admite, segundo cliente solo visible en controles del colaborador. `scripts/jitsi-roles-smoke.cjs` pasó. En el frontend integrado, `scripts/jitsi-wrapper-smoke.cjs` confirmó entrada, espera y admisión sin errores de página. `scripts/jitsi-preview-e2e.py` confirmó código válido, rechazo de código alterado, misma sala y roles correctos; también probó el intercambio del ticket interno por cookie de sesión.
- Límite: la reserva sintética usada para la prueba no generó invitación de calendario ni correo; se creó solo para validar acceso. Se retirará al cerrar la fase 4.
- Reversión: restaurar el respaldo del addon Odoo y actualizarlo, retirar el módulo de lobby del ensayo; la web pública y el Jitsi público aún conservan su configuración previa.
- Pendiente para fase 4: mostrar el enlace al confirmar una reserva real, publicar la web y Jitsi con secretos de producción, verificar el recorrido y limpiar la reserva sintética.
