import { AutoLoad, Command, Declare, Middlewares } from 'seyfert';
import { ChannelType } from 'seyfert/lib/types/index.js';

@Declare({
    name: 'media-channels',
    aliases: ['mc'],
    contexts: ['Guild'],
    integrationTypes: ['GuildInstall'],
    defaultMemberPermissions: ['ManageChannels'],
    description: 'Add or remove media channels for logging in this server.',
    props: { category: 'admin' }
})

@AutoLoad()
@Middlewares(['guildConfig'])
export default class extends Command {};

export const mediaChannelTypes: ChannelType[] = [
    ChannelType.GuildText,
    ChannelType.GuildVoice,
    ChannelType.GuildForum,
    ChannelType.PublicThread,
    ChannelType.GuildCategory
];
