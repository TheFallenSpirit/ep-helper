import { basename } from 'path';
import { Client, ClientOptions } from 'seyfert';
import lang, { LangKey, LangProps } from './common/lang.js';
import defaultConfig from './common/defaultConfig.js';
import { AppConfigI } from './models/AppConfig.js';

export default class EPClient extends Client {
    public config: AppConfigI = defaultConfig;
    public commandMap: string[] = [];

    constructor(options?: ClientOptions) {
        super(options);
        this.events.filter = (path) => !basename(path).startsWith('_');
        this.commands.filter = (path) => !basename(path).startsWith('_');
    };

    public replies(key: LangKey, props?: LangProps) {
        return lang(this, key, props);
    };

    public getCommand (name: string) {
        const command = this.commandMap.find((mention) => mention.replace('</', '').split(':').at(0) === name);
        return command ?? `\`/${name}\``;
    };
};
