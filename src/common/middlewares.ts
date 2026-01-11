import { createMiddleware } from 'seyfert';
import { GuildI } from '../models/Guild.js';
import config from '../../config.json' with { type: 'json' };
import { getGuild, getVipProfile, redis } from '../store.js';
import { MessageFlags } from 'seyfert/lib/types/index.js';
import { s } from '@fallencodes/seyfert-utils';
import VIP, { VIPI } from '../models/VIP.js';

const guildConfig = createMiddleware<GuildI>(async ({ next, context }) => {
    if (!config['whitelisted-guilds'].includes(context.guildId!)) return context.editOrReply({
        flags: MessageFlags.Ephemeral,
        content: `Hold up! | This server isn't whitelisted on ${s(context.client.me.username)}.`
    });

    const guildConfig = await getGuild(context.guildId!);
    next(guildConfig);
});

const vipProfile = createMiddleware<VIPI>(async ({ next, context }) => {
    const guild = await context.guild();
    if (!guild) return;

    const guildConfig = await getGuild(guild.id);
    if (!guildConfig) return;

    if (!guildConfig.vip?.enabled || !guildConfig.vip.vipRoleId) return context.editOrReply({
        flags: MessageFlags.Ephemeral,
        content: `Hold up! | The VIP module isn't enabled in ${s(guild.name)}.`
    });

    if (!context.member?.roles.keys.includes(guildConfig.vip.vipRoleId)) return context.editOrReply({
        flags: MessageFlags.Ephemeral,
        content: `Hold up! | You don't have the VIP role <@&${guildConfig.vip.vipRoleId}>.`
    });

    let vipProfile = await getVipProfile(guild.id, context.author.id);

    if (!vipProfile) {
        vipProfile = (await VIP.create({ guildId: guild.id, userId: context.author.id })).toObject();
        await redis.set(`ep_vip_profile:${guild.id}:${context.author.id}`, JSON.stringify(vipProfile), 'EX', 604800);
    } else await redis.expire(`es_vip_profile:${guild.id}:${context.author.id}`, 604800);

    return next(vipProfile);
});

export default {
    vipProfile,
    guildConfig
};
