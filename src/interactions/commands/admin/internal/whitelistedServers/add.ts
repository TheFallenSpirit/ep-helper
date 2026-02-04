import { updateAppConfig } from '@/store.js';
import { snowflakeOptionValue } from '@fallencodes/seyfert-utils/options';
import { CommandContext, createStringOption, Declare, Options, SubCommand } from 'seyfert';

const options = {
    server: createStringOption({
        required: true,
        description: 'The guild ID to add to whitelisted servers',
        value: snowflakeOptionValue
    })
};

@Declare({
    name: 'add',
    description: 'Add a new whitelisted server to this app.'
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        const guildId = context.options.server;
        const username = context.client.me.username;

        if (context.client.config.whitelistedGuildIds?.includes(guildId)) return context.editOrReply({
            content: `\`${guildId}\` is already a member of ${username}'s whitelisted severs.`
        });

        await updateAppConfig(
            context.client,
            { $addToSet: { whitelistedGuildIds: guildId } }
        );

        await context.editOrReply({
            content: `Added \`${guildId}\` to ${username}'s whitelisted servers.`
        });
    };
};
