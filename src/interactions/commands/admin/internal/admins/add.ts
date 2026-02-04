import { updateAppConfig } from '@/store.js';
import { CommandContext, createUserOption, Declare, Options, SubCommand } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';

const options = {
    user: createUserOption({
        required: true,
        description: 'The user to add to admins.'
    })
};

@Declare({
    name: 'add',
    description: 'Add a new internal admin to this app.'
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        const internalAdmins = context.client.config.internalAdminIds;

        if (internalAdmins.length > 0 && !internalAdmins.includes(context.author.id)) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: `You aren't whitelisted to use internal admin commands.`
        });

        const user = context.options.user;
        const username = context.client.me.username;

        if (internalAdmins.includes(user.id)) return context.editOrReply({
            content: `${user} is already a member of ${username}'s internal admins.`,
            allowed_mentions: { parse: [] }
        });

        await updateAppConfig(
            context.client,
            { $addToSet: { internalAdminIds: user.id } }
        );

        await context.editOrReply({
            content: `Added ${user} to ${username}'s internal admins.`,
            allowed_mentions: { parse: [] }
        });
    };
};
