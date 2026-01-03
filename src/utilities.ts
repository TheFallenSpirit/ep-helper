import { customAlphabet } from 'nanoid';

export function s(content: string) {
    return content.replace(/`/g, '\\`').replace(/\*/g, '\\*').replace(/\|/g, '\\|').replace(/_/g, '\\_');
};

export function randomId(length: number) {
    return customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')(length);
};
