import { LimitedMemoryAdapter } from "seyfert";
import { environmentCheck, extendedContext, startCrons } from "./extra.js";
import middlewares from './common/middlewares.js';
import { connect } from 'mongoose';
import defaults, { prefix } from './common/defaults.js';
import handleCommand from './structures/handleCommand.js';
import EPClient from './client.js';
import customizeLogger from '@fallencodes/seyfert-utils/logger';
import { redisSub } from './store.js';

environmentCheck();
customizeLogger();

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

const channelName = `__keyevent@${redisSub.options.db}__:expired`;
await redisSub.config('SET', 'notify-keyspace-events', 'Ex');
await redisSub.subscribe(channelName);

redisSub.on('message', async (channel, message) => {
    if (channel !== channelName) return;
    await client.events.runCustom('redisExpiry', message);
});

client.start();
