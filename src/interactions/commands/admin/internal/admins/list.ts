import { config } from '@/store.js';
import { name } from '@fallencodes/seyfert-utils';
import { createContainer, createTextDisplay } from '@fallencodes/seyfert-utils/components/message';
import { CommandContext, Declare, Middlewares, SubCommand, User } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';

@Declare({
    name: 'list',
    description: 'View a list of all internal admins on this app.'
})

@Middlewares(['internalAccess'])
export default class extends SubCommand {
    run = async (context: CommandContext) => {
        const internalAdmins: User[] = [];

        for await (const userId of config.data.internalAdminIds) {
            const user = await context.client.users.fetch(userId);
            internalAdmins.push(user);
        };

        const lines = [
            `### Internal Admins - ${context.client.me.username}\n`,
            internalAdmins.map((user) => `- ${name(user, 'display-username-s')}`).join('\n')
        ];

        await context.editOrReply({
            flags: MessageFlags.IsComponentsV2,
            components: [createContainer([createTextDisplay(lines.join(''))])]
        });
    };
};
