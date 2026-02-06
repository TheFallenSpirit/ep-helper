import { updateProfile } from '@/store.js';
import { s } from '@fallencodes/seyfert-utils';
import { Command, CommandContext, createStringOption, Declare, Middlewares, Options } from 'seyfert';

const options = {
    opt: createStringOption({
        required: true,
        description: 'If you want to be opted-in or opted-out.',
        choices: [{ name: 'In', value: 'in' }, { name: 'Out', value: 'out' }]
    })
};

@Declare({
    name: 'opt',
    contexts: ['Guild'],
    integrationTypes: ['GuildInstall'],
    description: 'Opt-in or opt-out of roleplay features in this server.',
    props: { category: 'utility' }
})

@Options(options)
@Middlewares(['profile', 'guildConfig'])

export default class extends Command {
    run = async (context: CommandContext<typeof options, 'profile'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        const opt = context.options.opt === 'in';
        const optText = opt ? 'opted-in to' : 'opted-out of';

        if (context.metadata.profile.rpEnabled === opt) return context.editOrReply({
            content: `Hold up! You're already ${optText} roleplay features in ${s(guild.name)}.`
        });

        await updateProfile(guild.id, context.author.id, { $set: { rpEnabled: opt } });
        await context.editOrReply({ content: `Successfully ${optText} roleplay features in ${s(guild.name)}.` });
    };
};
