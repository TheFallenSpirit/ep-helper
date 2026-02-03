import { createMiddleware } from 'seyfert';
import { GuildI } from '../models/Guild.js';
import config from '../../config.json' with { type: 'json' };
import { getGuild } from '../store.js';
import { MessageFlags } from 'seyfert/lib/types/index.js';
import { s } from '@fallencodes/seyfert-utils';

const userLock = createMiddleware<void>(async ({ next, context }) => {
    if (!('customId' in context)) return next();

    const userId = context.customId.split(':').at(-1)!;
    if (userId !== context.author.id) return context.replyWith(context, 'invalidUser');

    next();
});

const guildConfig = createMiddleware<GuildI>(async ({ next, context }) => {
    if (!config['whitelisted-guilds'].includes(context.guildId!)) return context.editOrReply({
        flags: MessageFlags.Ephemeral,
        content: `Hold up! | This server isn't whitelisted on ${s(context.client.me.username)}.`
    });

    const guildConfig = await getGuild(context.guildId!);
    next(guildConfig);
});

export default {
    userLock,
    guildConfig
};
