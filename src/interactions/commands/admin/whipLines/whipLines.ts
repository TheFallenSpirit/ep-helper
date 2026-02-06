import { getGuild } from '@/store.js';
import { truncateString } from '@fallencodes/seyfert-utils';
import { AutocompleteInteraction, AutoLoad, Command, Declare, Middlewares } from 'seyfert';

@Declare({
    name: 'whip-lines',
    aliases: ['wl'],
    contexts: ['Guild'],
    integrationTypes: ['GuildInstall'],
    defaultMemberPermissions: ['ManageGuild'],
    description: 'Add or remove whip lines to/from this server.'
})

@AutoLoad()
@Middlewares(['guildConfig'])
export default class extends Command {};

export async function linesAutocomplete(interaction: AutocompleteInteraction) {
    const guildConfig = await getGuild(interaction.guildId!);

    const whipLines = guildConfig.whipLines ?? [];
    if (whipLines.length < 1) return interaction.respond([{ name: 'No whip lines', value: -1 }]);

    await interaction.respond(whipLines.map((line) => ({
        name: truncateString(line, 100),
        value: whipLines.indexOf(line)
    })));
};
