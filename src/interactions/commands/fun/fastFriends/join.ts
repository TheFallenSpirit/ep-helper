import { redis } from '@/store.js';
import { CommandContext, Declare, SubCommand } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';

@Declare({
    name: 'join',
    description: 'Join a fast friends game session.'
})

export default class extends SubCommand {
    run = async (context: CommandContext) => {
        const channelId = await redis.get(`ep_ff_active:${context.guildId}`);
        if (!channelId) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'Hold up! There are no active fast friends game sessions.'
        });

        const members = await redis.smembers(`ep_ff_members:${context.guildId}`);
        if (members.includes(context.author.id)) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: `Hold up! You're already in this game silly.`
        });

        const voiceState = await context.member?.voice();
        if (voiceState?.channelId !== channelId) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: `Hold up! You must be in <#${channelId}> to join this game session.`
        });

        await redis.sadd(
            `ep_ff_members:${context.guildId}`,
            context.author.id
        );

        await context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'Successfully joined fast friends game session.'
        });
    };
};
