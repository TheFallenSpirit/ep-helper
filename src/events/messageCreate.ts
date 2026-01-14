import { AllGuildTextableChannels, createEvent, Message } from 'seyfert';
import { CachedAutoReactionI, getGuild, redis, setCachedAutoReaction, updateVipProfile } from '../store.js';
import MediaLog from '../models/MediaLog.js';
import { GuildI } from '../models/Guild.js';
import { reviver } from '@fallencodes/seyfert-utils';
import { PermissionsBitField } from 'seyfert/lib/structures/extra/Permissions.js';

export default createEvent({
    data: { name: 'messageCreate' },
    run: async (message) => {
        if (!message.guildId || message.author.bot) return;
        const guild = await message.guild();
        if (!guild) return;

        const guildConfig = await getGuild(message.guildId);
        if (!guildConfig) return;

        const channel = await message.channel();
        if (!channel.isGuildTextable()) return;

        const me = await guild.members.fetch(message.client.me.id);
        const permissions = await channel.memberPermissions(me);

        handleMediaLogging(message, guildConfig, channel);
        handleAutoReactions(message, permissions);
    }
});

async function handleMediaLogging(message: Message, guildConfig: GuildI, channel: AllGuildTextableChannels) {
    if (
        guildConfig.mediaChannels?.includes(channel.id) ||
        ('parentId' in channel) && channel.parentId && guildConfig.mediaChannels?.includes(channel.parentId)
    ) {
        if (message.attachments.length > 0) await MediaLog.create({
            guildId: message.guildId,
            authorId: message.author.id,
            channelId: message.channelId,
            messageId: message.id
        });
    };
};

async function handleAutoReactions(message: Message, permissions: PermissionsBitField) {
    if (!permissions.has(['AddReactions'])) return;

    const rawReactions = await redis.smembers(`ep_reactions:${message.guildId}`);
    const reactions = rawReactions.map((raw) => JSON.parse(raw, reviver) as CachedAutoReactionI);

    for await (const reaction of reactions) {
        const triggers = [...reaction.triggers, `<@${reaction.userId}>`];
        if (reaction.roleId) triggers.push(`<@&${reaction.roleId}>`);
        if (!triggers.some((trigger) => message.content.toLowerCase().includes(trigger))) continue;

        for await (const emoji of reaction.items) {
            const error = await message.react(emoji).then(() => false).catch(() => true);
            if (!error) continue;
            
            const vipProfile = await updateVipProfile(
                message.guildId!,
                reaction.userId,
                { $pull: { 'reaction.items': emoji } }
            );

            await setCachedAutoReaction(message.guildId!, {
                roleId: reaction.roleId,
                userId: reaction.userId,
                items: vipProfile.reaction?.items ?? [],
                triggers: vipProfile.reaction?.triggers ?? []
            });
        };
    };
};
