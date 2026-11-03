#!/usr/bin/env python3
"""Enable JWT role testing in the isolated STARIX Jitsi stage only."""

from pathlib import Path
import secrets
import sys

root = Path('/opt/jitsi-starix-stage')
env_path = root / '.env'
secret_path = root / '.jwt-secret'
if not root.is_dir() or not env_path.is_file():
    raise SystemExit('stage_missing')
if not secret_path.exists() or '--rotate' in sys.argv:
    secret_path.write_text(secrets.token_urlsafe(48))
    secret_path.chmod(0o600)
secret = secret_path.read_text().strip()
settings = {
    'ENABLE_AUTH': '1',
    'AUTH_TYPE': 'jwt',
    'ENABLE_GUESTS': '0',
    'ENABLE_AUTO_OWNER': '0',
    'JICOFO_ENABLE_AUTH': '0',
    'JWT_APP_ID': 'starix-stage',
    'JWT_APP_SECRET': secret,
    'JWT_ALLOW_EMPTY': '0',
    'JWT_ENABLE_DOMAIN_VERIFICATION': '0',
    'XMPP_MUC_MODULES': 'token_affiliation,token_lobby_bypass,starix_lobby',
    'XMPP_MUC_DOMAIN': 'conference.meet.jitsi',
}
lines = env_path.read_text().splitlines()
for key, value in settings.items():
    lines = [line for line in lines if not line.startswith(key + '=') and not line.startswith('#' + key + '=')]
    lines.append(f'{key}={value}')
env_path.write_text('\n'.join(lines) + '\n')
env_path.chmod(0o600)
print('JWT role configuration written to isolated stage')
