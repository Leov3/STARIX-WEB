"""Run on STARIX host after the isolated web preview starts; prints no tokens."""

import base64
import hashlib
import hmac
import json
import os
import subprocess
import time
import sys
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import HTTPRedirectHandler, Request, build_opener, urlopen

def command(*args):
    return subprocess.check_output(args, text=True).strip()

web = command("docker", "ps", "-q", "--filter", "name=desarrollo_starix.1")
db = command("docker", "ps", "-q", "--filter", "name=desarrollo_odoo-db.1")
booking_secret = command("docker", "exec", web, "printenv", "BOOKING_WEBHOOK_SECRET")
jitsi_secret = Path("/opt/jitsi-starix-stage/.jwt-secret").read_text().strip()
booking_id = int(os.environ["JITSI_TEST_BOOKING_ID"])
user_id = int(os.environ["JITSI_TEST_USER_ID"])
lead_id = int(os.environ["JITSI_TEST_LEAD_ID"])

env_file = Path("/root/starix-backups/jitsi-web-preview.env")
env_file.write_text(
    f"BOOKING_WEBHOOK_SECRET={booking_secret}\n"
    f"JITSI_APP_SECRET={jitsi_secret}\n"
    "JITSI_APP_ID=starix-stage\n"
    "JITSI_MEET_DOMAIN=127.0.0.1:18443\n"
)
env_file.chmod(0o600)

access_token = command("docker", "exec", db, "psql", "-U", "odoo", "-d", "starix", "-Atc", f"select access_token from resource_booking where id={booking_id}")
def sign(message):
    return base64.urlsafe_b64encode(hmac.new(booking_secret.encode(), message.encode(), hashlib.sha256).digest()).decode().rstrip("=")

client_code = f"{booking_id}." + sign(f"client:{booking_id}:{access_token}")
Path("/root/starix-backups/jitsi-test-client-code").write_text(client_code)
Path("/root/starix-backups/jitsi-test-client-code").chmod(0o600)
if "--prepare" in sys.argv:
    print("Preview environment prepared without exposing credentials")
    raise SystemExit(0)

def request(path, payload, cookie=None):
    headers = {"Content-Type": "application/json"}
    if cookie:
        headers["Cookie"] = cookie
    req = Request("http://127.0.0.1:3102" + path, data=json.dumps(payload).encode(), headers=headers, method="POST")
    try:
        with urlopen(req, timeout=20) as response:
            return response.status, json.load(response)
    except HTTPError as error:
        return error.code, json.load(error)

def agenda_request(path, payload, gap_token):
    req = Request("http://127.0.0.1:3102" + path, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json", "x-starix-gap-token": gap_token}, method="POST")
    try:
        with urlopen(req, timeout=30) as response:
            return response.status, json.load(response)
    except HTTPError as error:
        return error.code, json.load(error)

status, client = request("/api/jitsi/session", {"clientCode": client_code})
assert status == 200 and client.get("role") == "client", (status, client.get("error"))
claims = json.loads(base64.urlsafe_b64decode(client["jwt"].split(".")[1] + "=="))
assert claims["context"]["user"]["affiliation"] == "member"
assert claims["context"]["user"]["moderator"] is False
assert claims["room"] == client["room"]

status, denied = request("/api/jitsi/session", {"clientCode": client_code[:-1] + ("A" if client_code[-1] != "A" else "B")})
assert status == 401 and denied.get("error") == "invalid_access"

entry_body = base64.urlsafe_b64encode(json.dumps({"kind": "staff-entry", "booking": booking_id, "user": user_id, "exp": int(time.time()) + 600}, separators=(",", ":")).encode()).decode().rstrip("=")
entry_ticket = entry_body + "." + sign("staff:" + entry_body)
class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None
try:
    build_opener(NoRedirect).open("http://127.0.0.1:3102/api/jitsi/staff-entry?ticket=" + entry_ticket, timeout=20)
    raise AssertionError("Expected staff entry redirect")
except HTTPError as response:
    assert response.code in (302, 303, 307, 308)
    staff_cookie = response.headers.get("Set-Cookie", "").split(";", 1)[0]
    assert staff_cookie.startswith("starix_meeting_staff=")
status, staff = request("/api/jitsi/session", {}, staff_cookie)
assert status == 200 and staff.get("role") == "staff", (status, staff.get("error"))
staff_claims = json.loads(base64.urlsafe_b64decode(staff["jwt"].split(".")[1] + "=="))
assert staff_claims["room"] == client["room"]
assert staff_claims["context"]["user"]["affiliation"] == "owner"
assert staff_claims["context"]["user"]["moderator"] is True

gap_token = command("docker", "exec", db, "psql", "-U", "odoo", "-d", "starix", "-Atc", f"select x_gap_token from crm_lead where id={lead_id}")
month = time.strftime("%Y-%m", time.gmtime())
status, agenda = agenda_request("/api/agenda/slots", {"month": month}, gap_token)
assert status == 200 and agenda.get("status") == "confirmed", (status, agenda.get("error"))
assert agenda.get("meetingUrl", "").endswith(client_code)
status, confirmed = agenda_request("/api/agenda/confirm", {"when": agenda["scheduledAt"]}, gap_token)
assert status == 200 and confirmed.get("meetingUrl", "").endswith(client_code)

print(json.dumps({"client": "ok", "tampered_client": "denied", "staff": "ok", "same_room": True, "client_moderator": False, "staff_moderator": True, "agenda_link": "ok", "confirmed_link": "ok"}))
