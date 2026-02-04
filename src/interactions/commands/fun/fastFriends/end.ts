import { redis } from '@/store.js';
import { CommandContext, Declare, Middlewares, SubCommand } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';

@Declare({
    name: 'end',
    description: 'End a fast friends game session.',
    defaultMemberPermissions: ['ManageEvents']
})

@Middlewares(['fastFriendsSession'])
export default class extends SubCommand {
    run = async (context: CommandContext) => {
        await redis.del(`ep_ff_active:${context.guildId}`);
        await redis.del(`ep_ff_members:${context.guildId}`);

        await context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: `Successfully ended all fast friends game sessions.`
        });
    };
};
