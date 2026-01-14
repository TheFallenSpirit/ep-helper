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

    if (!guildConfig.vipTiers || guildConfig.vipTiers.size < 1) return context.editOrReply({
        flags: MessageFlags.Ephemeral,
        content: `Hold up! | The VIP module isn't enabled in ${s(guild.name)}.`
    });

    const vipTiers = new Collection(Array.from(guildConfig.vipTiers));
    const vipTier = vipTiers.find(({ vipRoleId }) => !!context.member?.roles.keys.includes(vipRoleId));

    if (!vipTier) return context.editOrReply({
        flags: MessageFlags.Ephemeral,
        content: `Hold up! | You don't have any VIP roles in ${s(guild.name)}.`
    });

    let vipProfile = await getVipProfile(guild.id, context.author.id);
    if (vipProfile && vipProfile.tierId !== vipTier._id) {
        const oldTierName = s(guildConfig.vipTiers.get(vipProfile.tierId)?.name ?? 'unknown');
        await updateVipProfile(guild.id, context.author.id, { $set: { tierId: vipTier._id } });

        const lines = [
            `Your VIP tier has changed from ${oldTierName} to ${s(vipTier.name)}`,
            `, please use this command again to view your updated VIP profile.`
        ];

        return context.editOrReply({ flags: MessageFlags.Ephemeral, content: lines.join('') });
    };

    if (!vipProfile) {
        vipProfile = (await VIP.create({ guildId: guild.id, userId: context.author.id, tierId: vipTier._id })).toObject();
        await redis.set(`ep_vip_profile:${guild.id}:${context.author.id}`, JSON.stringify(vipProfile), 'EX', 604800);
    } else await redis.expire(`es_vip_profile:${guild.id}:${context.author.id}`, 604800);

    return next(vipProfile);
});

export default {
    vipProfile,
    guildConfig
};
