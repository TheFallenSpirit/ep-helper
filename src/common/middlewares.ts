import { createMiddleware } from 'seyfert';
import { GuildI } from '../models/Guild.js';
import { getGuild, getProfile, redis } from '../store.js';
import { MessageFlags } from 'seyfert/lib/types/index.js';
import { isInstalled, replacer, s } from '@fallencodes/seyfert-utils';
import { fastFriendsSession } from './fastFriends.js';
import Profile, { ProfileI } from '@/models/Profile.js';

const userLock = createMiddleware<void>(async ({ next, context }) => {
    if (!('customId' in context)) return next();

    const userId = context.customId.split(':').at(-1)!;
    if (userId !== context.author.id) return context.replyWith(context, 'invalidUser');

    next();
});

const guildConfig = createMiddleware<GuildI>(async ({ next, context }) => {
    const whitelistedGuilds = context.client.config.whitelistedGuildIds ?? [];

    if (whitelistedGuilds.length > 0 && !whitelistedGuilds.includes(context.guildId!)) return context.editOrReply({
        flags: MessageFlags.Ephemeral,
        content: `Hold up! | This server isn't whitelisted on ${s(context.client.me.username)}.`
    });

    const guildConfig = await getGuild(context.guildId!);
    next(guildConfig);
});

const internalAccess = createMiddleware<void>(async ({ next, context }) => {
    const internalAdminIds = context.client.config.internalAdminIds;

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

const profile = createMiddleware<ProfileI>(async ({ next, context }) => {
    if (!isInstalled(context)) return;
    let profile = await getProfile(context.guildId!, context.author.id);

    if (!profile) profile = (await Profile.create({
        guildId: context.guildId!,
        userId: context.author.id
    })).toObject();

    await redis.set(
        `ep_profile:${context.guildId}:${context.author.id}`,
        JSON.stringify(profile, replacer),
        'EX',
        604800
    );

    next(profile);
});

export default {
    profile,
    userLock,
    guildConfig,
    internalAccess,
    fastFriendsSession
};
