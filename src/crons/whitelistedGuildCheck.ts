import { CronOnCompleteCallback } from 'cron';
import { UsingClient } from 'seyfert';
import config from '../../config.json' with { type: 'json' };

export default async (client: UsingClient, done: CronOnCompleteCallback) => {
    const guildList = client.cache.guilds?.values() ?? [];

    for await (const guild of guildList) {
        if (config['whitelisted-guilds'].includes(guild.id)) continue;
        await guild.leave();
    };

    done();
};
