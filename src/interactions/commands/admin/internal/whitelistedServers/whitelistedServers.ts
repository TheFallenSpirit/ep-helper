import { AutoLoad, Command, Declare, IgnoreCommand, Middlewares } from 'seyfert';

@Declare({
    name: 'whitelisted-servers',
    aliases: ['wls'],
    contexts: ['Guild'],
    ignore: IgnoreCommand.Slash,
    integrationTypes: ['GuildInstall'],
    description: 'Add, list, or remove whitelisted servers to/from this app.'
})

@AutoLoad()
@Middlewares(['internalAccess'])
export default class extends Command {};
