import { AutoLoad, Command, Declare, Middlewares } from 'seyfert';

import ConfigView from './view.js';

@Declare({
    name: 'config',
    contexts: ['Guild'],
    integrationTypes: ['GuildInstall'],
    defaultMemberPermissions: ['ManageGuild'],
    description: `View or manage this server's config and settings.`,
    props: { category: 'admin' }
})

@AutoLoad()
@Middlewares(['guildConfig'])

export default class extends Command {
    run = new ConfigView().run;
};
