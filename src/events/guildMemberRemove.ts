import { sendLogsMessage } from '@/common/index.js';
import { GuildI } from '@/models/Guild.js';
import MediaLog, { MediaLogResult } from '@/models/MediaLog.js';
import { getGuild, redis } from '@/store.js';
import { wait } from '@fallencodes/seyfert-utils';
import dayjs from 'dayjs';
import { createEvent, UsingClient } from 'seyfert';

export default createEvent({
    data: { name: 'guildMemberRemove' },
    run: async (member, client) => {
        const guildConfig = await getGuild(member.guildId);
        if (guildConfig.media?.autoDelete === true) startMediaDeletion(client, guildConfig, member.user.id);
    }
});

async function startMediaDeletion(client: UsingClient, guildConfig: GuildI, userId: string) {
    const deleteDelay = guildConfig.media?.deleteAfterDelay;

    if (deleteDelay) {
        const timestamp = dayjs.utc().add(deleteDelay, 'm').unix();

        await sendLogsMessage(client, guildConfig, {
            content: `User <@${userId}> [\`${userId}\`] left the server, deleting their media <t:${timestamp}:R>.`
        });

        return redis.set(
            `ep_media_delete_hold:${guildConfig.guildId}:${userId}`,
            'true',
            'EX',
            deleteDelay * 60
        );
    }

    await deleteLoggedMedia(client, guildConfig, userId);
};

export async function deleteLoggedMedia(client: UsingClient, guildConfig: GuildI, userId: string) {
    const results: MediaLogResult[] = await MediaLog.find(
        { authorId: userId, guildId: guildConfig.guildId },
        { _id: 0, authorId: 0, createdAt: 0 }
    );

    const deletedItems: string[] = [];
    for await (const item of results) {
        await client.proxy.channels(item.channelId).messages(item.messageId).delete({
            reason: `Automated Action: Media message deletion triggered by user leaving the server`
        }).then(() => deletedItems.push(item.messageId)).catch((error) => {
            if (String(error).includes('404 Not Found')) deletedItems.push(item.messageId);
        });

        await wait(1000);
    };

    await MediaLog.deleteMany({
        messageId: { $in: deletedItems }
    });

    await sendLogsMessage(client, guildConfig, {
        content: `Deleted ${deletedItems.length} logged media messages from <@${userId}> \`${userId}\`.`
    });
};
