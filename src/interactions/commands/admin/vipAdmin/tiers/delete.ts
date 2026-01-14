import { CommandContext, createStringOption, Declare, Group, IgnoreCommand, Options, SubCommand } from 'seyfert';
import { vipTiersAutocomplete } from '../vipAdmin.js';
import { updateGuild } from '../../../../../store.js';
import { s } from '@fallencodes/seyfert-utils';

const options = {
    tier: createStringOption({
        required: true,
        description: 'The VIP tier to delete.',
        autocomplete: vipTiersAutocomplete
    })
};

@Declare({
    name: 'delete',
    ignore: IgnoreCommand.Message,
    description: 'Delete a VIP tier in this server.'
})

@Group('tiers')
@Options(options)

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options, 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        const vipTierId = context.options.tier;
        const guildConfig = context.metadata.guildConfig;
        const vipTier = guildConfig.vipTiers?.get(vipTierId);

        if (!vipTier) return context.editOrReply({
            content: `Hold up! | The specified VIP tier "${vipTierId}" wasn't found.`
        });

        await updateGuild(guild.id, { $unset: { [`vipTiers.${vipTierId}`]: {} } });
        await context.editOrReply({ content: `Successfully deleted VIP tier "${s(vipTier.name)}".` });
    };
};
