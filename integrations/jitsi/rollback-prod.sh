#!/bin/sh
set -eu

test -f /root/starix-backups/jitsi-prod-prelaunch.env
cp /root/starix-backups/jitsi-prod-prelaunch.env /opt/jitsi-docker/.env
chmod 600 /opt/jitsi-docker/.env
rm -f /root/.jitsi-meet-cfg/web/custom-config.js
rm -f /root/.jitsi-meet-cfg/web/custom-interface_config.js
rm -f /root/.jitsi-meet-cfg/prosody/prosody-plugins-custom/mod_starix_lobby.lua
cd /opt/jitsi-docker
docker compose -p jitsi-docker up -d --force-recreate
