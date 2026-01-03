import { createEvent, UsingClient } from "seyfert";
import config from '../../config.json' with { type: 'json' };
import { ActivityType, PresenceUpdateStatus } from 'seyfert/lib/types/index.js';

export default createEvent({
    data: { name: 'botReady', once: true },
    run: async (user, client) => {
        client.logger.info(`Successfully connected to Discord as ${user.tag}.`);

        const currentGuilds = client.cache.guilds?.values().map(({ id, name }) => `${name} [${id}]`);
        client.logger.debug(`App in the following servers: ${currentGuilds?.join(', ')}`);

        await client.uploadCommands({ cachePath: './commands.json' });
        if (config.status.statuses.length > 0) handleRotatingStatus(client);
    }
});

function setPresence(client: UsingClient, presence: typeof config.status.statuses[number]) {
    client.logger.debug(`Setting custom status (${presence.status}): ${presence.message}`);

    client.gateway.setPresence({
        afk: false,
        since: Date.now(),
        status: presence.status as PresenceUpdateStatus,
        activities: [{ type: ActivityType.Custom, state: presence.message, name: presence.message }]
    });
};

async function handleRotatingStatus(client: UsingClient) {
    if (config.status.statuses.length === 1) return setPresence(client, config.status.statuses[0]!);

    setInterval(async () => {
        const presence = config.status.statuses[Math.floor(Math.random() * config.status.statuses.length)]!;
        setPresence(client, presence);
    }, config.status['change-interval'] * 1000);
};
