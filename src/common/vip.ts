import { VIPInfoPanelContext } from './panels/vipInfo.js';
import { s } from '@fallencodes/seyfert-utils';
import { GuildRole } from 'seyfert';
import { VIPProfileI } from '../models/VIPProfile.js';
import { VIPTier } from '../models/Guild.js';
import { APIRoleColors } from 'seyfert/lib/types/index.js';
import { ObjectToLower } from 'seyfert/lib/common/index.js';

type VIPRoleResponse = 
| ({ error: true, message: string })
| ({ error: false, role: GuildRole, profile: VIPProfileI })

export async function getVipRole(context: VIPInfoPanelContext): Promise<VIPRoleResponse> {
    const guild = await context.guild();
    if (!guild) return ({ error: true, message: context.client.replies('guildUnavailable') });

    const vipProfile = context.metadata.vipProfile;
    if (!vipProfile.role?.id) return ({
        error: true,
        message: `Hold up! | You don't have a VIP role in ${s(guild.name)}.`
    });

    const vipRole = await context.client.roles.fetch(
        guild.id,
        vipProfile.role.id
    ).catch(() => {});

    if (!vipRole) return ({
        error: true,
        message: `Hold up! | Your VIP role couldn't be found, please use \`/vip role\`.`
    });

    return ({ error: false, role: vipRole, profile: vipProfile });
};

export function getVipRoleMemberLimit(vipProfile: VIPProfileI, vipTier: VIPTier) {
    let memberLimit = vipTier.role?.defaultMemberLimit ?? 10;
    if (vipProfile.role?.maxMembersModifier) memberLimit += vipProfile.role.maxMembersModifier;
    return memberLimit;
};

export function apiRoleColorsToArray(apiColors: APIRoleColors | ObjectToLower<APIRoleColors>): number[] {
    const primaryColor = 'primaryColor' in apiColors ? apiColors.primaryColor : apiColors.primary_color;
    const secondaryColor = 'secondaryColor' in apiColors ? apiColors.secondaryColor : apiColors.secondary_color;
    const tertiaryColor = 'tertiaryColor' in apiColors ? apiColors.tertiaryColor : apiColors.tertiary_color;

    const colors: number[] = [];
    if (primaryColor !== 0) colors.push(primaryColor);
    if (secondaryColor) colors.push(secondaryColor);
    if (tertiaryColor) colors.push(tertiaryColor);
    return colors;
};
