import { updateGuild } from '@/store.js';
import { s } from '@fallencodes/seyfert-utils';
import { CommandContext, createStringOption, Declare, Options, SubCommand } from 'seyfert';

const options = {
    line: createStringOption({
        required: true,
        description: 'The content of the new whip line.',
        min_length: 3,
        max_length: 1000
    })
};

@Declare({
    name: 'add',
    description: 'Add a new whip line to this server.'
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options, 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');
        const whipLines = context.metadata.guildConfig.whipLines ?? [];

        if (whipLines.length >= 50) return context.editOrReply({
            content: `Hold up! ${s(guild.name)} has reached it's max of 50 whip lines.`
        });

        await updateGuild(guild.id, { $addToSet: { whipLines: context.options.line } });
        await context.editOrReply({ content: `Successfully added a new whip line to ${s(guild.name)}.` });
    };
};
