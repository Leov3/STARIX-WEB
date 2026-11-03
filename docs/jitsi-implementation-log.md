# Registro de implementación de Jitsi STARIX

## Fase 1 — Base y prueba real · 2026-11-03 · Completada

- Estado inicial: Jitsi `stable-9823` con `web`, `prosody`, `jicofo` y `jvb` activos; autenticación desactivada. La ruta pública `meet.starix.tech` responde.
- Respaldo en el servidor: `/root/starix-backups/jitsi-before-starix-20261103.tar.gz` (permiso `600`, SHA-256 `377e6cdb7b464948ed7edae4f0b8ae258765e2dd7d63320b3a162eb66808863d`). Contiene Compose, configuración de Jitsi y ruta Traefik; no se subió a Git.
- Ensayo aislado: `/opt/jitsi-starix-stage`, Compose `starix-jitsi-stage`, web en `127.0.0.1:18443` con certificado local, JVB en UDP `10001`. No comparte Prosody, Jicofo ni JVB con producción.
- Prueba automatizada: dos navegadores Chromium con cámara y micrófono simulados entraron en la misma sala. En producción y ensayo ambos vieron al otro y hubo paquetes RTP de audio y video recibidos y enviados en ambas direcciones. Script: `scripts/jitsi-smoke.cjs`.
- Límite de la prueba: comprueba transporte WebRTC con dispositivos simulados; no sustituye la comprobación perceptiva de una llamada humana.
- Reversión de esta fase: detener el ensayo con `docker compose -p starix-jitsi-stage -f /opt/jitsi-starix-stage/docker-compose.yml down`. Producción no se modificó en esta fase. El respaldo se conserva para fases posteriores.
- Pendiente para fase 2: interfaz STARIX y personalización persistente de Jitsi en ensayo antes de producción.
