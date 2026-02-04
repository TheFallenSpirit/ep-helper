import { AnyContext, UsingClient } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';
import lang, { LangKey, LangProps } from './common/lang.js';

export function environmentCheck() {
    const envKeys = ['DISCORD_TOKEN', 'MONGO_URL', 'REDIS_URL'];
    for (const key of envKeys) if (!process.env[key]) {
        console.error(`Required environment variable "${key}" wasn't provided.`);
        process.exit(1);
    };
};

export function startCrons(_client: UsingClient) {
    // CronJob.from({
    //     start: true,
    //     cronTime: '0 0 * * *',
    //     onTick: (done) => whitelistedGuildCheck(client, done),
    //     onComplete: () => client.logger.debug('[CRON] Successfully completed whitelistedGuildCheck job.')
    // });
};

export const extendedContext = (_interaction: any) => ({
    replyWith: (context: AnyContext, key: LangKey, props?: LangProps) => {
        return context.editOrReply({ flags: MessageFlags.Ephemeral, content: lang(context.client, key, props) });
    }
});
