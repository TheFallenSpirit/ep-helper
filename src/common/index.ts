import { GuildI } from '@/models/Guild.js';
import { UsingClient } from 'seyfert';
import { MessageCreateBodyRequest } from 'seyfert/lib/common/index.js';

export async function sendLogsMessage(client: UsingClient, guildConfig: GuildI, body: MessageCreateBodyRequest) {
    if (!guildConfig.logsChannelId) return false;
    return await client.messages.write(guildConfig.logsChannelId, body).then(() => true).catch(() => false);
};
