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

## Fase 4 — Reserva y lanzamiento · 2026-11-03 · Completada

- Publicación web: GitHub `main` en `9335f93`; imagen `starix-jitsi-release:9335f93` desplegada en el servicio `desarrollo_starix`. `/agenda` muestra el enlace privado al confirmar una reserva y al volver a una reserva existente; permite copiarlo. `/reunion` usa ese acceso temporal para entrar a la sala de espera.
- Publicación Jitsi: autenticación JWT y lobby activados en `/opt/jitsi-docker`; secreto de producción guardado solo en el servidor, con permisos `600`. Respaldo de `.env`: `/root/starix-backups/jitsi-prod-prelaunch.env` (SHA-256 `7a69055f15ef01c8c07370ea798292f45c9bf7ef6fcf622e0f0a580e5f958673`). Respaldo de la especificación web: `/root/starix-backups/starix-web-service-prelaunch.json`. El servicio Odoo mantiene el addon `starix_booking_callback` actualizado a `20.0.1.3.1`.
- Corrección descubierta en la prueba real: Odoo marca la reserva nueva como `scheduled`; la API anterior exigía `confirmed` y rechazaba el enlace. Las rutas de agenda y de acceso a reunión aceptan `scheduled` y `confirmed`, y siguen verificando titular, token y fecha.
- Prueba de punta a punta: la API pública devolvió 113 horarios para el mes probado; confirmó una reserva de ensayo, creó la reunión y movió la oportunidad a «Videollamada agendada». En escritorio y móvil, `/agenda` mostró y copió el mismo enlace privado sin desbordamiento ni errores de página. La API negó un código alterado, emitió roles `member` y `owner` para la misma sala y el cliente esperó hasta que el colaborador lo admitió. Se comprobaron ambos órdenes de llegada y que el cliente no tiene controles de moderación. Sin token, Jitsi exige autenticación.
- Odoo: el botón «Entrar a videollamada STARIX» de la oportunidad genera la ruta interna `/starix/meeting/<id>`. Las reservas y oportunidades sintéticas usadas en fases 3 y 4, junto con el evento de calendario de prueba, fueron retiradas y se verificó su ausencia.
- Reversión preparada: `integrations/jitsi/rollback-prod.sh` restaura el `.env` y configuración Jitsi; `integrations/jitsi/rollback-web-prod.py` restaura imagen y variables del servicio web. El respaldo del addon y la base de datos de Odoo figuran en fase 3. No se ejecutó la reversión porque las pruebas pasaron.
- Persistencia operativa: `JITSI_APP_SECRET`, `JITSI_APP_ID` y `JITSI_MEET_DOMAIN` están en la especificación activa de Docker Swarm, añadidas por `integrations/jitsi/deploy-web-prod.py`. Antes de un nuevo despliegue desde EasyPanel hay que registrar esas variables en el entorno de la app allí o volver a aplicar el script; no se ha comprobado que EasyPanel haya importado los cambios de Swarm. El secreto nunca debe entrar en Git.
- Límite: audio y video se verificaron con dispositivos simulados; queda una llamada humana de aceptación. El correo con el enlace una hora antes permanece fuera de alcance, según la decisión del plan.
- Commit de implementación y pruebas: `9335f93` y `d0b7b96`. Registro: este archivo.

## Corrección de reserva con contacto · 2026-11-03

- Síntoma: al pulsar «Confirmar videollamada», la agenda volvía al selector. Odoo devolvía `409 slot_taken` aunque había ofrecido el horario; la web borraba el aviso durante la recarga.
- Causa comprobada: con un contacto en la reserva, la confirmación de asistencia del módulo gratuito de Odoo provocaba una nueva validación que interpretaba el evento recién creado como un conflicto. Se reprodujo con una reserva sintética con contacto. La misma reserva sin contacto se confirmaba.
- Ajuste: el flujo STARIX conserva el evento creado al asignar la fecha y evita esa aceptación automática de asistencia en la ruta de agenda. Registra la actividad «Preparar videollamada STARIX» en la misma transacción y envía el aviso a n8n después de guardar la reserva. El formulario conserva el mensaje si Odoo rechaza un horario y vuelve a cargar disponibilidad.
- Prueba: una reserva sintética con contacto confirmó por la API pública un horario distinto del primero; Odoo quedó en estado `scheduled`, vinculó el evento y movió la oportunidad a «Videollamada agendada». Se verificó la actividad de preparación. La reserva, la oportunidad, el evento y el contacto de ensayo se retiraron y se verificó su ausencia.
- Límite: queda comprobar el clic en un navegador de un visitante real después de publicar el frontend. Los registros de producción permiten distinguir un horario ocupado de un fallo de calendario sin exponer el token del cliente.
