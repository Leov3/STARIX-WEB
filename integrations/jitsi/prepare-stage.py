"""Prepare a local-only Jitsi stage from the installed Compose release.

Run on the server as root. Secrets are copied only on the server and never
printed or written into this repository.
"""

from pathlib import Path


SOURCE = Path("/opt/jitsi-docker")
STAGE = Path("/opt/jitsi-starix-stage")
STAGE.mkdir(mode=0o700, exist_ok=True)

source_env = (SOURCE / ".env").read_text()
overrides = {
    "CONFIG": str(STAGE / "config"),
    "PUBLIC_URL": "https://127.0.0.1:18443",
    "HTTP_PORT": "18000",
    "HTTPS_PORT": "18443",
    "JVB_PORT": "10001",
    "JVB_COLIBRI_PORT": "18080",
    "JICOFO_REST_PORT": "18888",
    "DISABLE_HTTPS": "0",
    "ENABLE_HTTP_REDIRECT": "0",
    "ENABLE_LETSENCRYPT": "0",
    "RESTART_POLICY": "no",
}
lines = [line for line in source_env.splitlines() if line.split("=", 1)[0] not in overrides]
lines.extend(f"{key}={value}" for key, value in overrides.items())
env_file = STAGE / ".env"
env_file.write_text("\n".join(lines) + "\n")
env_file.chmod(0o600)

compose = (SOURCE / "docker-compose.yml").read_text()
compose = compose.replace(
    "container_name: desarrollo_jitsi_undefined",
    "container_name: starix-jitsi-stage-web",
)
compose = compose.replace("- '${HTTP_PORT}:80'", "- '127.0.0.1:${HTTP_PORT}:80'")
compose = compose.replace("- '${HTTPS_PORT}:443'", "- '127.0.0.1:${HTTPS_PORT}:443'")
(STAGE / "docker-compose.yml").write_text(compose)

for relative in (
    "config/web/crontabs",
    "config/web/load-test",
    "config/prosody/config",
    "config/prosody/prosody-plugins-custom",
    "config/jicofo",
    "config/jvb",
    "config/transcripts",
):
    (STAGE / relative).mkdir(parents=True, exist_ok=True)

print(f"stage_dir={STAGE} https=127.0.0.1:18443")
