import { createContainer, createTextDisplay } from '@fallencodes/seyfert-utils/components/message';
import { capitalCase } from 'change-case';
import { CommandContext, Declare, SubCommand } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';

@Declare({
    name: 'list',
    description: `View a list of this app's custom statuses.`
})

export default class extends SubCommand {
    run = async (context: CommandContext) => {
        const statuses = context.client.config.status?.items ?? [];
        
        if (statuses.length < 1) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: `There are no customs statuses on ${context.client.me.username}.`
        });

        const lines = [
            `### Custom Statuses - ${context.client.me.username}\n`,
            statuses.map(({ status, message }, index) => {
                return `${index + 1}. [${capitalCase(status.toString())}] ${message}`;
            }).join('\n')
        ];

        await context.editOrReply({
            flags: MessageFlags.IsComponentsV2,
            components: [createContainer([createTextDisplay(lines.join(''))])]
        });
    };
};
