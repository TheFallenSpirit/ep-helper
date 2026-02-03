import { config } from '@/store.js';
import { CommandContext, createStringOption, Declare, Options, SubCommand } from 'seyfert';

const options = {
    status: createStringOption({
        required: true,
        description: 'The type of status to add.',
        choices: [
            { name: 'Online', value: 'online' },
            { name: 'Idle', value: 'idle' },
            { name: 'Do Not Disturb', value: 'dnd' }
        ]
    }),
    message: createStringOption({
        required: true,
        description: 'The custom status message.',
        min_length: 4,
        max_length: 100
    })
};

@Declare({
    name: 'add',
    description: `Add a new status to this app's custom statuses.`
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        const status = context.options.status;
        const message = context.options.message;
        const username = context.client.me.username;

        config.data.status.statuses.push({ status, message });
        config.write();

        await context.editOrReply({
            content: `Added custom status (${status}) "${message}" to ${username}'s statuses.`
        });
    };
};
