import { config } from '@/store.js';
import { createEvent } from 'seyfert';

export default createEvent({
    data: { name: 'guildCreate' },
    run: async (guild, client) => {
        const whitelistedGuilds = config.data.whitelistedGuildIds;
        if (whitelistedGuilds.length < 1 || whitelistedGuilds.includes(guild.id)) return;
        
        client.logger.debug(
            `Leaving guild ${guild.name} [${guild.id}] because whitelisted servers is enabled.`
        );
        
        await guild.leave();
    }
});
