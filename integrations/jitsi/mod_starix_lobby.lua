-- The contrib lobby_autostart module for this image emits an old event name.
-- This module uses the event expected by Jitsi stable-9823.
local is_healthcheck_room = module:require 'util'.is_healthcheck_room

module:hook('muc-room-pre-create', function (event)
    local room = event.room
    if is_healthcheck_room(room.jid) then
        return
    end
    prosody.events.fire_event('create-lobby-room', { room = room })
end)
