import { CommandContext, Declare, Group, SubCommand } from 'seyfert';
import { updateVipProfile } from '../../../../store.js';

@Declare({
    name: 'clear',
    description: 'Remove all reactions from your VIP auto reactions.'
})

@Group('reactions')
export default class extends SubCommand {
    run = async (context: CommandContext<{}, 'vipProfile' | 'guildConfig'>) => {
        const vipProfile = context.metadata.vipProfile;
        const vipTier = context.metadata.guildConfig.vipTiers?.get(vipProfile.tierId);
        if (!vipTier) return context.replyWith(context, 'invalidVipTier', { id: vipProfile.tierId });
        
        if (context.interaction) await context.deferReply(true);
        if ((vipProfile.reaction?.items?.length ?? 0) < 1) return context.editOrReply({
            content: `Hold up! | You don't have any auto reactions.`
        });

        await updateVipProfile(context.guildId!, context.author.id, { $unset: { 'reaction.items': [] } });
        await context.editOrReply({ content: `Successfully cleared your auto reactions.` });
    };
};
