"""Server-to-server availability and confirmation for the STARIX agenda."""

import json
import logging
import re
from datetime import timedelta, timezone
from hmac import compare_digest

from dateutil.parser import isoparse
from dateutil.relativedelta import relativedelta

from odoo import fields, http
from odoo.addons.resource_booking.controllers.portal import CustomerPortal
from odoo.exceptions import AccessError, MissingError, ValidationError
from odoo.http import request

_logger = logging.getLogger(__name__)
_MONTH = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")
_LOCK_NAMESPACE = 813771
_TIMEZONE = "America/Bogota"


def _json(data, status=200):
    response = request.make_json_response(data, status=status)
    response.headers["Cache-Control"] = "no-store"
    return response


def _body():
    try:
        value = json.loads(request.httprequest.get_data(as_text=True))
    except (TypeError, ValueError):
        return None
    return value if isinstance(value, dict) else None


def _month_start(booking, value):
    if not isinstance(value, str) or not _MONTH.fullmatch(value):
        return None
    year, month = map(int, value.split("-"))
    now = fields.Datetime.context_timestamp(booking, fields.Datetime.now())
    first = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    try:
        requested = first.replace(year=year, month=month)
    except ValueError:
        return None
    if requested < first or requested >= first + relativedelta(months=6):
        return None
    return requested


def _available_slots(booking, start):
    end = start + relativedelta(months=1) + timedelta(hours=booking.duration)
    slots = booking._get_available_slots(start, end)
    return sorted(
        slot
        for day, day_slots in slots.items()
        if day.year == start.year and day.month == start.month
        for slot in day_slots
    )


def _scheduled_at(booking):
    return booking.start.replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")


