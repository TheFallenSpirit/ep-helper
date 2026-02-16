import { AutoLoad, Command, Declare, IgnoreCommand, Middlewares } from 'seyfert';
import WhitelistedServersList from './list.js';

@Declare({
    name: 'wls',
    contexts: ['Guild'],
    ignore: IgnoreCommand.Slash,
    integrationTypes: ['GuildInstall'],
    description: 'Add, list, or remove whitelisted servers to/from this app.',
    props: { category: 'internal' }
})

@AutoLoad()
@Middlewares(['internalAccess'])

export default class extends Command {
    run = new WhitelistedServersList().run;
};
