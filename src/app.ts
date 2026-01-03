import { LimitedMemoryAdapter } from "seyfert";
import { environmentCheck, extendedContext, startCrons } from "./extra.js";
import middlewares from './middlewares.js';
import EPClient from './client.js';

environmentCheck();
const client = new EPClient({
    context: extendedContext,
    commands: { reply: () => true },
    allowedMentions: { parse: ['users'], replied_user: false }
});

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
    middlewares,
    cache: { adapter, disabledCache: { bans: true, stickers: true, messages: true, presences: true, voiceStates: true } }
});

startCrons(client);
client.start();
