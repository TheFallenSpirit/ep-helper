import defaultConfig from '@/common/defaultConfig.js';
import AppConfig from '@/models/AppConfig.js';
import { createEvent, UsingClient } from "seyfert";
import { bold, gray, red } from 'seyfert/lib/common/index.js';
import { ActivityType, PresenceUpdateStatus } from 'seyfert/lib/types/index.js';

export default createEvent({
    data: { name: 'botReady', once: true },
    run: async (user, client) => {
        client.logger.info(`Successfully connected to Discord as ${user.tag}.`);

        let dbConfig = await AppConfig.findOne({ appId: user.id });
        if (!dbConfig) dbConfig = await AppConfig.create({ appId: user.id });

        client.config = dbConfig.toObject();
        await client.uploadCommands({ cachePath: './commands.json' });
        handleStatusChange(client);

        const currentGuilds = client.cache.guilds?.values();
        const wlEnabled = (client.config.whitelistedGuildIds?.length ?? 0) > 0;

        if (currentGuilds && currentGuilds.length > 0) client.logger.debug(
            `${user.tag} is in the following servers:`,
            currentGuilds.map(({ id, name }) => `${name} [${id}]`).join(', ')
        );

        client.logger.info(
            `Whitelisted guilds is ${wlEnabled ? 'enabled' : 'disabled'}.`,
            wlEnabled ? `${user.tag} will automatically leave non-whitelisted servers.`
            : `${user.tag} won't automatically leave non-whitelisted servers.`,
        );

        if (client.config.internalAdminIds.length < 1) console.log(
            gray(`================= ${bold(red('NO INTERNAL ADMINS SPECIFIED'))} =================`),
            `\nThere are NO specified internal admins!`,
            `\nPlease use "ep admins add @user" immediately.`,
            '\nUntil the first admin is added, any user can use this command.',
            gray('\n================================================================')
        );
    }
});

function handleStatusChange(client: UsingClient) {
    setInterval(async () => {
        const statuses = client.config.status?.items ?? [defaultConfig.status?.items?.[0]];
        const status = statuses[Math.floor(Math.random() * statuses.length)]!;
        client.logger.debug(`Setting custom status (${status.status}): ${status.message}`);

        client.gateway.setPresence({
            afk: false,
            since: Date.now(),
            status: status.status as PresenceUpdateStatus,
            activities: [{ type: ActivityType.Custom, state: status.message, name: status.message }]
        });
    }, (client.config.status?.changeInterval ?? 120) * 1000);
};
