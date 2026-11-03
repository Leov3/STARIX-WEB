# Jitsi STARIX

La instalación de Jitsi está en `/opt/jitsi-docker` del servidor. `web`,
`prosody`, `jicofo` y `jvb` forman el servicio. El contenedor `web` se crea con
`docker compose up -d web` desde ese directorio y tiene política de reinicio
`unless-stopped`.

`meet-traefik.yaml` es la ruta pública de `meet.starix.tech`. Se instala en
`/etc/easypanel/traefik/config/meet-starix.yaml`, que Traefik observa sin
reinicio. Apunta al nombre del contenedor web de esta instalación,
`desarrollo_jitsi_undefined`, en la red `easypanel`.

Comprobar `https://meet.starix.tech/`, `/config.js` y `/http-bind` tras cambios.

El ensayo aislado se prepara en `/opt/jitsi-starix-stage` con `prepare-stage.py`:
ejecutar el script en el servidor y después `docker compose -p starix-jitsi-stage
up -d` desde ese directorio. Su web escucha solo en `127.0.0.1:18443` y usa un
certificado local. Para comprobar audio y video, ejecutar `scripts/jitsi-smoke.cjs`
en el contenedor de Playwright con dos dispositivos simulados.
