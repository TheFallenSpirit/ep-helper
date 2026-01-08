import { CommandContext, createChannelOption, Declare, Options, SubCommand } from 'seyfert';
import { mediaChannelTypes } from './mediaChannels.js';
import { updateGuild } from '../../../../store.js';
import { s } from '@fallencodes/seyfert-utils';

const options = {
    channel: createChannelOption({
        required: true,
        description: 'The channel to remove from media channels.',
        channel_types: mediaChannelTypes
    })
};

@Declare({
    name: 'remove',
    description: 'Remove a channel from media logging in this server server'
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options, 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        const channel = context.options.channel;
        const mediaChannels = context.metadata.guildConfig.mediaChannels ?? [];

        if (!mediaChannels.includes(channel.id)) return context.editOrReply({
            content: `Hold up! | ${channel} isn't a media channel in ${s(guild.name)}.`
        });

        await updateGuild(guild.id, {
            $pull: { mediaChannels: channel.id }
        });

        await context.editOrReply({
            content: `Successfully removed ${channel} from ${s(guild.name)}'s media channels.`
        });
    };
};
