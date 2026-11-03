#!/bin/sh
exec odoo shell -c /etc/odoo/odoo.conf -d starix \
  --db_host="${HOST}" --db_user="${USER}" --db_password="${PASSWORD}"
