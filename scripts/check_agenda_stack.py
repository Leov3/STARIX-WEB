"""Read-only STARIX agenda check with an existing qualified Odoo lead."""

import requests
from datetime import datetime

leads = env["crm.lead"].sudo().search([
    ("x_gap_token", "!=", False),
    ("x_gap_qualification", "in", ["HIGH_PRIORITY", "MEDIUM_PRIORITY"]),
], limit=100)
eligible = leads.filtered(
    lambda lead: lead.x_gap_booking_id
    and str(lead.x_gap_booking_id).isdigit()
    and env["resource.booking"].sudo().browse(int(lead.x_gap_booking_id)).exists()
)
print(f"qualified_leads={len(leads)} linked_bookings={len(eligible)}")
if eligible:
    lead = eligible[0]
    booking = env["resource.booking"].sudo().browse(int(lead.x_gap_booking_id))
    print(f"linked_booking_state={booking.state}")
    secret = env["ir.config_parameter"].sudo().get_str("starix.booking_callback_secret")
    lookup = requests.post(
        "http://localhost:8069/starix/api/agenda/session",
        json={"token": lead.x_gap_token},
        headers={"x-starix-booking-secret": secret}, timeout=15,
    )
    print(f"odoo_lookup_http={lookup.status_code} ok={lookup.json().get('ok')} booking_matches={lookup.json().get('bookingId') == booking.id}")
    month = datetime.now().strftime("%Y-%m")
    before = env["resource.booking"].sudo().search_count([])
    response = requests.post(
        "https://starix.tech/api/agenda/slots",
        json={"month": month},
        headers={"x-starix-gap-token": lead.x_gap_token}, timeout=30,
    )
    data = response.json()
    print(f"stack_http={response.status_code} ok={data.get('ok')} status={data.get('status')} slot_count={len(data.get('slots', []))} error={data.get('error')}")
    env.invalidate_all()
    after = env["resource.booking"].sudo().search_count([])
    print(f"bookings_before={before} bookings_after={after}")
    invalid = requests.post(
        "https://starix.tech/api/agenda/confirm",
        json={"when": "1900-01-01T12:00:00-05:00"},
        headers={"x-starix-gap-token": lead.x_gap_token}, timeout=30,
    )
    try:
        invalid_error = invalid.json().get("error")
    except ValueError:
        invalid_error = "non_json_response"
    print(f"invalid_stack_confirm_http={invalid.status_code} content_type={invalid.headers.get('Content-Type')} error={invalid_error}")
