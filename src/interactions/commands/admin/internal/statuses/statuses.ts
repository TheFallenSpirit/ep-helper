import { AutoLoad, Command, Declare, IgnoreCommand, Middlewares } from 'seyfert';

@Declare({
    name: 'statuses',
    contexts: ['Guild'],
    ignore: IgnoreCommand.Slash,
    integrationTypes: ['GuildInstall'],
    description: 'Add, list, or remove custom statuses to/from this app.'
})

@AutoLoad()
@Middlewares(['internalAccess'])
export default class extends Command {};
