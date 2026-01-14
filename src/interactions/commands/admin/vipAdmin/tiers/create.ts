import { CommandContext, createNumberOption, createRoleOption, createStringOption, Declare, Group, IgnoreCommand, Options, SubCommand } from 'seyfert';
import { trueOrFalse } from '../../../../../common/variables.js';
import { VIPTier } from '../../../../../models/Guild.js';
import { randomId, s } from '@fallencodes/seyfert-utils';
import { updateGuild } from '../../../../../store.js';

const options = {
    name: createStringOption({
        required: true,
        description: 'The name of the new VIP tier.',
        max_length: 32
    }),
    'vip-role': createRoleOption({
        required: true,
        description: 'The VIP role to link the tier to.'
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
    name: 'create',
    ignore: IgnoreCommand.Message,
    description: 'Create a new VIP tier in this server.'
})

@Group('tiers')
@Options(options)

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options, 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        if ((context.metadata.guildConfig.vipTiers?.size ?? 0) >= 3) return context.editOrReply({
            content: `Hold up! | ${s(guild.name)} can only have a max of 3 VIP tiers.`
        });

        const _id = randomId(8);
        const name = context.options.name;
        const vipRole = context.options['vip-role'];
        const query: Partial<VIPTier> = { _id, name, vipRoleId: vipRole.id };

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

        await updateGuild(guild.id, { $set: { [`vipTiers.${_id}`]: query } });
        await context.editOrReply({ content: `Successfully created VIP tier "${s(name)}".` });
    };
};
