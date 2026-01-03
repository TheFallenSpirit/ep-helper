import { CommandContext, createRoleOption, createStringOption, Declare, Options, SubCommand } from 'seyfert';
import { isValidSnowflake, s } from '../../../../utilities.js';
import { roleMentionRegex } from '../../../../common.js';
import { updateGuild } from '../../../../store.js';

const options = {
    name: createStringOption({
        required: true,
        max_length: 32,
        description: 'The name of the role automation.'
    }),
    type: createStringOption({
        required: true,
        description: 'The type of role automation to create.',
        choices: [
            { name: 'Add on Role Add', value: 'add-on-add' },
            { name: 'Remove on Role Add', value: 'remove-on-add' }
        ]
    }),
    'primary-role': createRoleOption({
        required: true,
        description: 'The role to add or remove when the automation is triggered.'
    }),
    'trigger-roles': createStringOption({
        required: true,
        description: 'A comma separated list of roles that will trigger this automation.'
    })
};

@Declare({
    name: 'create',
    description: 'Create a new role automation in this server.'
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options, 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        const existingAutomations = context.metadata.guildConfig.roleAutomations ?? [];
        if (existingAutomations.length >= 25) return context.editOrReply({
            content: `Hold up! | ${s(guild.name)} can only have a max of 25 role automations.`
        });

        const triggerRoles: string[] = [];
        const rawTriggerRoles = context.options['trigger-roles'].split(',').map((role) => role.trim());

        for (const role of rawTriggerRoles) {
            let roleId: string | undefined;
            if (isValidSnowflake(role)) roleId = role;
            
            if (!roleId) {
                const match = role.match(roleMentionRegex);
                if (match?.[1]) roleId = match[1];
            };
            
            if (!roleId) return context.editOrReply({
                content: `Hold up! | "${role}" isn't a valid role mention or ID.`
            });

            triggerRoles.push(roleId);
        };

        const newAutomation = {
            name: context.options.name,
            type: context.options.type,
            triggerRoleIds: triggerRoles,
            primaryRoleId: context.options['primary-role'].id,
        };

        await updateGuild(guild.id, { $push: { roleAutomations: newAutomation } });
        await context.editOrReply({ content: `Successfully created new role automation \`${context.options.name}\`.` });
    };
};
