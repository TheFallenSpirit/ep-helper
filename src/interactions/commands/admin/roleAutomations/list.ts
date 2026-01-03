import { CommandContext, Declare, SubCommand } from 'seyfert';
import { s } from '../../../../utilities.js';
import { capitalCase } from 'change-case';
import { createContainer, createTextDisplay } from '../../../../structures/components.js';
import { MessageFlags } from 'seyfert/lib/types/index.js';

@Declare({
    name: 'list',
    description: 'View a list of role automations in this server.'
})

export default class extends SubCommand {
    run = async (context: CommandContext<{}, 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        const roleAutomations = context.metadata.guildConfig.roleAutomations ?? [];
        if (roleAutomations.length < 1) return context.editOrReply({
            content: `${s(guild.name)} has no role automations.`
        });

        const components = roleAutomations.map((automation) => {
            const lines = [
                `- **${automation.name}** (${capitalCase(automation.type)})\n`,
                `  - Role: <@&${automation.primaryRoleId}>\n`,
                `  - Triggers: ${automation.triggerRoleIds.map((id) => `<@&${id}>`).join(', ')}`
            ];

            return createTextDisplay(lines.join(''));
        });

        const container = createContainer(components);
        await context.editOrReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    };
};
