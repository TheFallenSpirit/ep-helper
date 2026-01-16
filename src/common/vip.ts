import { VIPInfoPanelContext } from './panels/vipInfo.js';
import { s } from '@fallencodes/seyfert-utils';
import { GuildRole } from 'seyfert';
import { VIPProfileI } from '../models/VIPProfile.js';

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
