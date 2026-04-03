import { updateGuild } from '@/store.js';
import { s } from '@fallencodes/seyfert-utils';
import { colorHexOptionValue } from '@fallencodes/seyfert-utils/options';
import { CommandContext, createStringOption, Declare, Options, SubCommand } from 'seyfert';

const options = {
    color: createStringOption({
        required: true,
        description: 'The new default color (hex code).',
        value: colorHexOptionValue
    })
};

@Declare({
    name: 'color',
    description: `Update this server's default color.`
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options, 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        const color = context.options.color;
        await updateGuild(guild.id, { $set: { defaultColor: color } });
        await context.editOrReply({ content: `Successfully updated ${s(guild.name)}'s default color.` });
    };
};
