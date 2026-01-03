import { Redis } from 'ioredis';
import Guild, { GuildI } from './models/Guild.js';

export const redis = new Redis(process.env.REDIS_URL ?? '');

export async function getGuild(guildId: string): Promise<GuildI> {
    const rawGuildConfig = await redis.get(`ep_guild:${guildId}`);
    if (rawGuildConfig) return JSON.parse(rawGuildConfig) as GuildI;

    const guildConfig = await Guild.findOne({ guildId }, null, { upsert: true });
    return guildConfig?.toObject()!;
};
