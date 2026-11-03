#!/usr/bin/env python3
"""Restore the STARIX Swarm image and Jitsi env from the prelaunch service spec."""

import json
import subprocess
from pathlib import Path

data = json.loads(Path('/root/starix-backups/starix-web-service-prelaunch.json').read_text())[0]
image = data['Spec']['TaskTemplate']['ContainerSpec']['Image']
original = {}
for item in data['Spec']['TaskTemplate']['ContainerSpec'].get('Env', []):
    key, _, value = item.partition('=')
    original[key] = value
args = ['docker', 'service', 'update', '--image', image]
for key in ('JITSI_APP_SECRET', 'JITSI_APP_ID', 'JITSI_MEET_DOMAIN'):
    if key in original:
        args += ['--env-add', f'{key}={original[key]}']
    else:
        args += ['--env-rm', key]
args.append('desarrollo_starix')
result = subprocess.run(args, capture_output=True)
if result.returncode:
    raise SystemExit('starix_web_rollback_failed')
print('STARIX web service restored to the prelaunch image and env')