class StarixAgendaApi(http.Controller):
    @http.route(
        "/starix/api/agenda/session",
        auth="public", type="http", methods=["POST"], csrf=False,
    )
    def session(self, **kwargs):
        body = _body()
        if body is None:
            return _json({"ok": False, "error": "invalid_json"}, 400)
        secret = request.env["ir.config_parameter"].sudo().get_str(
            "starix.booking_callback_secret"
        )
        supplied = request.httprequest.headers.get("x-starix-booking-secret", "")
        if not secret or not compare_digest(secret, supplied):
            return _json({"ok": False, "error": "unauthorized"}, 401)
        token = body.get("token")
        if not isinstance(token, str) or not re.fullmatch(r"[A-Za-z0-9_-]{32,512}", token):
            return _json({"ok": False, "error": "invalid_token"}, 401)
        leads = request.env["crm.lead"].sudo().search(
            [("x_gap_token", "=", token)], limit=2
        )
        if len(leads) != 1 or leads.x_gap_qualification not in (
            "HIGH_PRIORITY", "MEDIUM_PRIORITY"
        ):
            return _json({"ok": False, "error": "booking_unavailable"}, 409)
        booking_id = str(leads.x_gap_booking_id or "")
        if not booking_id.isdigit():
            return _json({"ok": False, "error": "booking_unavailable"}, 409)
        booking = request.env["resource.booking"].sudo().browse(int(booking_id)).exists()
        if not booking or not booking.active or booking.state not in ("pending", "scheduled", "confirmed"):
            return _json({"ok": False, "error": "booking_unavailable"}, 409)
        if not booking.access_token:
            return _json({"ok": False, "error": "booking_unavailable"}, 409)
        return _json({
            "ok": True, "bookingId": booking.id,
            "accessToken": booking.access_token,
            "contactName": (leads.contact_name or leads.partner_id.name or "").strip(),
        })

    def _authorized_booking(self, booking_id, body):
        secret = request.env["ir.config_parameter"].sudo().get_str(
            "starix.booking_callback_secret"
        )
        supplied = request.httprequest.headers.get("x-starix-booking-secret", "")
        if not secret or not compare_digest(secret, supplied):
            return None, _json({"ok": False, "error": "unauthorized"}, 401)
        token = body.get("access_token")
        if not isinstance(token, str) or not token:
            return None, _json({"ok": False, "error": "invalid_token"}, 401)
        try:
            booking = CustomerPortal()._get_booking_sudo(booking_id, token)
        except (AccessError, MissingError):
            return None, _json({"ok": False, "error": "invalid_token"}, 401)
        return booking.with_context(using_portal=True, tz=_TIMEZONE), None

    @http.route(
        "/starix/api/bookings/<int:booking_id>/slots",
        auth="public", type="http", methods=["POST"], csrf=False,
    )
    def slots(self, booking_id, **kwargs):
        body = _body()
        if body is None:
            return _json({"ok": False, "error": "invalid_json"}, 400)
        booking, error = self._authorized_booking(booking_id, body)
        if error:
            return error
        if booking.state in ("scheduled", "confirmed"):
            return _json({
                "ok": True, "status": "confirmed", "timezone": _TIMEZONE,
                "scheduledAt": _scheduled_at(booking),
                "durationMinutes": round(booking.duration * 60),
            })
        if not booking.active or booking.state != "pending":
            return _json({"ok": False, "error": "booking_unavailable"}, 409)
        start = _month_start(booking, body.get("month"))
        if start is None:
            return _json({"ok": False, "error": "invalid_month"}, 400)
        return _json({
            "ok": True, "status": "pending", "timezone": _TIMEZONE,
            "durationMinutes": round(booking.duration * 60),
            "slots": [slot.isoformat() for slot in _available_slots(booking, start)],
        })

    @http.route(
        "/starix/api/bookings/<int:booking_id>/confirm",
        auth="public", type="http", methods=["POST"], csrf=False,
    )
    def confirm(self, booking_id, **kwargs):
        body = _body()
        if body is None:
            return _json({"ok": False, "error": "invalid_json"}, 400)
        booking, error = self._authorized_booking(booking_id, body)
        if error:
            return error
        if booking.state in ("scheduled", "confirmed"):
            return _json({
                "ok": True, "status": "confirmed",
                "scheduledAt": _scheduled_at(booking),
                "durationMinutes": round(booking.duration * 60),
            })
        if not booking.active or booking.state != "pending":
            return _json({"ok": False, "error": "booking_unavailable"}, 409)
        try:
            when = isoparse(body.get("when", ""))
            if when.tzinfo is None:
                raise ValueError("timezone required")
            when_utc = when.astimezone(timezone.utc)
            when_local = fields.Datetime.context_timestamp(
                booking, when_utc.replace(tzinfo=None)
            )
            start = _month_start(booking, when_local.strftime("%Y-%m"))
        except (TypeError, ValueError, OverflowError):
            return _json({"ok": False, "error": "invalid_slot"}, 400)
        if start is None:
            return _json({"ok": False, "error": "invalid_slot"}, 400)
        # Serialize reservations for this booking type before checking the slot.
        request.env.cr.execute(
            "SELECT pg_advisory_xact_lock(%s, %s)",
            (_LOCK_NAMESPACE, booking.type_id.id),
        )
        booking.invalidate_recordset(["state", "start"])
        if booking.state != "pending":
            return _json({"ok": False, "error": "booking_unavailable"}, 409)
        if not any(slot.astimezone(timezone.utc) == when_utc for slot in _available_slots(booking, start)):
            return _json({"ok": False, "error": "slot_taken"}, 409)
        try:
            with request.env.cr.savepoint():
                booking.start = when_utc.replace(tzinfo=None)
                booking.action_confirm()
        except ValidationError:
            return _json({"ok": False, "error": "slot_taken"}, 409)
        except Exception:
            _logger.exception("STARIX agenda could not confirm booking %s", booking_id)
            return _json({"ok": False, "error": "booking_failed"}, 502)
        return _json({
            "ok": True, "status": "confirmed",
            "scheduledAt": _scheduled_at(booking),
            "durationMinutes": round(booking.duration * 60),
        })
