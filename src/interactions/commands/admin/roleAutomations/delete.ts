import { CommandContext, createNumberOption, Declare, Options, SubCommand } from 'seyfert';
import { roleAutomationsAutocomplete } from './roleAutomations.js';
import { updateGuild } from '../../../../store.js';

const options = {
    automation: createNumberOption({
        required: true,
        description: 'The role automation to delete.',
        autocomplete: roleAutomationsAutocomplete
    })
};

@Declare({
    name: 'delete',
    description: 'Delete a role automation in this server.'
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options, 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        const automationIndex = context.options.automation;
        const automation = context.metadata.guildConfig.roleAutomations?.[automationIndex];

        if (!automation) return context.editOrReply({
            content: `Hold up! | The specified role automation with index ${automationIndex} wasn't found.`
        });

        await updateGuild(guild.id, { $pull: { roleAutomations: automation } });
        await context.editOrReply({ content: `Successfully deleted role automation \`${automation.name}\`.` });
    };
};
