import { createMiddleware } from 'seyfert';
import { GuildI } from '../models/Guild.js';
import config from '../../config.json' with { type: 'json' };
import { s } from './utilities.js';
import { getGuild } from '../store.js';
import { MessageFlags } from 'seyfert/lib/types/index.js';

const guildConfig = createMiddleware<GuildI>(async ({ next, context }) => {
    if (!config['whitelisted-guilds'].includes(context.guildId!)) return context.editOrReply({
        flags: MessageFlags.Ephemeral,
        content: `Hold up! | This server isn't whitelisted on ${s(context.client.me.username)}.`
    });

    const guildConfig = await getGuild(context.guildId!);
    next(guildConfig);
});

export default {
    guildConfig
};
