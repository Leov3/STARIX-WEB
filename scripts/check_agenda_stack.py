"""Read-only STARIX agenda check with an existing qualified Odoo lead."""

import requests
from datetime import datetime

leads = env["crm.lead"].sudo().search([
    ("x_gap_token", "!=", False),
    ("x_gap_qualification", "in", ["HIGH_PRIORITY", "MEDIUM_PRIORITY"]),
], limit=100)
eligible = leads.filtered(lambda lead: lead.x_gap_booking_id and lead.x_gap_booking_id.state == "pending")
print(f"qualified_leads={len(leads)} pending_qualified_bookings={len(eligible)}")
if eligible:
    lead = eligible[0]
    month = datetime.now().strftime("%Y-%m")
    response = requests.post(
        "https://starix.tech/api/agenda/slots",
        json={"month": month},
        headers={"x-starix-gap-token": lead.x_gap_token}, timeout=30,
    )
    data = response.json()
    print(f"stack_http={response.status_code} ok={data.get('ok')} slot_count={len(data.get('slots', []))} error={data.get('error')}")
