import { Client, ClientOptions } from 'seyfert';
import lang, { LangKey, LangProps } from './lang.js';
import { basename } from 'node:path';

export default class EPClient extends Client {
    constructor(options?: ClientOptions) {
        super(options);
        this.events.filter = (path) => !basename(path).startsWith('_');
        this.commands.filter = (path) => !basename(path).startsWith('_');
    };

    public replies(key: LangKey, props?: LangProps) {
        return lang(this, key, props);
    };
};
