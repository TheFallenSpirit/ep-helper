import { updateGuild } from '@/store.js';
import { s } from '@fallencodes/seyfert-utils';
import { CommandContext, createChannelOption, Declare, Options, SubCommand } from 'seyfert';
import { PermissionsBitField } from 'seyfert/lib/structures/extra/Permissions.js';
import { ChannelType } from 'seyfert/lib/types/index.js';

const channelPermissions = new PermissionsBitField([
    'ViewChannel',
    'SendMessages',
    'MentionEveryone',
    'UseExternalEmojis'
]);

const options = {
    channel: createChannelOption({
        description: 'A new channel for bot logs.',
        channel_types: [ChannelType.GuildText]
    })
};

@Declare({
    name: 'logs',
    description: 'Update the app logging channel in this server.'
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options, 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        const me = await context.me();
        if (!me) return context.replyWith(context, 'noGuildMember', { self: context.client.me.username });

        const channel = context.options.channel;
        if (!channel) return context.editOrReply({
            content: `Hold up! You didn't specify a new logs channel silly.`
        });

        const permissions = await channel.memberPermissions(me);
        if (!permissions.has(channelPermissions.keys())) return context.editOrReply({
            content: `Hold up! I don't have proper message perms in ${channel}.`
        });

        await updateGuild(guild.id, { $set: { logsChannelId: channel.id } });
        await context.editOrReply({ content: `Successfully set ${s(guild.name)}'s logs channel to ${channel}.` });
    };
};
