import { CommandContext, createStringOption, Declare, Group, Options, SubCommand } from 'seyfert';
import { updateVipProfile } from '../../../../store.js';

const options = {
    trigger: createStringOption({
        required: true,
        description: 'The trigger to remove.',
        min_length: 3,
        max_length: 32
    })
};

@Declare({
    name: 'remove',
    description: 'Remove a trigger from your VIP auto reaction triggers.'
})

@Group('triggers')
@Options(options)

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options, 'vipProfile' | 'guildConfig'>) => {
        const vipProfile = context.metadata.vipProfile;
        const vipTier = context.metadata.guildConfig.vipTiers?.get(vipProfile.tierId);
        if (!vipTier) return context.replyWith(context, 'invalidVipTier', { id: vipProfile.tierId });

        const trigger = context.options.trigger.trim();
        if (context.interaction) await context.deferReply(true);

        if (!vipProfile.reaction?.triggers?.includes(trigger)) return context.editOrReply({
            content: `Hold up! | The trigger "${trigger}" isn't one of your triggers.`
        });

        await updateVipProfile(context.guildId!, context.author.id, { $pull: { 'reaction.triggers': trigger } });
        await context.editOrReply({ content: `Successfully removed "${trigger}" from your auto reaction triggers.` });
    };
};
