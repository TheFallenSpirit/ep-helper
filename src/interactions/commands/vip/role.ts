import { createContainer, createSeparator, createTextDisplay, s } from '@fallencodes/seyfert-utils';
import { Button, CommandContext, Declare, GuildRole, SubCommand } from 'seyfert';
import { ButtonStyle, MessageFlags } from 'seyfert/lib/types/index.js';
import { updateVipProfile } from '../../../store.js';
import { createActionRow, createButton } from '../../../structures/components.js';

@Declare({
    name: 'role',
    botPermissions: ['ManageRoles'],
    description: 'View and manage your VIP role in this server.'
})

export default class extends SubCommand {
    run = async (context: CommandContext<{}, 'vipProfile' | 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        const vipProfile = context.metadata.vipProfile;
        const vipTier = context.metadata.guildConfig.vipTiers?.get(vipProfile.tierId);

        if (!vipTier) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: `Hold up! | Your VIP tier wasn't found in ${s(guild.name)}, please contact server admins.`
        });

        if (vipTier.role?.enabled !== true) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: `Hold up! | Your VIP tier ${s(vipTier.name)} doesn't have an included VIP role.`
        });

        let error: string | undefined;
        let vipRole: GuildRole | undefined;
        const displayName = s(context.member?.displayName ?? context.author.globalName ?? context.author.username);

        if (vipProfile.role?.id) vipRole = await context.client.roles.fetch(guild.id, vipProfile.role.id).catch(() => {
            return undefined;
        });
        
        if (!vipRole) vipRole = await guild.roles.create({
            name: `${displayName}'s VIP`,
            permissions: '0'
        }).catch(() => {
            error = `Error! | Failed to create VIP role in ${s(guild.name)}, please contact server admins.`;
            return undefined;
        });

        if (!vipRole) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: `Error! | Your VIP role couldn't be found in ${s(guild.name)}, please contact server admins.`
        });

        if (error) return context.editOrReply({ flags: MessageFlags.Ephemeral, content: error });
        if (vipRole.id !== vipProfile.role?.id) await updateVipProfile(
            guild.id,
            context.author.id,
            { $set: { 'role.id': vipRole.id } }
        );

        const colors = Object.values(vipRole.colors).filter((color) => typeof color === 'number' && color !== 0) as number[];
        const members = context.client.cache.members?.values(guild.id).filter(({ roles }) => {
            return roles.keys.includes(vipRole.id);
        }) ?? [];

        const lines = [
            `### ${vipRole} - VIP Role\n`,
            `**Name**: ${vipRole.name}\n`,
            `**Colors**: ${colors.map((color) => `\`#${color.toString(16)}\``).join(', ') || 'None'}\n\n`,
            `**Hoisted**: ${vipRole.hoist ? 'Yes' : 'No'}\n`,
            `**Mentionable**: ${vipRole.mentionable ? 'Yes' : 'No'}`,
        ];

        const container = createContainer([
            createTextDisplay(lines.join('')),
            createSeparator(),
            createTextDisplay(`### Role Members\n${members.map(({ id }) => `<@${id}>`).join(', ') || 'None'}`),
            createSeparator(),
            createTextDisplay(`To add or remove members, use \`/vip share\`.`)
        ], { color: colors[0] });

        const buttonRow = createActionRow<Button>(
            createButton({ label: 'Update', style: ButtonStyle.Primary, customId: `button.vip.role.update:${context.author.id}` }),
            createButton({ label: 'Change Colors', style: ButtonStyle.Secondary, customId: `button.vip.role.update.colors:${context.author.id}` })
        );

        await context.editOrReply({
            flags: MessageFlags.IsComponentsV2,
            components: [container, buttonRow]
        });
    };
};
