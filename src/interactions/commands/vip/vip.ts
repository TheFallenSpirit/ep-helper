import { AutoLoad, Command, Declare, Middlewares } from 'seyfert';

@Declare({
    name: 'vip',
    contexts: ['Guild'],
    integrationTypes: ['GuildInstall'],
    description: 'View or manage your VIP role or reactions in this server.'
})

@AutoLoad()
@Middlewares(['guildConfig', 'vipProfile'])
export default class extends Command {};
