import { createActionRow, createButton, createContainer, createSeparator, createTextDisplay, createTextSection } from '@fallencodes/seyfert-utils/components/message';
import { Button, CommandContext, ComponentContext, ContainerBuilderComponents, GuildRole, ModalContext, TopLevelBuilders } from 'seyfert';
import { ButtonStyle, MessageFlags } from 'seyfert/lib/types/index.js';
import { setCachedAutoReaction, updateVipProfile } from '../../store.js';
import { s } from '@fallencodes/seyfert-utils';
import { ComponentInteractionMessageUpdate } from 'seyfert/lib/common/index.js';
import { numberToHex } from '../../interactions/buttons/vip/updateColors.js';
import { apiRoleColorsToArray, getVipRoleMemberLimit } from '../vip.js';

export type VIPInfoPanelContext =
| ComponentContext<'Button' | 'StringSelect', 'vipProfile' | 'guildConfig'>
| CommandContext<{}, 'vipProfile' | 'guildConfig'>
| ModalContext<'vipProfile' | 'guildConfig'>

export default async (context: VIPInfoPanelContext): Promise<ComponentInteractionMessageUpdate> => {
    const guild = await context.guild();
    if (!guild) return ({ content: context.client.replies('guildUnavailable') });

    const vipProfile = context.metadata.vipProfile;
    const vipTier = context.metadata.guildConfig.vipTiers?.get(vipProfile.tierId);

    if (!vipTier) return ({
        content: `Hold up! | Your VIP tier wasn't found in ${s(guild.name)}, please contact server admins.`
    });

    let color: number | undefined;
    let roleId: string | undefined;
    let vipRole: GuildRole | undefined;

    const vipRoleEnabled = vipTier.role?.enabled === true;
    const containerComponents: ContainerBuilderComponents[] = [];
    const displayName = s(context.member?.displayName ?? context.author.globalName ?? context.author.username);

    if (vipRoleEnabled) {
        if (vipProfile.role?.id) {
            vipRole = await context.client.roles.fetch(guild.id, vipProfile.role.id).catch(() => undefined);
        };
    
        if (!vipRole) try {
            vipRole = await guild.roles.create({
                name: vipProfile.role?.name ?? `${displayName}'s VIP`,
                permissions: '0',
                // @ts-expect-error
                colors: {
                    primary_color: vipProfile.role?.colors?.[0] ?? 0,
                    secondary_color: vipProfile.role?.colors?.[1] ?? null,
                    tertiary_color: vipProfile.role?.colors?.[2] ?? null
                }
            });
        } catch (_error) {
            return ({
                content: `Error! | Failed to create VIP role in ${s(guild.name)}, please contact server admins.`
            });
        };

        if (!vipRole) return ({
            content: `Error! | Your VIP role couldn't be found in ${s(guild.name)}, please contact server admins.`
        });

        if (vipRole.id !== vipProfile.role?.id) await updateVipProfile(
            guild.id,
            context.author.id,
            { $set: { 'role.id': vipRole.id } }
        );

        const colors = apiRoleColorsToArray(vipRole.colors);
        if (colors[0] !== 0) color = colors[0];

        const memberLimit = getVipRoleMemberLimit(vipProfile, vipTier);
        const members = (context.client.cache.members?.values(guild.id).filter(({ roles }) => {
            return roles.keys.includes(vipRole!.id);
        }) ?? []).map(({ id }) => id);

        if (!members.includes(context.author.id)) try {
            await context.client.proxy.guilds(guild.id).members(context.author.id).roles(vipRole.id).put({
                reason: 'Automated Action: User not member of their VIP role.'
            });

            members.push(context.author.id);
        } catch (_error) {
            return ({
                content: `Error! | I failed to add you to your VIP role, please contact server admins.`
            });
        };

        const lines = [
            `### VIP Role • ${vipRole}\n`,
            `**Name**: ${vipRole.name}\n`,
            `**Colors**: ${colors.map((color) => `\`${numberToHex(color)}\``).join(', ') || 'None'}\n\n`,
            `**Hoisted**: ${vipRole.hoist ? 'Yes' : 'No'}\n`,
            `**Mentionable**: ${vipRole.mentionable ? 'Yes' : 'No'}`,
        ];

        const memberLines = [
            `### Role Members (${members.length}/${memberLimit})\n`,
            members.map((id) => `<@${id}>`).join(', ') || 'None'
        ];

        let vipRoleInfoComponent: ContainerBuilderComponents = createTextDisplay(lines.join(''));
        if (vipRole.icon) vipRoleInfoComponent = createTextSection(lines.join(''), {
            type: 'thumbnail',
            url: `https://cdn.discordapp.com/role-icons/${vipRole.id}/${vipRole.icon}.png`
        });

        containerComponents.push(
            vipRoleInfoComponent,
            createSeparator(),
            createTextDisplay(memberLines.join(''))
        );
    } else containerComponents.push(
        createTextDisplay(`### VIP Role\nYour VIP tier "${s(vipTier.name)}" doesn't have an included VIP role.`)
    );

    const reactions = vipProfile.reaction?.items ?? [];
    const triggers = vipProfile.reaction?.triggers ?? [];
    const triggerLimit = vipTier.reactions?.defaultTriggerLimit;
    const reactionLimit = vipTier.reactions?.defaultReactionLimit;

    const reactionLines = [`### Auto Reactions\n`];
    if (!triggerLimit || !reactionLimit) {
        reactionLines.push(`Your VIP tier "${s(vipTier.name)}" doesn't have any included auto reactions.`);
    } else {
        await setCachedAutoReaction(guild.id, { roleId, userId: context.author.id, triggers, items: reactions });

        reactionLines.push(
            `**Triggers (${triggers.length}/${triggerLimit})**: ${context.author}`,
            `${triggers.length > 0 ? `, ${triggers.map((t) => `\`${t}\``).join(', ')}` : ''}\n`,
            `**Reactions (${reactions.length}/${reactionLimit})**: ${reactions.join(', ') || 'None'}`
        );
    };

    const metaLines: string[] = [];
    containerComponents.push(createSeparator(), createTextDisplay(reactionLines.join('')));
    if (vipRoleEnabled) metaLines.push(`To add/remove members to/from your VIP role, use \`/vip share\`.`);
    if (triggerLimit && reactionLimit) metaLines.push(`Your user ping/mention doesn't count towards your total triggers.`);

    if (metaLines.length > 0) containerComponents.push(createSeparator(), createTextDisplay(metaLines.join('\n')));
    const components: TopLevelBuilders[] = [createContainer(containerComponents, { color })];

    if (vipRoleEnabled) components.push(createActionRow<Button>(
        createButton({ label: 'Update', style: ButtonStyle.Primary, customId: `button.vip.role.update:${context.author.id}` }),
        createButton({ label: 'Change Colors', style: ButtonStyle.Secondary, customId: `button.vip.role.update.colors:${context.author.id}` })
    ));

    return ({
        components,
        content: null,
        flags: MessageFlags.IsComponentsV2,
        allowed_mentions: { parse: [] }
    });
};

