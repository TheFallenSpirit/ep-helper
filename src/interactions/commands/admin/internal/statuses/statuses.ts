import { AutoLoad, Command, Declare, IgnoreCommand, Middlewares } from 'seyfert';
import ListStatuses from './list.js';

@Declare({
    name: 'statuses',
    aliases: ['status'],
    contexts: ['Guild'],
    ignore: IgnoreCommand.Slash,
    integrationTypes: ['GuildInstall'],
    description: 'Add, list, or remove custom statuses to/from this app.',
    props: { category: 'internal' }
})

@AutoLoad()
@Middlewares(['internalAccess'])

export default class extends Command {
    run = new ListStatuses().run;
};
