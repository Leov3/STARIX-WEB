#!/usr/bin/env python3
"""Deploy the locally built STARIX release while keeping JWT secret server-side."""

import subprocess
from pathlib import Path

backup = Path('/root/starix-backups/starix-web-service-prelaunch.json')
if not backup.exists():
    result = subprocess.run(['docker', 'service', 'inspect', 'desarrollo_starix'], check=True, capture_output=True)
    backup.write_bytes(result.stdout)
    backup.chmod(0o600)
secret = Path('/root/starix-backups/jitsi-prod-jwt-secret').read_text().strip()
if len(secret) < 40:
    raise SystemExit('jwt_secret_invalid')
result = subprocess.run([
    'docker', 'service', 'update',
    '--image', 'starix-jitsi-release:9335f93',
    '--env-add', 'JITSI_APP_SECRET=' + secret,
    '--env-add', 'JITSI_APP_ID=starix-prod',
    '--env-add', 'JITSI_MEET_DOMAIN=meet.starix.tech',
    'desarrollo_starix',
], capture_output=True)
if result.returncode:
    raise SystemExit('starix_service_update_failed')
print('STARIX web service converged on the GitHub main release')
