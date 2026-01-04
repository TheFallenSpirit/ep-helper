import { createEvent } from 'seyfert';
import { getGuild } from '../store.js';
import MediaLog from '../models/MediaLog.js';

export default createEvent({
    data: { name: 'messageCreate' },
    run: async (message) => {
        if (!message.guildId) return;
        const guildConfig = await getGuild(message.guildId);

        if (!guildConfig) return;
        const channel = await message.channel();

        if (
            guildConfig.mediaChannels?.includes(channel.id) ||
            ('parentId' in channel) && channel.parentId && guildConfig.mediaChannels?.includes(channel.parentId)
        ) {
            if (message.attachments.length > 0) await MediaLog.create({
                guildId: message.guildId,
                authorId: message.author.id,
                channelId: message.channelId,
                messageId: message.id
            });
        };
    }
});
