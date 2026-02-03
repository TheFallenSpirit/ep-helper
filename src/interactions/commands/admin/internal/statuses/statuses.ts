import { config } from '@/store.js';
import { truncateString } from '@fallencodes/seyfert-utils';
import { AutocompleteInteraction, AutoLoad, Command, Declare, IgnoreCommand, Middlewares } from 'seyfert';

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

export async function statusAutocomplete(interaction: AutocompleteInteraction) {
    const focus = interaction.getInput();

    const statuses = config.data.status.statuses.filter(({ message }) => {
        return message.toLowerCase().includes(focus.toLowerCase());
    });

    await interaction.respond(statuses.map(({ status, message }, index) => {
        return ({ name: truncateString(`[${status}] ${message}`, 100), value: index + 1 });
    }));
};
