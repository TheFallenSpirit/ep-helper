import { CommandContext, Declare, Group, SubCommand } from 'seyfert';
import { setCachedAutoReaction, updateVipProfile } from '../../../../store.js';

@Declare({
    name: 'clear',
    description: 'Remove all triggers from your VIP auto reaction triggers.'
})

@Group('triggers')
export default class extends SubCommand {
    run = async (context: CommandContext<{}, 'vipProfile' | 'guildConfig'>) => {
        let vipProfile = context.metadata.vipProfile;
        const vipTier = context.metadata.guildConfig.vipTiers?.get(vipProfile.tierId);
        if (!vipTier) return context.replyWith(context, 'invalidVipTier', { id: vipProfile.tierId });

        if (context.interaction) await context.deferReply(true);
        if ((vipProfile.reaction?.triggers?.length ?? 0) < 1) return context.editOrReply({
            content: `Hold up! | You don't have any auto reaction triggers.`
        });

        vipProfile = await updateVipProfile(context.guildId!, context.author.id, { $unset: { 'reaction.triggers': [] } });
        await context.editOrReply({ content: `Successfully cleared your auto reaction triggers.` });

        await setCachedAutoReaction(context.guildId!, {
            userId: context.author.id,
            roleId: vipProfile.role?.id,
            items: vipProfile.reaction?.items ?? [],
            triggers: vipProfile.reaction?.triggers ?? []
        });
    };
};
