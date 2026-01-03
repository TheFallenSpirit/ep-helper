import { Command, CommandContext, Declare } from 'seyfert';

@Declare({
    name: 'ping',
    description: 'View my gateway and application ping.'
})

export default class extends Command {
    run = async (context: CommandContext) => {
        await context.editOrReply({ content: `${context.client.gateway.latency}ms` });
    };
};
