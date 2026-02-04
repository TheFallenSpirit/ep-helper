import { redis } from '@/store.js';
import { CommandContext, Declare, SubCommand } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';

@Declare({
    name: 'leave',
    description: 'Leave a fast friends game session.'
})

export default class extends SubCommand {
    run = async (context: CommandContext) => {
        const active = await redis.get(`ep_ff_active:${context.guildId}`);
        if (!active) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'Hold up! There are no active fast friends game sessions.'
        });

        const members = await redis.smembers(`ep_ff_members:${context.guildId}`);
        if (!members.includes(context.author.id)) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: `Hold up! You're aren't in this game silly.`
        });

        await redis.srem(
            `ep_ff_members:${context.guildId}`,
            context.author.id
        );

        await context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'Successfully left fast friends game session.'
        });
    };
};
