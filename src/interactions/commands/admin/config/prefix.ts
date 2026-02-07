import { updateGuild } from '@/store.js';
import { s } from '@fallencodes/seyfert-utils';
import { CommandContext, createStringOption, Declare, Options, SubCommand } from 'seyfert';

const options = {
    'new-prefix': createStringOption({
        required: true,
        description: 'The new prefix for this server.',
        min_length: 1,
        max_length: 3
    })
};

@Declare({
    name: 'prefix',
    description: `Change this server's text command prefix.`
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options, 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        const newPrefix = context.options['new-prefix'].trim().toLowerCase();
        await updateGuild(guild.id, { $set: { prefix: newPrefix } });
        await context.editOrReply({ content: `Successfully set ${s(guild.name)}'s prefix to "${newPrefix}".` });
    };
};
