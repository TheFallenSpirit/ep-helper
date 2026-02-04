import { updateAppConfig } from '@/store.js';
import { CommandContext, createUserOption, Declare, Middlewares, Options, SubCommand } from 'seyfert';

const options = {
    user: createUserOption({
        required: true,
        description: 'The user to remove from admins.'
    })
};

@Declare({
    name: 'remove',
    description: 'Remove an internal admin from this app.'
})

@Options(options)
@Middlewares(['internalAccess'])

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        const user = context.options.user;
        const username = context.client.me.username;

        if (!context.client.config.internalAdminIds.includes(user.id)) return context.editOrReply({
            content: `${user} isn't a member of ${username}'s internal admins.`,
            allowed_mentions: { parse: [] }
        });

        await updateAppConfig(
            context.client,
            { $pull: { internalAdminIds: user.id } }
        );

        await context.editOrReply({
            content: `Removed ${user} from ${username}'s internal admins.`,
            allowed_mentions: { parse: [] }
        });
    };
};
