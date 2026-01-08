import { Command, CommandContext, Declare, Middlewares } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';
import { createContainer, createSeparator, createTextDisplay, s } from '@fallencodes/seyfert-utils';

@Declare({
    name: 'config',
    contexts: ['Guild'],
    integrationTypes: ['GuildInstall'],
    defaultMemberPermissions: ['ManageGuild'],
    description: `View this server's configuration.`
})

@Middlewares(['guildConfig'])
export default class extends Command {
    run = async (context: CommandContext<{}, 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');
        const guildConfig = context.metadata.guildConfig;

        const lines = [
            `**Prefix**: ${guildConfig.prefix ?? 'ep'}\n\n`,
            `**Media Channels**:\n${guildConfig.mediaChannels?.map((id) => `<#${id}>`).join(', ') || 'None'}`
        ];

        const container = createContainer([
            createTextDisplay(`### Server Config ∙ ${s(guild.name)}`),
            createSeparator(),
            createTextDisplay(lines.join('')),
            createSeparator(),
            createTextDisplay(`-# **Guild ID**: \`${guild.id}\`\n-# **Document ID**: \`${guildConfig._id}\``)
        ]);

        await context.editOrReply({ flags: MessageFlags.IsComponentsV2, components: [container] });
    };
};
