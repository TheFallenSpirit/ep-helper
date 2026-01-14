import { AutocompleteInteraction, AutoLoad, Command, Declare, Groups, Middlewares } from 'seyfert';
import { getGuild } from '../../../../store.js';

@Declare({
    name: 'vip-admin',
    contexts: ['Guild'],
    integrationTypes: ['GuildInstall'],
    defaultMemberPermissions: ['ManageGuild'],
    description: 'Manage VIP tiers or VIP profiles in this server.'
})

@Groups({
    tiers: { defaultDescription: 'Create or manage VIP tiers in this server.' }
})

@AutoLoad()
@Middlewares(['guildConfig'])
export default class extends Command {};

export async function vipTiersAutocomplete(interaction: AutocompleteInteraction) {
    const guildConfig = await getGuild(interaction.guildId!);
    if (!guildConfig.vipTiers || guildConfig.vipTiers.size < 1) return interaction.respond([
        { name: 'No vip tiers found', value: 'null' }
    ]);

    await interaction.respond(Array.from(guildConfig.vipTiers).map(([tierId, tier]) => {
        return ({ name: `${tier.name} [${tierId}]`, value: tierId });
    }));
};
