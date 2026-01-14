import { s } from '@fallencodes/seyfert-utils';
import { CommandContext, createStringOption, Declare, Group, Options, SubCommand } from 'seyfert';
import { updateVipProfile } from '../../../../store.js';
import VIP from '../../../../models/VIP.js';

const options = {
    trigger: createStringOption({
        required: true,
        description: 'The new trigger to add.',
        min_length: 3,
        max_length: 32
    })
};

@Declare({
    name: 'add',
    description: 'Add a new trigger to your VIP auto reaction triggers.'
})

@Group('triggers')
@Options(options)

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options, 'vipProfile' | 'guildConfig'>) => {
        const vipProfile = context.metadata.vipProfile;
        const vipTier = context.metadata.guildConfig.vipTiers?.get(vipProfile.tierId);
        if (!vipTier) return context.replyWith(context, 'invalidVipTier', { id: vipProfile.tierId });

        if (context.interaction) await context.deferReply(true);
        const triggerLimit = vipTier.reactions?.defaultTriggerLimit;

        if (!triggerLimit) return context.editOrReply({
            content: `Hold up! | Your VIP tier "${s(vipTier.name)}" doesn't have any included auto reactions.`
        });

        const triggerCount = vipProfile.reaction?.triggers?.length ?? 0;
        if (triggerCount >= triggerLimit) return context.editOrReply({
            content: `Hold up! | You have reached your max of ${triggerLimit} auto reaction triggers.`
        });

        const trigger = context.options.trigger.trim();
        const triggerCheck = await VIP.exists({ guildId: context.guildId!, 'reaction.triggers': trigger });

        if (triggerCheck) return context.editOrReply({
            content: `Hold up! | The trigger "${trigger}" is already taken in this server.`
        });

        await updateVipProfile(context.guildId!, context.author.id, { $push: { 'reaction.triggers': trigger } });
        await context.editOrReply({ content: `Successfully added "${trigger}" to your auto reaction triggers.` });
    };
};
