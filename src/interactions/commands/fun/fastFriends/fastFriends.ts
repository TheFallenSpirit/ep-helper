import { AutoLoad, Command, Declare, Middlewares } from 'seyfert';

@Declare({
    name: 'fast-friends',
    aliases: ['ff'],
    contexts: ['Guild'],
    botPermissions: ['Administrator'],
    integrationTypes: ['GuildInstall'],
    description: 'Join, leave, or manage a fast friends game.',
    props: { category: 'fun' }
})

@AutoLoad()
@Middlewares(['guildConfig'])

export default class extends Command {};
