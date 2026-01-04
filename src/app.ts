import { LimitedMemoryAdapter } from "seyfert";
import { environmentCheck, extendedContext, startCrons } from "./extra.js";
import middlewares from './middlewares.js';
import EPClient from './client.js';
import { connect } from 'mongoose';
import defaults, { prefix } from './common/defaults.js';
import handleCommand from './structures/handleCommand.js';

environmentCheck();
const client = new EPClient({
    context: extendedContext,
    commands: { prefix, defaults, reply: () => true },
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
    handleCommand,
    cache: {
        adapter,
        disabledCache: { bans: true, stickers: true, messages: true, presences: true, voiceStates: true }
    }
});

startCrons(client);
connect(process.env.MONGO_URL ?? '')
.then(() => client.logger.info('Successfully connected to MongoDB.'))
.catch((error) => client.logger.fatal(`Failed to connect to MongoDB -- ${String(error)}`));

client.start();
