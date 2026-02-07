import { sendLogsMessage } from '@/common/index.js';
import { GuildI } from '@/models/Guild.js';
import { getGuild, redis } from '@/store.js';
import { createEvent, GuildMember, UsingClient } from 'seyfert';

export default createEvent({
    data: { name: 'guildMemberAdd' },
    run: async (member, client) => {
        const guildConfig = await getGuild(member.guildId);
        if (!guildConfig) return;

        cancelMediaDeletion(client, guildConfig, member);
    }
});

async function cancelMediaDeletion(client: UsingClient, guildConfig: GuildI, member: GuildMember) {
    const exists = await redis.exists(`ep_media_delete_hold:${member.guildId}:${member.id}`);
    if (!exists) return;

    await redis.del(
        `ep_media_delete_hold:${member.guildId}:${member.id}`
    );

    await sendLogsMessage(client, guildConfig, {
        content: `User ${member} [\`${member.id}\`] joined the server, media deletion cancelled.`
    });
};
