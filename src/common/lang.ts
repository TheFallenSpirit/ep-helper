import { s } from '@fallencodes/seyfert-utils';
import { UsingClient } from 'seyfert';

export type LangKey = keyof typeof lines;
export type LangProps = Record<string, any>;

export default (client: UsingClient, key: LangKey, props: Record<string, any> = {}) => {
    let line = lines[key].replaceAll('{self}', s(client.me.username));

    return Object.entries(props).reduce((accumulator, [key, value]) => {
        return accumulator.replaceAll(`{${key}}`, s((value ?? 'undefined').toString()));
    }, line);
};

const lines = {
    invalidUser: "Hold up! | This interaction isn't meant for you.",
    guildUnavailable: "Hold up! | {self} wasn't able to fetch this server's info, please try again later."
};
