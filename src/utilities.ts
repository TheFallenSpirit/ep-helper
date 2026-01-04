import { DiscordSnowflake, Snowflake } from '@sapphire/snowflake';
import { customAlphabet } from 'nanoid';

export function s(content: string) {
    return content.replace(/`/g, '\\`').replace(/\*/g, '\\*').replace(/\|/g, '\\|').replace(/_/g, '\\_');
};

export function randomId(length: number) {
    return customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')(length);
};

export function isValidSnowflake(snowflake: string) {
	if (!/^\d{17,19}$/.test(snowflake)) return false;
	const epoch = DiscordSnowflake.generate({ timestamp: DiscordSnowflake.epoch });
	return Snowflake.compare(epoch, snowflake) < 0 && Snowflake.compare(snowflake, DiscordSnowflake.generate()) < 0;
};

export function wait(time: number) {
	return new Promise((resolve) => setTimeout(resolve, time));
};
