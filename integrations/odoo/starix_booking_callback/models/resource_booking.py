import logging
import requests
from functools import partial

from odoo import models

_logger = logging.getLogger(__name__)


def _send_booking_callback(url, secret, booking_id, scheduled_at):
    try:
        response = requests.post(
            url,
            json={"bookingId": str(booking_id), "scheduledAt": scheduled_at},
            headers={"x-starix-booking-secret": secret},
            timeout=8,
        )
        response.raise_for_status()
    except Exception:
        _logger.exception("STARIX booking callback failed for booking %s", booking_id)


class ResourceBooking(models.Model):
    _inherit = "resource.booking"

    def _queue_starix_callback(self):
        params = self.env["ir.config_parameter"].sudo()
        url = params.get_str("starix.booking_callback_url")
        secret = params.get_str("starix.booking_callback_secret")
        if not url or not secret:
            return
        for booking in self.filtered("start"):
            scheduled_at = booking.start.strftime("%Y-%m-%dT%H:%M:%S")
            self.env.cr.postcommit.add(partial(
                _send_booking_callback, url, secret, booking.id, scheduled_at
            ))

    def action_confirm(self):
        # The Odoo 20 booking addon sees its own newly accepted attendee as a
        # calendar conflict. STARIX already created the event when start was set.
        result = True if self.env.context.get("starix_skip_attendance_confirmation") else super().action_confirm()
        activity_model = self.env["ir.model"]._get("crm.lead")
        for booking in self.filtered("start"):
            lead = self.env["crm.lead"].sudo().search(
                [("x_gap_booking_id", "=", str(booking.id))], limit=1
            )
            if lead:
                activity_exists = self.env["mail.activity"].sudo().search_count([
                    ("res_model_id", "=", activity_model.id),
                    ("res_id", "=", lead.id),
                    ("summary", "=", "Preparar videollamada STARIX"),
                ])
                if not activity_exists:
                    self.env["mail.activity"].sudo().create({
                        "activity_type_id": 4,
                        "res_model_id": activity_model.id,
                        "res_id": lead.id,
                        "user_id": 5,
                        "date_deadline": booking.start.date(),
                        "summary": "Preparar videollamada STARIX",
                        "note": "Reserva confirmada. Revisar diagnóstico antes de la videollamada.",
                    })
        if not self.env.context.get("starix_skip_attendance_confirmation"):
            self._queue_starix_callback()
        return result
