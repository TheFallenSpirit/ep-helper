import { AutoLoad, Command, Declare, Groups, Middlewares } from 'seyfert';
import VIPInfo from './info.js';

@Declare({
    name: 'vip',
    contexts: ['Guild'],
    integrationTypes: ['GuildInstall'],
    description: 'View or manage your VIP role or reactions in this server.'
})

@AutoLoad()
@Middlewares(['guildConfig', 'vipProfile'])

@Groups({
    triggers: { defaultDescription: 'Manage your VIP auto reaction triggers.' },
    reactions: { defaultDescription: 'Manage your VIP auto reactions.' }
})

export default class extends Command {
    run = new VIPInfo().run;
};
