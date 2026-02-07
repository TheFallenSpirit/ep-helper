import { getGuild } from '@/store.js';
import { createEvent, UsingClient } from 'seyfert';
import { deleteLoggedMedia } from '../guildMemberRemove.js';

export default createEvent({
    data: { name: 'redisExpiry' },
    run: async (message, client) => {
        const key = message.split(':').at(0)!;
        const args = message.split(':').slice(1);

        switch (key) {
            case 'ep_media_delete_hold': handleMediaDeletion(client, args[0]!, args[1]!); break;
        };
    }
});

async function handleMediaDeletion(client: UsingClient, guildId: string, userId: string) {
    const guildConfig = await getGuild(guildId);
    if (!guildConfig) return;

    await deleteLoggedMedia(client, guildConfig, userId);
};
