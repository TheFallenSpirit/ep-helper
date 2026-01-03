import { Client, LimitedMemoryAdapter } from "seyfert";
import { environmentCheck, startCrons } from "./extra.js";
import { basename } from 'node:path';

environmentCheck();
const client = new Client();

const adapter = new LimitedMemoryAdapter({
    default: { expire: 3600000 },
    user: { expire: 0 },
    role: { expire: 0 },
    emoji: { expire: 0 },
    guild: { expire: 0 },
    member: { expire: 0 },
    channel: { expire: 0 },
    overwrite: { expire: 0 }
});

client.setServices({
    cache: { adapter, disabledCache: { bans: true, stickers: true, messages: true, presences: true, voiceStates: true } }
});

startCrons(client);
client.events.filter = (path) => !basename(path).startsWith('_');
client.commands.filter = (path) => !basename(path).startsWith('_');

client.start();
