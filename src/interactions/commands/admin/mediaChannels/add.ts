import { CommandContext, createChannelOption, Declare, Options, SubCommand } from 'seyfert';
import { mediaChannelTypes } from './mediaChannels.js';
import { s } from '../../../../utilities.js';
import { updateGuild } from '../../../../store.js';

const options = {
    channel: createChannelOption({
        required: true,
        description: 'The channel to add as a media channel.',
        channel_types: mediaChannelTypes
    })
};

@Declare({
    name: 'add',
    description: 'Add a new media channel for logging in this server.'
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options, 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        const channel = context.options.channel;
        const mediaChannels = context.metadata.guildConfig.mediaChannels ?? [];

        if (mediaChannels.length >= 50) return context.editOrReply({
            content: `Hold up! | ${s(guild.name)} can only have a max of 50 media channels.`
        });

        if (mediaChannels.includes(channel.id)) return context.editOrReply({
            content: `Hold up! | ${channel} is already a media channel in ${s(guild.name)}.`
        });

        await updateGuild(guild.id, {
            $addToSet: { mediaChannels: channel.id }
        });

        await context.editOrReply({
            content: `Successfully added ${channel} to ${s(guild.name)}'s media channels.`
        });
    };
};
