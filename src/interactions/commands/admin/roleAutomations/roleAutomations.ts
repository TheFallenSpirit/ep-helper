import { AutocompleteInteraction, AutoLoad, Command, Declare, Middlewares } from 'seyfert';
import { getGuild } from '../../../../store.js';

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

export async function roleAutomationsAutocomplete(interaction: AutocompleteInteraction) {
    const guildConfig = await getGuild(interaction.guildId!);
    const roleAutomations = guildConfig.roleAutomations ?? [];

    if (roleAutomations.length < 1) return interaction.respond([
        { name: 'No role automations found.', value: -1 }
    ]);

    await interaction.respond(roleAutomations.map(({ name }, index) => ({ name: name, value: index })));
};
