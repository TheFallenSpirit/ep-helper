import { CommandContext, ContainerBuilderComponents, Declare, SubCommand } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';
import { s, truncateString, truncateStringArray } from '@fallencodes/seyfert-utils';
import { createContainer, createTextDisplay, createSeparator, createTextSection } from '@fallencodes/seyfert-utils/components/message';
import dayjs from 'dayjs';

@Declare({
    name: 'view',
    description: `View this server's config and settings.`
})

export default class extends SubCommand {
    run = async (context: CommandContext<{}, 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');
        const guildConfig = context.metadata.guildConfig;

        const headerLines = [
            `### Server Config • ${s(guild.name)}\n`,
            `To learn how to update this server's config, use /help and select "Admin Commands".`
        ];

        const mediaChannels = guildConfig.mediaChannels?.map((id) => `<#${id}>`);
        const whipLines = guildConfig.whipLines?.map((line) => `- ${truncateString(line)}`);

        let mediaDeleteDelay = 'None';
        if (guildConfig.media?.deleteAfterDelay) {
            mediaDeleteDelay = dayjs.utc().add(guildConfig.media.deleteAfterDelay, 'm').fromNow(true);
        };

        const lines = [
            `**Prefix**: \`${guildConfig.prefix ?? 'ep'}\`\n`,
            `**Logs Channel**: ${guildConfig.logsChannelId ? `<#${guildConfig.logsChannelId}>` : 'None'}\n\n`,
            `**Auto Delete Media**: ${guildConfig.media?.autoDelete === true ? 'Yes' : 'No'}\n`,
            `**Auto Delete Delay**: ${mediaDeleteDelay}\n`,
            `**Media Logging Channels**: ${mediaChannels?.join(', ') || 'None'}\n\n`,
            `**Whip Lines**:\n${truncateStringArray(whipLines ?? []).join('\n') || 'None'}`
        ];

        const guildIconUrl = guild.iconURL();
        let headerSection: ContainerBuilderComponents = createTextDisplay(headerLines.join(''));

        if (guildIconUrl) headerSection = createTextSection(
            headerLines.join(''),
            { type: 'thumbnail', url: guildIconUrl }
        );
        
        const container = createContainer([
            headerSection,
            createSeparator(),
            createTextDisplay(lines.join(''))
        ]);

        await context.editOrReply({
            flags: MessageFlags.IsComponentsV2,
            components: [container],
            allowed_mentions: { parse: [] }
        });
    };
};
