import { redis } from '@/store.js';
import { CommandContext, createUserOption, Declare, Options, SubCommand } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';

const options = {
    user: createUserOption({
        required: true,
        description: 'The participant to remove.'
    })
};

@Declare({
    name: 'remove',
    description: 'Remove a participant from the fast friends game session.',
    defaultMemberPermissions: ['ManageEvents']
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        const channel = await context.channel();
        if (!channel.isVoice() && !channel.isStage()) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'Hold up! You must use this command in a voice or stage channel.'
        });

        const channelId = await redis.get(`ep_ff_active:${context.guildId}`);
        if (!channelId || channel.id !== channelId) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'Hold up! You must use this command in the channel you started the session in.'
        });

        const user = context.options.user;
        await redis.srem(`ep_ff_members:${context.guildId}`, user.id);

        await context.editOrReply({
            flags: MessageFlags.Ephemeral,
            allowed_mentions: { parse: [] },
            content: `Successfully removed ${user} from the fast friends game session.`
        });
    };
};
