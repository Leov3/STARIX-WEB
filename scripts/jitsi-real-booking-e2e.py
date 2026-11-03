"""Run on STARIX host with JITSI_TEST_LEAD_ID; book a synthetic no-email slot."""

import json
import os
import subprocess
from datetime import datetime
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

lead_id = int(os.environ["JITSI_TEST_LEAD_ID"])
base_url = os.environ.get("STARIX_TEST_URL", "https://starix.tech").rstrip("/")
db = subprocess.check_output(["docker", "ps", "-q", "--filter", "name=desarrollo_odoo-db.1"], text=True).strip()
gap_token = subprocess.check_output(["docker", "exec", db, "psql", "-U", "odoo", "-d", "starix", "-Atc", f"select x_gap_token from crm_lead where id={lead_id}"], text=True).strip()

def post(path, payload):
    req = Request(base_url + path, data=json.dumps(payload).encode(), headers={
        "Content-Type": "application/json", "x-starix-gap-token": gap_token,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36",
        "Origin": base_url, "Referer": base_url + "/agenda",
    }, method="POST")
    try:
        with urlopen(req, timeout=30) as response:
            return response.status, json.load(response)
    except HTTPError as error:
        try:
            return error.code, json.load(error)
        except ValueError:
            return error.code, {"error": "non_json"}

month = datetime.now(ZoneInfo("America/Bogota")).strftime("%Y-%m")
status, data = post("/api/agenda/slots", {"month": month})
if status != 200 or not data.get("ok"):
    raise SystemExit(json.dumps({"step": "slots", "status": status, "error": data.get("error")}))
slots = data.get("slots") or []
print(json.dumps({"step": "slots", "count": len(slots), "first": slots[0] if slots else None}))
if "--confirm" not in os.sys.argv:
    raise SystemExit(0)
if not slots:
    raise SystemExit("no_slots_to_confirm")
status, confirmed = post("/api/agenda/confirm", {"when": slots[0]})
if status != 200 or not confirmed.get("ok") or not confirmed.get("meetingUrl"):
    raise SystemExit(json.dumps({"step": "confirm", "status": status, "error": confirmed.get("error")}))
print(json.dumps({"step": "confirm", "status": confirmed.get("status"), "meetingLink": True, "scheduledAt": confirmed.get("scheduledAt")}))
