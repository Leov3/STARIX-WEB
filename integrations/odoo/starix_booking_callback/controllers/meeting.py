"""Private meeting access for confirmed STARIX bookings."""

import base64
import hashlib
import hmac
import json
import logging
import time
from datetime import datetime, timedelta, timezone

from odoo import http
from odoo.http import request
from werkzeug.utils import redirect

_logger = logging.getLogger(__name__)


def _b64(data):
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def _secret():
    return request.env["ir.config_parameter"].sudo().get_str("starix.booking_callback_secret") or ""


def _sign(secret, message):
    return _b64(hmac.new(secret.encode(), message.encode(), hashlib.sha256).digest())


def _json(data, status=200):
    result = request.make_json_response(data, status=status)
    result.headers["Cache-Control"] = "no-store"
    result.headers["Referrer-Policy"] = "no-referrer"
    return result


def _ticket(secret, booking, user, kind="staff-entry", seconds=600):
    body = _b64(json.dumps({"kind": kind, "booking": booking, "user": user, "exp": int(time.time()) + seconds}, separators=(",", ":")).encode())
    return body + "." + _sign(secret, "staff:" + body)


def _verify_ticket(secret, ticket):
    try:
        body, signature = ticket.split(".")
        if not hmac.compare_digest(signature, _sign(secret, "staff:" + body)):
            return None
        data = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)))
        if data.get("kind") not in ("staff-entry", "staff-session") or data.get("exp", 0) <= time.time():
            return None
        if not isinstance(data.get("booking"), int) or not isinstance(data.get("user"), int):
            return None
        return data
    except (ValueError, TypeError, KeyError, UnicodeDecodeError):
        return None


def _is_internal(user):
    return bool(user and user.exists() and user.active and not user.share and user.has_group("base.group_user"))


class StarixMeeting(http.Controller):
    @http.route("/starix/meeting/<int:booking_id>", auth="user", type="http", methods=["GET"])
    def staff_entry(self, booking_id, **kwargs):
        user = request.env.user
        booking = request.env["resource.booking"].sudo().browse(booking_id).exists()
        lead = request.env["crm.lead"].sudo().search([("x_gap_booking_id", "=", str(booking_id))], limit=1)
        secret = _secret()
        if not _is_internal(user) or not secret or not booking or not lead or booking.state != "confirmed" or not booking.active:
            return request.not_found()
        ticket = _ticket(secret, booking.id, user.id)
        response = redirect("https://starix.tech/api/jitsi/staff-entry?ticket=" + ticket, code=303)
        response.headers["Cache-Control"] = "no-store"
        response.headers["Referrer-Policy"] = "no-referrer"
        return response

    @http.route("/starix/api/meeting/access", auth="public", type="http", methods=["POST"], csrf=False)
    def access(self, **kwargs):
        secret = _secret()
        supplied = request.httprequest.headers.get("x-starix-booking-secret", "")
        if not secret or not hmac.compare_digest(secret, supplied):
            return _json({"ok": False, "error": "unauthorized"}, 401)
        try:
            body = json.loads(request.httprequest.get_data(as_text=True))
        except (TypeError, ValueError):
            return _json({"ok": False, "error": "invalid_json"}, 400)
        if not isinstance(body, dict):
            return _json({"ok": False, "error": "invalid_json"}, 400)
        role = None
        user = None
        if isinstance(body.get("clientCode"), str):
            try:
                raw_id, signature = body["clientCode"].split(".")
                if not raw_id.isdigit() or len(raw_id) > 12:
                    raise ValueError("invalid id")
                booking = request.env["resource.booking"].sudo().browse(int(raw_id)).exists()
                if not booking or not booking.access_token:
                    raise ValueError("booking missing")
                expected = _sign(secret, f"client:{booking.id}:{booking.access_token}")
                if not hmac.compare_digest(signature, expected):
                    raise ValueError("invalid signature")
                role = "client"
            except (ValueError, TypeError):
                return _json({"ok": False, "error": "invalid_access"}, 401)
        elif isinstance(body.get("staffTicket"), str):
            claims = _verify_ticket(secret, body["staffTicket"])
            if not claims:
                return _json({"ok": False, "error": "invalid_access"}, 401)
            booking = request.env["resource.booking"].sudo().browse(claims["booking"]).exists()
            user = request.env["res.users"].sudo().browse(claims["user"]).exists()
            if not _is_internal(user):
                return _json({"ok": False, "error": "invalid_access"}, 401)
            role = "staff"
        else:
            return _json({"ok": False, "error": "invalid_access"}, 401)

        lead = request.env["crm.lead"].sudo().search([("x_gap_booking_id", "=", str(booking.id))], limit=1) if booking else None
        if not booking or not lead or not booking.active or booking.state != "confirmed" or not booking.start:
            return _json({"ok": False, "error": "meeting_unavailable"}, 409)
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        if now > booking.start + timedelta(hours=booking.duration + 1):
            return _json({"ok": False, "error": "meeting_expired"}, 409)
        room = "Starix" + hmac.new(secret.encode(), f"room:{booking.id}:{booking.access_token}".encode(), hashlib.sha256).hexdigest()[:32]
        return _json({
            "ok": True, "role": role, "room": room,
            "scheduledAt": booking.start.replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z"),
            "contactName": (lead.contact_name or lead.partner_id.name or "").strip(),
            "staffName": user.name if role == "staff" else None,
        })
