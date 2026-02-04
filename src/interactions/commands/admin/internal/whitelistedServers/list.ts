import { s } from '@fallencodes/seyfert-utils';
import { createContainer, createTextDisplay } from '@fallencodes/seyfert-utils/components/message';
import { CommandContext, Declare, SubCommand } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';

@Declare({
    name: 'list',
    description: 'View a list of whitelisted servers on this app.'
})

export default class extends SubCommand {
    run = async (context: CommandContext) => {
        const whitelistedGuildIds = context.client.config.whitelistedGuildIds ?? [];

        if (whitelistedGuildIds.length < 1) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'There are no whitelisted servers, whitelisted servers is disabled.'
        });

        const lines = [
            `### Whitelisted Servers - ${context.client.me.username}`
        ];

        for (const guildId of whitelistedGuildIds) {
            const guild = context.client.cache.guilds?.get(guildId);
            lines.push(`- ${guild ? `${s(guild.name)} [\`${guild.id}\`]` : `\`${guildId}\``}`);
        };

        await context.editOrReply({
            flags: MessageFlags.IsComponentsV2,
            components: [createContainer([createTextDisplay(lines.join('\n'))])]
        });
    };
};
