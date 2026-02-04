import { config } from '@/store.js';
import { CronOnCompleteCallback } from 'cron';
import { UsingClient } from 'seyfert';

export default async (client: UsingClient, done: CronOnCompleteCallback) => {
    config.read();
    
    const guildList = client.cache.guilds?.values() ?? [];
    const whitelistedGuilds = config.data.whitelistedGuildIds;
    if (whitelistedGuilds.length < 1) return done();

    for await (const guild of guildList) {
        if (whitelistedGuilds.includes(guild.id)) continue;
        client.logger.debug(`[GUILD CHECK] Leaving guild ${guild.name} [${guild.id}].`);
        await guild.leave();
    };

    done();
};
