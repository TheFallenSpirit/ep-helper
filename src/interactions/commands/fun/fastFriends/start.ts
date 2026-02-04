import { redis } from '@/store.js';
import { CommandContext, Declare, SubCommand } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';

@Declare({
    name: 'start',
    description: 'Start a fast friends game session.',
    defaultMemberPermissions: ['ManageEvents']
})

export default class extends SubCommand {
    run = async (context: CommandContext<{}, 'guildConfig'>) => {
        const channel = await context.channel();
        if (!channel.isVoice() && !channel.isStage()) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'Hold up! You must use this command in a voice or stage channel.'
        });

        const prefix = context.metadata.guildConfig.prefix ?? 'ep';
        await redis.set(`ep_ff_active:${context.guildId}`, channel.id, 'EX', 86_400);

        const lines = [
            `Successfully started a fast friends game session.`,
            ` Participants can join by using \`/fast-friends join\` or \`${prefix} ff join\`.`
        ];

        await context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: lines.join('')
        });
    };
};
