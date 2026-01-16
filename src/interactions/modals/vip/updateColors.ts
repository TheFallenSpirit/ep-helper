import { Middlewares, ModalCommand, ModalContext } from 'seyfert';
import { APIRoleColors, MessageFlags } from 'seyfert/lib/types/index.js';
import { getVipRole } from '../../../common/vip.js';
import { updateVipProfile } from '../../../store.js';
import vipInfoPanel from '../../../common/panels/vipInfo.js';

@Middlewares(['guildConfig', 'vipProfile'])
export default class extends ModalCommand {
    customId = 'modal.vip.role.update.colors';

    run = async (context: ModalContext<'vipProfile' | 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');
        
        const vipRoleRequest = await getVipRole(context);
        if (vipRoleRequest.error) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: vipRoleRequest.message
        });

        await context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: "Loading! | Updating your VIP role's colors..."
        });

        const vipRole = vipRoleRequest.role;
        const style = (context.interaction.getInputValue('style', true) as string[])[0];
        let primaryColor = context.interaction.getInputValue('primary-color') as string | undefined;
        let secondaryColor = context.interaction.getInputValue('secondary-color') as string | undefined;

        const colors: Partial<APIRoleColors> = {};
        if (primaryColor && primaryColor.startsWith('#')) primaryColor = primaryColor.replace('#', '');
        if (secondaryColor && secondaryColor.startsWith('#')) secondaryColor = secondaryColor.replace('#', '');

        if (primaryColor) primaryColor = `0x${primaryColor}`;
        if (secondaryColor) secondaryColor = `0x${secondaryColor}`;

        switch (style) {
            case 'solid':
                colors.primary_color = parseInt(primaryColor || '0x07a34b');
                break;

            case 'gradient':
                colors.primary_color = parseInt(primaryColor || '0x07a34b');
                colors.secondary_color = parseInt(secondaryColor || '0x004d22');
                break;

            case 'holographic':
                colors.primary_color = 11127295;
                colors.secondary_color = 16759788;
                colors.tertiary_color = 16761760;
                break;
        };

        try {
            // @ts-expect-error
            await vipRole.edit({ colors });
            const roleColors = Object.values(colors).filter((color) => typeof color === 'number');
            await updateVipProfile(guild.id, context.author.id, { $set: { 'role.colors': roleColors } });
        } catch (error) {
            console.error(error, colors);
            return context.editOrReply({
                content: 'Error! | I failed to updated your VIP role, please contact server admins.'
            });
        };
        
        await context.interaction.message?.edit({ ...(await vipInfoPanel(context)) }).catch(() => {});
        await context.editOrReply({ content: `Successfully updated your VIP role's colors.` });
    };
};
