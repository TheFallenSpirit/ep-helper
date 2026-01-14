import { s } from '@fallencodes/seyfert-utils';
import { CommandContext, createStringOption, Declare, Group, Options, SubCommand } from 'seyfert';
import { customEmojiRegex, emojiRegex } from '../../../../common/variables.js';
import { setCachedAutoReaction, updateVipProfile } from '../../../../store.js';

const options = {
    emoji: createStringOption({
        required: true,
        description: 'A unicode or custom emoji from this server to add to your reactions.'
    })
};

@Declare({
    name: 'add',
    description: 'Add a new reaction to your VIP auto reactions.'
})

@Group('reactions')
@Options(options)

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options, 'vipProfile' | 'guildConfig'>) => {
        let vipProfile = context.metadata.vipProfile;
        const vipTier = context.metadata.guildConfig.vipTiers?.get(vipProfile.tierId);
        if (!vipTier) return context.replyWith(context, 'invalidVipTier', { id: vipProfile.tierId });

        if (context.interaction) await context.deferReply(true);
        const reactionLimit = vipTier.reactions?.defaultReactionLimit;

        if (!reactionLimit) return context.editOrReply({
            content: `Hold up! | Your VIP tier "${s(vipTier.name)}" doesn't have any included auto reactions.`
        });

        const reactionCount = vipProfile.reaction?.items?.length ?? 0;
        if (reactionCount >= reactionLimit) return context.editOrReply({
            content: `Hold up! | You have reached your max of ${reactionLimit} auto reactions.`
        });

        let isValidEmoji = false;
        const emoji = context.options.emoji.trim();
        const match = emoji.match(customEmojiRegex);

        if (match && match[2]) {
            const emojiObject = await context.client.emojis.fetch(context.guildId!, match[2]).catch(() => {});
            if (emojiObject && emojiObject.guildId === context.guildId) isValidEmoji = true;
        };

        if (!isValidEmoji && emojiRegex.test(emoji)) isValidEmoji = true;
        if (!isValidEmoji) return context.editOrReply({
            content: `Hold up! | The emoji "${emoji}" isn't a valid emoji in this server.`
        });
        
        if (vipProfile.reaction?.items?.includes(emoji)) return context.editOrReply({
            content: `Hold up! | The emoji "${emoji}" is already in your auto reactions.`
        });

        vipProfile = await updateVipProfile(context.guildId!, context.author.id, { $push: { 'reaction.items': emoji } });
        await context.editOrReply({ content: `Successfully added "${emoji}" to your auto reactions.` });

        await setCachedAutoReaction(context.guildId!, {
            userId: context.author.id,
            roleId: vipProfile.role?.id,
            items: vipProfile.reaction?.items ?? [],
            triggers: vipProfile.reaction?.triggers ?? []
        });
    };
};
