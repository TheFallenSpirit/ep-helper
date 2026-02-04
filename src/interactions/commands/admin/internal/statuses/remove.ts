import { CommandContext, createNumberOption, Declare, Options, SubCommand } from 'seyfert';
import { updateAppConfig } from '@/store.js';
import { MessageFlags } from 'seyfert/lib/types/index.js';

const options = {
    status: createNumberOption({
        required: true,
        description: 'The custom status to remove.'
    })
};

@Declare({
    name: 'remove',
    description: `Remove a custom status from this app's custom statuses.`
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        const index = context.options.status - 1;
        const status = context.client.config.status?.items?.[index];

        if (!status) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: `The specified status index "${index}" wasn't found.`
        });

        const username = context.client.me.username;
        await updateAppConfig(context.client, { $pull: { 'status.items': status } });

        await context.editOrReply({
            content: `Removed custom status (${status.status}) "${status.message}" from ${username}'s statuses.`
        });
    };
};
