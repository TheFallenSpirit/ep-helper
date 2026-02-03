import { createMiddleware } from 'seyfert';
import { GuildI } from '../models/Guild.js';
import { config, getGuild } from '../store.js';
import { MessageFlags } from 'seyfert/lib/types/index.js';
import { s } from '@fallencodes/seyfert-utils';

const userLock = createMiddleware<void>(async ({ next, context }) => {
    if (!('customId' in context)) return next();

    const userId = context.customId.split(':').at(-1)!;
    if (userId !== context.author.id) return context.replyWith(context, 'invalidUser');

    next();
});

const guildConfig = createMiddleware<GuildI>(async ({ next, context }) => {
    const whitelistedGuilds = config.data.whitelistedGuilds;

    if (whitelistedGuilds.length > 0 && !whitelistedGuilds.includes(context.guildId!)) return context.editOrReply({
        flags: MessageFlags.Ephemeral,
        content: `Hold up! | This server isn't whitelisted on ${s(context.client.me.username)}.`
    });

    const guildConfig = await getGuild(context.guildId!);
    next(guildConfig);
});

const internalAccess = createMiddleware<void>(async ({ next, context }) => {
    const internalAdminIds = config.data.internalAdminIds;

    if (internalAdminIds.length < 1) return context.editOrReply({
        flags: MessageFlags.Ephemeral,
        content: 'There are no configured internal admins, please read the console output.'
    });

    if (!internalAdminIds.includes(context.author.id)) return context.editOrReply({
        flags: MessageFlags.Ephemeral,
        content: `You aren't whitelisted to use internal admin commands.`
    });

    next();
});

export default {
    userLock,
    guildConfig,
    internalAccess
};
