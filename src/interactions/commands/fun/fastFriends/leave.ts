import { redis } from '@/store.js';
import { CommandContext, Declare, SubCommand } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';

@Declare({
    name: 'leave',
    description: 'Leave a fast friends game session.'
})

export default class extends SubCommand {
    run = async (context: CommandContext) => {
        const isMember = await redis.sismember(
            `ep_ff_members:${context.guildId}`,
            context.author.id
        );

        if (!isMember) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: `Hold up! You're aren't in a fast friends game silly.`
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
