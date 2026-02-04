import { snowflakeOptionValue } from '@fallencodes/seyfert-utils/options';
import { CommandContext, createStringOption, Declare, Options, SubCommand } from 'seyfert';
import { config } from '@/store.js';

const options = {
    server: createStringOption({
        required: true,
        description: 'The guild ID to remove from whitelisted servers',
        value: snowflakeOptionValue
    })
};

@Declare({
    name: 'remove',
    description: 'Remove a whitelisted server from this app.'
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        const guildId = context.options.server;
        const username = context.client.me.username;

        if (!config.data.whitelistedGuildIds.includes(guildId)) return context.editOrReply({
            content: `\`${guildId}\` isn't a member of ${username}'s whitelisted severs.`
        });

        config.data.whitelistedGuildIds = config.data.whitelistedGuildIds.filter((id) => id !== guildId);
        config.write();

        await context.editOrReply({
            content: `Removed \`${guildId}\` from ${username}'s whitelisted servers.`
        });
    };
};
