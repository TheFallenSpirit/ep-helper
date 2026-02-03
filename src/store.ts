import { Redis } from 'ioredis';
import Guild, { GuildI } from './models/Guild.js';
import { UpdateQuery } from 'mongoose';
import { replacer, reviver } from '@fallencodes/seyfert-utils';

export const redis = new Redis(process.env.REDIS_URL ?? '');

export async function getGuild(guildId: string): Promise<GuildI> {
    const rawGuildConfig = await redis.get(`ep_guild:${guildId}`);
    if (rawGuildConfig) return JSON.parse(rawGuildConfig, reviver) as GuildI;

    let guildConfig = await Guild.findOne({ guildId });
    if (!guildConfig) guildConfig = await Guild.create({ guildId });

    const guildConfigObject = guildConfig.toObject();
    await redis.set(`ep_guild:${guildId}`, JSON.stringify(guildConfigObject, replacer), 'EX', 604800);
    return guildConfigObject;
};

export async function updateGuild(guildId: string, query: UpdateQuery<GuildI>): Promise<GuildI> {
    const guildConfig = await Guild.findOneAndUpdate({ guildId }, query, { new: true });
    if (!guildConfig) throw new Error(`The specified guild wasn't found -- ${guildId}`);

    const guildConfigObject = guildConfig.toObject();
    await redis.set(`ep_guild:${guildId}`, JSON.stringify(guildConfigObject, replacer), 'EX', 604800);
    return guildConfigObject;
};
