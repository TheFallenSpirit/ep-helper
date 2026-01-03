import { CronJob } from 'cron';
import dayjs from 'dayjs';
import { Logger, UsingClient } from 'seyfert';
import { bgRed, bold, cyan, dim, gray, LogLevels, red, yellow } from 'seyfert/lib/common/index.js';
import whitelistedGuildCheck from './crons/whitelistedGuildCheck.js';

Logger.customize((_, level, args) => {
    let color = red;

    switch (level) {
        case LogLevels.Info: color = cyan; break;
        case LogLevels.Debug: color = dim; break;
        case LogLevels.Warn: color = yellow; break;
        case LogLevels.Fatal: color = bgRed; break;
    };

    return [
        brackets(gray(dayjs().format('YYYY-MM-DD HH:mm:ss'))),
        brackets(dim(`RSS: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MiB`)),
        brackets(color(Logger.prefixes.get(level) ?? 'UNKNOWN')),
        ...args
    ];
});

function brackets(content: string) {
    return `${bold(gray('['))}${content}${bold(gray(']'))}`;
};

export function environmentCheck() {
    const envKeys = ['DISCORD_TOKEN'];
    for (const key of envKeys) if (!process.env[key]) {
        console.error(`Required environment variable "${key}" wasn't provided.`);
        process.exit(1);
    };
};

export function startCrons(client: UsingClient) {
    CronJob.from({
        start: true,
        cronTime: '0 0 * * *',
        onTick: (done) => whitelistedGuildCheck(client, done),
        onComplete: () => client.logger.debug('[CRON] Successfully completed whitelistedGuildCheck job.')
    });
};
