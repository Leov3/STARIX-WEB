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
