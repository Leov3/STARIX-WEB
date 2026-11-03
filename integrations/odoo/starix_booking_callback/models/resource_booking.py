import logging
import requests

from odoo import models

_logger = logging.getLogger(__name__)


class ResourceBooking(models.Model):
    _inherit = "resource.booking"

    def action_confirm(self):
        result = super().action_confirm()
        params = self.env["ir.config_parameter"].sudo()
        url = params.get_str("starix.booking_callback_url")
        secret = params.get_str("starix.booking_callback_secret")
        if not url or not secret:
            return result

        for booking in self:
            try:
                response = requests.post(
                    url,
                    json={
                        "bookingId": str(booking.id),
                        "scheduledAt": booking.start.strftime("%Y-%m-%dT%H:%M:%S") if booking.start else None,
                    },
                    headers={"x-starix-booking-secret": secret},
                    timeout=8,
                )
                response.raise_for_status()

                lead = self.env["crm.lead"].sudo().search(
                    [("x_gap_booking_id", "=", str(booking.id))], limit=1
                )
                activity_model = self.env["ir.model"]._get("crm.lead")
                activity_exists = self.env["mail.activity"].sudo().search_count([
                    ("res_model_id", "=", activity_model.id),
                    ("res_id", "=", lead.id),
                    ("summary", "=", "Preparar videollamada STARIX"),
                ])
                if lead and not activity_exists:
                    self.env["mail.activity"].sudo().create({
                        "activity_type_id": 4,
                        "res_model_id": activity_model.id,
                        "res_id": lead.id,
                        "user_id": 5,
                        "date_deadline": booking.start.date() if booking.start else self.env.cr.now().date(),
                        "summary": "Preparar videollamada STARIX",
                        "note": "Reserva confirmada. Revisar diagnóstico antes de la videollamada.",
                    })
            except Exception:
                _logger.exception("STARIX booking callback failed for booking %s", booking.id)
        return result