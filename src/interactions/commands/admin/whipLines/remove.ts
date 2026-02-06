import { updateGuild } from '@/store.js';
import { s } from '@fallencodes/seyfert-utils';
import { CommandContext, createNumberOption,  Declare, Options, SubCommand } from 'seyfert';
import { linesAutocomplete } from './whipLines.js';

const options = {
    line: createNumberOption({
        required: true,
        description: 'The whip line to remove.',
        autocomplete: linesAutocomplete
    })
};

@Declare({
    name: 'remove',
    description: 'Remove a whip line from this server.'
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options, 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');
      
        const index = context.options.line;
        if (index === -1) return context.editOrReply({
            content: `Hold up! The provided whip line index isn't a valid number.`
        });

        await updateGuild(guild.id, { $unset: { [`whipLines.${index}`]: '' } });
        await updateGuild(guild.id, { $pull: { whipLines: null } });
        await context.editOrReply({ content: `Successfully removed a whip line from ${s(guild.name)}.` });
    };
};
