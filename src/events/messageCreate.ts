import { AllGuildTextableChannels, createEvent, Message } from 'seyfert';
import { getGuild } from '../store.js';
import MediaLog from '../models/MediaLog.js';
import { GuildI } from '../models/Guild.js';

export default createEvent({
    data: { name: 'messageCreate' },
    run: async (message) => {
        if (!message.guildId || message.author.bot) return;
        const guild = await message.guild();
        if (!guild) return;

        const guildConfig = await getGuild(message.guildId);
        if (!guildConfig) return;

        const channel = await message.channel();
        if (!channel.isGuildTextable()) return;

        handleMediaLogging(message, guildConfig, channel);
    }
});

async function handleMediaLogging(message: Message, guildConfig: GuildI, channel: AllGuildTextableChannels) {
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
};
