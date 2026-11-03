# Adaptador de agenda STARIX para Odoo

`starix_booking_callback` refleja el módulo instalado en el servidor de Odoo. Los
controladores `controllers/agenda.py` exponen disponibilidad y confirmación para
la agenda de STARIX sin enviar el enlace de acceso de Odoo al navegador.

- El servidor STARIX valida el token del Diagnóstico con n8n y obtiene el enlace
  de reserva internamente.
- Odoo exige el token de esa reserva y el secreto compartido
  `starix.booking_callback_secret`, que corresponde a `BOOKING_WEBHOOK_SECRET`
  en STARIX.
- La confirmación vuelve a calcular disponibilidad dentro de una transacción y
  utiliza `resource.booking.action_confirm()`, conservando el callback al CRM.
- El módulo está montado en `/mnt/extra-addons` desde
  `/etc/easypanel/custom-addons/odoo`; los cambios de Python requieren reiniciar
  `desarrollo_odoo`.

No incluir valores de secretos ni enlaces con `access_token` en el repositorio.
