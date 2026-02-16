import { AutoLoad, Command, Declare, IgnoreCommand } from 'seyfert';
import AdminsList from './list.js'

@Declare({
    name: 'admins',
    aliases: ['admin'],
    contexts: ['Guild'],
    ignore: IgnoreCommand.Slash,
    integrationTypes: ['GuildInstall'],
    description: 'Add, list, or remove internal admins to/from this app.',
    props: { category: 'internal' }
})

@AutoLoad()

export default class extends Command {
    run = new AdminsList().run;
};
