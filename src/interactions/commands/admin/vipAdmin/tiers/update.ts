import { CommandContext, createNumberOption, createRoleOption, createStringOption, Declare, Group, IgnoreCommand, Options, SubCommand } from 'seyfert';
import { vipTiersAutocomplete } from '../vipAdmin.js';
import { VIPTier } from '../../../../../models/Guild.js';
import { trueOrFalse } from '../../../../../common/variables.js';
import { updateGuild } from '../../../../../store.js';
import { s } from '@fallencodes/seyfert-utils';

const options = {
    tier: createStringOption({
        required: true,
        description: 'The VIP tier to update.',
        autocomplete: vipTiersAutocomplete
    }),
    name: createStringOption({
        description: 'The new name of the new VIP tier.',
        max_length: 32
    }),
    'vip-role': createRoleOption({
        description: 'The new VIP role to link the tier to.'
    }),
    'role-enabled': createStringOption({
        description: 'If VIP roles should be enabled.',
        choices: trueOrFalse
    }),
    'role-member-limit': createNumberOption({
        description: 'The default member limit for VIP roles (default: 10, min: 3, max: 50).',
        min_value: 3,
        max_value: 50
    }),
    'trigger-limit': createNumberOption({
        description: 'The default reaction trigger limit for VIP auto reactions (leave blank to disable, min: 1, max: 3).',
        min_value: 1,
        max_value: 3
    }),
    'reaction-limit': createNumberOption({
        description: 'The default reaction limit for VIP auto reactions (leave blank to disable, min: 2, max: 5).',
        min_value: 2,
        max_value: 5
    })
};

@Declare({
    name: 'update',
    ignore: IgnoreCommand.Message,
    description: 'Update a VIP tier in this server.'
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
            content: `Hold up! | The specified VIP tier "${vipTierId}" doesn't exist.`
        });

        const query: Partial<VIPTier> = { ...vipTier };
        if (context.options.name) Object.assign(query, { name: context.options.name });

        if (context.options['vip-role']) Object.assign(query, {
            vipRoleId: context.options['vip-role'].id
        });
 
        if (context.options['role-enabled']) Object.assign(query, {
            'role.enabled': context.options['role-enabled'] === 'true'
        });

        if (context.options['role-member-limit']) Object.assign(query, {
            'role.defaultMemberLimit': context.options['role-member-limit']
        });

        if (context.options['trigger-limit']) Object.assign(query, {
            'reactions.defaultTriggerLimit': context.options['trigger-limit']
        });

        if (context.options['reaction-limit']) Object.assign(query, {
            'reactions.defaultReactionLimit': context.options['reaction-limit']
        });

        console.log(query);
        await updateGuild(guild.id, { $set: { [`vipTiers.${vipTierId}`]: query } });
        await context.editOrReply({ content: `Successfully updated VIP tier "${s(query.name ?? '')}".` });
    };
};
