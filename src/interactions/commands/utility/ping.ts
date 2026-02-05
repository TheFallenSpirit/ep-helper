import { Command, CommandContext, Declare } from 'seyfert';

@Declare({
    name: 'ping',
    description: 'View my gateway and application ping.',
    props: { category: 'utility' }
})

export default class extends Command {
    run = async (context: CommandContext) => {
        await context.editOrReply({ content: `${context.client.gateway.latency}ms` });
    };
};
