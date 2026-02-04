import { redis } from '@/store.js';
import { createMiddleware } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';

export const fastFriendsSession = createMiddleware<void>(async ({ next, context }) => {
    const guild = await context.guild();
    if (!guild) return context.replyWith(context, 'guildUnavailable');

    const channel = await context.channel();
    if (!channel.isVoice() && !channel.isStage()) return context.editOrReply({
        flags: MessageFlags.Ephemeral,
        content: 'Hold up! You must use this command in a voice or stage channel.'
    });

    const channelId = await redis.get(`ep_ff_active:${context.guildId}`);
    if (!channelId) return context.editOrReply({
        flags: MessageFlags.Ephemeral,
        content: 'Hold up! There is no active fast friends game session in this server.'
    });

    if (channel.id !== channelId) return context.editOrReply({
        flags: MessageFlags.Ephemeral,
        content: `Hold up! You must use this command in <#${channelId}>.`
    });

    next();
});
