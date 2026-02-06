import { Redis } from 'ioredis';
import Guild, { GuildI } from './models/Guild.js';
import { UpdateQuery } from 'mongoose';
import { replacer, reviver } from '@fallencodes/seyfert-utils';
import { UsingClient } from 'seyfert';
import AppConfig, { AppConfigI } from './models/AppConfig.js';
import Profile, { ProfileI } from './models/Profile.js';

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

export async function updateAppConfig(client: UsingClient, query: UpdateQuery<AppConfigI>): Promise<AppConfigI> {
    const appConfig = await AppConfig.findOneAndUpdate({ appId: client.me.id }, query, { new: true });
    if (!appConfig) throw new Error(`The specified app config wasn't found -- ${client.me.id}`);

    client.config = appConfig.toObject();
    return client.config;
};

export async function getProfile(guildId: string, userId: string): Promise<ProfileI | undefined> {
    const rawProfile = await redis.get(`ep_profile:${guildId}:${userId}`);
    if (rawProfile) return JSON.parse(rawProfile, reviver) as ProfileI;

    const profile = await Profile.findOne({ guildId, userId });
    if (!profile) return;

    const profileObject = profile.toObject();
    await redis.set(`ep_profile:${guildId}:${userId}`, JSON.stringify(profileObject, replacer), 'EX', 604800);
    return profileObject;
};

export async function updateProfile(guildId: string, userId: string, query: UpdateQuery<ProfileI>): Promise<ProfileI> {
    const profile = await Profile.findOneAndUpdate({ guildId, userId }, query, { new: true });
    if (!profile) throw new Error(`The specified profile wasn't found -- ${guildId}:${userId}`);

    const profileObject = profile.toObject();
    await redis.set(`ep_profile:${guildId}:${userId}`, JSON.stringify(profileObject, replacer), 'EX', 604800);
    return profileObject;
};
