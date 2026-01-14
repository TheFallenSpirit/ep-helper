import { CommandContext, createStringOption, Declare, Group, Options, SubCommand } from 'seyfert';
import { setCachedAutoReaction, updateVipProfile } from '../../../../store.js';

const options = {
    emoji: createStringOption({
        required: true,
        description: 'A unicode or custom emoji from this server to remove from your reactions.'
    })
};

@Declare({
    name: 'remove',
    description: 'Remove a reaction from your VIP auto reactions.'
})

@Group('reactions')
@Options(options)

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options, 'vipProfile' | 'guildConfig'>) => {
        let vipProfile = context.metadata.vipProfile;
        const vipTier = context.metadata.guildConfig.vipTiers?.get(vipProfile.tierId);
        if (!vipTier) return context.replyWith(context, 'invalidVipTier', { id: vipProfile.tierId });

        const emoji = context.options.emoji.trim();
        if (context.interaction) await context.deferReply(true);

        if (!vipProfile.reaction?.items?.includes(emoji)) return context.editOrReply({
            content: `Hold up! | The emoji "${emoji}" isn't one of your auto reactions.`
        });

        vipProfile = await updateVipProfile(context.guildId!, context.author.id, { $pull: { 'reaction.items': emoji } });
        await context.editOrReply({ content: `Successfully removed "${emoji}" from your auto reactions.` });

        await setCachedAutoReaction(context.guildId!, {
            userId: context.author.id,
            roleId: vipProfile.role?.id,
            items: vipProfile.reaction?.items ?? [],
            triggers: vipProfile.reaction?.triggers ?? []
        });
    };
};