// type VIPRoleDataResponse =
// | ({ error: true, message: string })
// | ({ error: false, roleId: string, components: ContainerBuilderComponents[] })

// async function getVipRoleData(
//     context: VIPInfoPanelContext,
//     guild: Guild<'api' | 'cached'>,
//     vipProfile: VIPI
// ): Promise<VIPRoleDataResponse> {
//     let error: string | undefined;
//     let vipRole: GuildRole | undefined;
//     const displayName = s(context.member?.displayName ?? context.author.globalName ?? context.author.username);

//     if (vipProfile.role?.id) vipRole = await context.client.roles.fetch(guild.id, vipProfile.role.id).catch(() => {
//         return undefined;
//     });
    
//     if (!vipRole) vipRole = await guild.roles.create({
//         name: `${displayName}'s VIP`,
//         permissions: '0'
//     }).catch(() => {
//         error = `Error! | Failed to create VIP role in ${s(guild.name)}, please contact server admins.`;
//         return undefined;
//     });

//     if (!vipRole) return ({
//         error: true,
//         message: `Error! | Your VIP role couldn't be found in ${s(guild.name)}, please contact server admins.`
//     });

//     if (error) return ({ error: true, message: error });
//     if (vipRole.id !== vipProfile.role?.id) await updateVipProfile(
//         guild.id,
//         context.author.id,
//         { $set: { 'role.id': vipRole.id } }
//     );

//     const colors = Object.values(vipRole.colors).filter((color) => typeof color === 'number' && color !== 0) as number[];
//     const members = context.client.cache.members?.values(guild.id).filter(({ roles }) => {
//         return roles.keys.includes(vipRole.id);
//     }) ?? [];

//     const lines = [
//         `### ${vipRole} - VIP Role\n`,
//         `**Name**: ${vipRole.name}\n`,
//         `**Colors**: ${colors.map((color) => `\`#${color.toString(16)}\``).join(', ') || 'None'}\n\n`,
//         `**Hoisted**: ${vipRole.hoist ? 'Yes' : 'No'}\n`,
//         `**Mentionable**: ${vipRole.mentionable ? 'Yes' : 'No'}`,
//     ];

//     return ({
//         error: false,
//         roleId: vipRole.id,
//         components: [
//             createTextDisplay(lines.join('')),
//             createSeparator(),
//             createTextDisplay(`### Role Members\n${members.map(({ id }) => `<@${id}>`).join(', ') || 'None'}`),
//         ]
//     });
// };
