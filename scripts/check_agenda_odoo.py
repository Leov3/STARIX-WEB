"""Run with `odoo shell` to check STARIX availability without changing bookings."""

import requests

bookings = env["resource.booking"].sudo().search(
    [("state", "=", "pending"), ("active", "=", True), ("access_token", "!=", False)], limit=10
)
print(f"pending_bookings={len(bookings)}")
if bookings:
    booking = bookings[0]
    secret = env["ir.config_parameter"].sudo().get_str("starix.booking_callback_secret")
    month = env["ir.config_parameter"].sudo().get_str("starix.agenda_test_month")
    if not month:
        from datetime import datetime

        month = datetime.now().strftime("%Y-%m")
    response = requests.post(
        f"http://localhost:8069/starix/api/bookings/{booking.id}/slots",
        json={"access_token": booking.access_token, "month": month},
        headers={"x-starix-booking-secret": secret}, timeout=20,
    )
    result = response.json()
    print(f"slots_http={response.status_code} status={result.get('status')} count={len(result.get('slots', []))} error={result.get('error')}")
    invalid = requests.post(
        f"http://localhost:8069/starix/api/bookings/{booking.id}/confirm",
        json={"access_token": booking.access_token, "when": "1900-01-01T12:00:00-05:00"},
        headers={"x-starix-booking-secret": secret}, timeout=20,
    )
    print(f"invalid_confirm_http={invalid.status_code} error={invalid.json().get('error')}")
