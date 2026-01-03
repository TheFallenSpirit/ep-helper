import { AutoLoad, Command, Declare, Middlewares } from 'seyfert';

@Declare({
    name: 'role-automations',
    contexts: ['Guild'],
    botPermissions: ['ManageRoles'],
    integrationTypes: ['GuildInstall'],
    defaultMemberPermissions: ['ManageRoles'],
    description: 'Create and manage role automations in this server.'
})

@AutoLoad()
@Middlewares(['guildConfig'])

export default class extends Command {};
