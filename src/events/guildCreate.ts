import { createEvent } from 'seyfert';
import config from '../../config.json' with { type: 'json' };

export default createEvent({
    data: { name: 'guildCreate' },
    run: async (guild, client) => {
        if (config['whitelisted-guilds'].includes(guild.id)) return;
        client.logger.debug(`Leaving guild ${guild.name} [${guild.id}].`);
        await guild.leave();
    }
});
