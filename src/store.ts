import { Redis } from 'ioredis';
import Guild, { GuildI } from './models/Guild.js';
import { UpdateQuery } from 'mongoose';
import VIP, { VIPProfileI } from './models/VIPProfile.js';
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

export async function getVipProfile(guildId: string, userId: string): Promise<VIPProfileI | undefined> {
    const rawVipProfile = await redis.get(`ep_vip_profile:${guildId}:${userId}`);
    if (rawVipProfile) return JSON.parse(rawVipProfile) as VIPProfileI;

    const dbVipProfile = await VIP.findOne({ guildId, userId });
    if (!dbVipProfile) return;

    const vipProfileObject = dbVipProfile.toObject();
    await redis.set(`ep_vip_profile:${guildId}:${userId}`, JSON.stringify(vipProfileObject, replacer), 'EX', 604800);
    return vipProfileObject;
};

export async function updateVipProfile(guildId: string, userId: string, query: UpdateQuery<VIPProfileI>): Promise<VIPProfileI> {
    const vipProfile = await VIP.findOneAndUpdate({ guildId, userId }, query, { new: true });
    if (!vipProfile) throw new Error(`The specified VIP profile wasn't found -- ${guildId}:${userId}`);

    const vipProfileObject = vipProfile.toObject();
    await redis.set(`ep_vip_profile:${guildId}:${userId}`, JSON.stringify(vipProfileObject, replacer), 'EX', 604800);
    return vipProfileObject;
};

export interface CachedAutoReactionI {
    userId: string;
    roleId?: string;
    items: string[];
    triggers: string[];
}

export async function setCachedAutoReaction(guildId: string, reaction: CachedAutoReactionI) {
    await clearCachedAutoReactions(guildId, reaction.userId);
    if (reaction.items.length < 1) return;
    await redis.sadd(`ep_reactions:${guildId}`, JSON.stringify(reaction, replacer));
};

export async function clearCachedAutoReactions(guildId: string, userId: string) {
    const key = `ep_reactions:${guildId}`;
    const rawReactions = await redis.smembers(key);
    const reactions = rawReactions.map((raw) => JSON.parse(raw, reviver) as CachedAutoReactionI);

    const pipeline = redis.pipeline();
    const userReactions = reactions.filter((reaction) => reaction.userId === userId);
    pipeline.srem(key, userReactions.map((reaction) => JSON.stringify(reaction, replacer)));
    await pipeline.exec();
};
