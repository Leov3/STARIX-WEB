"""Run with `odoo shell -d starix`; creates a no-email synthetic meeting for E2E tests."""

import json
import secrets
from datetime import datetime, timedelta, timezone

start = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0) + timedelta(days=1, hours=1)
stop = start + timedelta(minutes=30)
booking = env["resource.booking"].sudo().create({
    "type_id": 1,
    "name": "STARIX Jitsi prueba técnica (sin invitado)",
    "duration": 0.5,
    "state": "pending",
    "active": True,
    "access_token": secrets.token_urlsafe(32),
    "user_id": 5,
})
# This fixture tests only private meeting access. Bypass reservation side effects
# so no calendar invitation or email is sent from the production test.
env.cr.execute(
    "UPDATE resource_booking SET state='confirmed', start=%s, stop=%s WHERE id=%s",
    (start.replace(tzinfo=None), stop.replace(tzinfo=None), booking.id),
)
booking.invalidate_recordset(["state", "start", "stop"])
lead = env["crm.lead"].sudo().create({
    "name": "STARIX Jitsi prueba técnica",
    "type": "opportunity",
    "team_id": 4,
    "contact_name": "Prueba Jitsi STARIX",
    "x_gap_token": secrets.token_urlsafe(32),
    "x_gap_booking_id": str(booking.id),
    "x_gap_booking_at": start.replace(tzinfo=None),
})
env.cr.commit()
print(json.dumps({"bookingId": booking.id, "leadId": lead.id, "scheduledAt": start.isoformat()}))
