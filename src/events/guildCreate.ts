import { config } from '@/store.js';
import { createEvent } from 'seyfert';

export default createEvent({
    data: { name: 'guildCreate' },
    run: async (guild, client) => {
        const whitelistedGuilds = config.data.whitelistedGuilds;
        if (whitelistedGuilds.length < 1 || whitelistedGuilds.includes(guild.id)) return;
        
        client.logger.debug(`Leaving guild ${guild.name} [${guild.id}].`);
        await guild.leave();
    }
});
