import { redis } from '@/store.js';
import { name, s } from '@fallencodes/seyfert-utils';
import { createContainer, createTextDisplay } from '@fallencodes/seyfert-utils/components/message';
import { CommandContext, Declare, GuildMember, SubCommand, User } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';

@Declare({
    name: 'list',
    description: 'View all current fast friends participants.',
    defaultMemberPermissions: ['ManageEvents']
})

export default class extends SubCommand {
    run = async (context: CommandContext) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        const channel = await context.channel();
        if (!channel.isVoice() && !channel.isStage()) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'Hold up! You must use this command in a voice or stage channel.'
        });

        const channelId = await redis.get(`ep_ff_active:${context.guildId}`);
        if (!channelId || channel.id !== channelId) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'Hold up! You must use this command in the channel you started the session in.'
        });

        const members: (User | GuildMember)[] = [];
        const memberIds = await redis.smembers(`ep_ff_members:${context.guildId}`);

        for await (const userId of memberIds) {
            const user = await context.client.users.fetch(userId);
            const member = context.client.cache.members?.get(userId, context.guildId!);
            members.push(member ?? user);
        };

        const lines = [
            `### (${members.length}) Fast Friends Participants - ${s(guild.name)}\n`,
            members.map((user) => `- ${user} // @${name(user, 'username-id-s')}`).join('\n')
        ];

        await context.editOrReply({
            flags: MessageFlags.IsComponentsV2,
            components: [createContainer([createTextDisplay(lines.join(''))])]
        });
    };
};
