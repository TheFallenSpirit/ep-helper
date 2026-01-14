export const emojiRegex = /\p{RGI_Emoji}/v;
export const roleMentionRegex = /<@&(?<id>\d{17,20})>/;
export const customEmojiRegex = /<a?:(\w+):(\d{17,20})>/;

export const trueOrFalse = [
    { name: 'Yes', value: 'true' },
    { name: 'No', value: 'false' }
];
