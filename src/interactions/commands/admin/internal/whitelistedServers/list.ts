import { config } from '@/store.js';
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
        if (config.data.whitelistedGuildIds.length < 1) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'There are no whitelisted servers, whitelisted servers is disabled.'
        });

        const whitelistedServers: string[] = [];
        for (const guildId of config.data.whitelistedGuildIds) {
            const guild = context.client.cache.guilds?.get(guildId);
            whitelistedServers.push(guild ? `${s(guild.name)} [\`${guild.id}\`]` : `\`${guildId}\``)
        };

        const lines = [
            `### Whitelisted Servers - ${context.client.me.username}\n`,
            whitelistedServers.map((server) => `- ${server}`).join('\n')
        ];

        await context.editOrReply({
            flags: MessageFlags.IsComponentsV2,
            components: [createContainer([createTextDisplay(lines.join(''))])]
        });
    };
};
