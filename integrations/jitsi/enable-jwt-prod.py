#!/usr/bin/env python3
"""Prepare production Jitsi JWT auth from a server-only secret and env backup."""

from pathlib import Path
import secrets

root = Path('/opt/jitsi-docker')
env_path = root / '.env'
backups = Path('/root/starix-backups')
secret_path = backups / 'jitsi-prod-jwt-secret'
env_backup = backups / 'jitsi-prod-prelaunch.env'
if not env_path.is_file() or not backups.is_dir():
    raise SystemExit('production_jitsi_or_backup_missing')
if not env_backup.exists():
    env_backup.write_bytes(env_path.read_bytes())
    env_backup.chmod(0o600)
if not secret_path.exists():
    secret_path.write_text(secrets.token_urlsafe(48))
    secret_path.chmod(0o600)
secret = secret_path.read_text().strip()
settings = {
    'ENABLE_AUTH': '1',
    'AUTH_TYPE': 'jwt',
    'ENABLE_GUESTS': '0',
    'ENABLE_AUTO_OWNER': '0',
    'ENABLE_LOBBY': '1',
    'JICOFO_ENABLE_AUTH': '0',
    'JWT_APP_ID': 'starix-prod',
    'JWT_APP_SECRET': secret,
    'JWT_ALLOW_EMPTY': '0',
    'JWT_ENABLE_DOMAIN_VERIFICATION': '0',
    'XMPP_MUC_DOMAIN': 'conference.meet.jitsi',
    'XMPP_MUC_MODULES': 'token_affiliation,token_lobby_bypass,starix_lobby',
    'DEFAULT_LANGUAGE': 'es',
    'BRANDING_DATA_URL': 'https://starix.tech/api/jitsi/branding',
}
lines = env_path.read_text().splitlines()
for key, value in settings.items():
    lines = [line for line in lines if not line.startswith(key + '=') and not line.startswith('#' + key + '=')]
    lines.append(f'{key}={value}')
env_path.write_text('\n'.join(lines) + '\n')
env_path.chmod(0o600)
print('Production Jitsi JWT prepared; credentials kept on server')
