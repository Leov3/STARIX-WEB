# Adaptador de agenda STARIX para Odoo

`starix_booking_callback` refleja el módulo instalado en el servidor de Odoo. Los
controladores `controllers/agenda.py` exponen disponibilidad y confirmación para
la agenda de STARIX sin enviar el enlace de acceso de Odoo al navegador.

- El servidor STARIX consulta el lead en Odoo por el token del Diagnóstico y
  obtiene la reserva ya vinculada, sin volver a ejecutar el flujo de n8n.
- Odoo exige el token de esa reserva y el secreto compartido
  `starix.booking_callback_secret`, que corresponde a `BOOKING_WEBHOOK_SECRET`
  en STARIX.
- La confirmación vuelve a calcular disponibilidad dentro de una transacción y
  utiliza `resource.booking.action_confirm()`, conservando el callback al CRM.
- El módulo está montado en `/mnt/extra-addons` desde
  `/etc/easypanel/custom-addons/odoo`; los cambios de Python requieren reiniciar
  `desarrollo_odoo`.

No incluir valores de secretos ni enlaces con `access_token` en el repositorio.
