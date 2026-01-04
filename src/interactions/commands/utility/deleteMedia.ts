import { Command, CommandContext, createUserOption, Declare, Middlewares, Options } from 'seyfert';
import MediaLog from '../../../models/MediaLog.js';
import { s, wait } from '../../../utilities.js';

const options = {
    user: createUserOption({
        required: true,
        description: 'The user to delete media from.'
    })
};

@Declare({
    name: 'delete-media',
    aliases: ['dm'],
    contexts: ['Guild'],
    botPermissions: ['ManageMessages'],
    integrationTypes: ['GuildInstall'],
    defaultMemberPermissions: ['ManageGuild', 'ManageMessages'],
    description: 'Delete all logged media messages from a user.'  
})

@Options(options)
@Middlewares(['guildConfig'])

export default class extends Command {
    run = async (context: CommandContext<typeof options, 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        const user = context.options.user;
        await context.editOrReply({ content: `Loading! | Fetching media messages from ${user}...` });

        const results: MediaLogResult[] = await MediaLog.find(
            { authorId: user.id, guildId: guild.id },
            { _id: 0, authorId: 0, createdAt: 0 }
        );

        if (results.length < 1) return context.editOrReply({
            content: `There are no logged media messages from ${user} in ${s(guild.name)}.`
        });

        await context.editOrReply({
            content: `Loading! | Deleting ${results.length} media messages from ${user}...`
        });

        const deletedItems: string[] = [];
        for await (const item of results) {
            await context.client.proxy.channels(item.channelId).messages(item.messageId).delete({
                reason: `Staff Action: Media message deletion triggered by @${context.author.username} [${context.author.id}]`
            }).then(() => deletedItems.push(item.messageId)).catch((error) => {
                if (String(error).includes('404 Not Found')) deletedItems.push(item.messageId);
            });

            await wait(1000);
        };

        await MediaLog.deleteMany({
            messageId: { $in: deletedItems }
        });

        await context.editOrReply({
            content: `Successfully deleted ${deletedItems.length} media messages from ${user}.`
        });
    };
};

interface MediaLogResult {
    guildId: string;
    channelId: string;
    messageId: string;
}
