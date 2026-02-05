import { AutoLoad, Command, Declare, IgnoreCommand } from 'seyfert';

@Declare({
    name: 'admins',
    contexts: ['Guild'],
    ignore: IgnoreCommand.Slash,
    integrationTypes: ['GuildInstall'],
    description: 'Add, list, or remove internal admins to/from this app.',
    props: { category: 'internal' }
})

@AutoLoad()
export default class extends Command {};
