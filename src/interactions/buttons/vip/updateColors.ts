import { ComponentCommand, ComponentContext, Label, Middlewares } from 'seyfert';
import { APISelectMenuOption, GuildFeature, MessageFlags, TextInputStyle } from 'seyfert/lib/types/index.js';
import { getVipRole } from '../../../common/vip.js';
import { createModal, createModalStringSelectMenu, createModalTextInput } from '@fallencodes/seyfert-utils/components/modal';
import { truncateString } from '@fallencodes/seyfert-utils';

@Middlewares(['userLock', 'guildConfig', 'vipProfile'])
export default class extends ComponentCommand {
    customId = 'button.vip.role.update.colors';
    componentType = 'Button' as const;

    run = async (context: ComponentContext<'Button', 'vipProfile' | 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        const vipRoleRequest = await getVipRole(context);
        if (vipRoleRequest.error) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: vipRoleRequest.message
        });

        const vipRole = vipRoleRequest.role;
        const modalComponents: Label[] = [];
        const styleOptions: APISelectMenuOption[] = [];
        const canBeStyled = guild.features.includes("ENHANCED_ROLE_COLORS" as GuildFeature);

        styleOptions.push({
            label: 'Solid Color',
            value: 'solid',
            description: 'Your role will be a solid colour, only provide a primary color below.',
            default: !canBeStyled || !!(vipRole.colors.primaryColor && !vipRole.colors.secondaryColor)
        });

        if (canBeStyled) {
            styleOptions.push({
                label: 'Gradient',
                value: 'gradient',
                description: 'Your role will be a gradient of 2 colours, provide both primary and secondary colors below.',
                default: !!(vipRole.colors.primaryColor && vipRole.colors.secondaryColor && !vipRole.colors.tertiaryColor)
            });

            styleOptions.push({
                label: 'Holographic',
                value: 'holographic',
                description: "Your role will be holographic, a built in style. Don't provide any colors below.",
                default: !!(vipRole.colors.primaryColor && vipRole.colors.secondaryColor && vipRole.colors.tertiaryColor)
            });
        };

        
        modalComponents.push(createModalStringSelectMenu({
            label: 'Color Style',
            minValues: 1,
            maxValues: 1,
            customId: 'style',
            description: 'The color style of your VIP role.',
            placeholder: 'Select a color style for your VIP role.',
            options: styleOptions
        }));

        modalComponents.push(createModalTextInput({
            label: 'Primary Color',
            style: TextInputStyle.Short,
            required: !canBeStyled,
            minLength: 7,
            maxLength: 7,
            customId: 'primary-color',
            value: vipRole.colors.primaryColor ? numberToHex(vipRole.colors.primaryColor) : undefined,
            description: 'The primary color of your role (for solid and gradient style).'
        }));

        if (canBeStyled) modalComponents.push(createModalTextInput({
            label: 'Secondary Color',
            style: TextInputStyle.Short,
            required: false,
            minLength: 7,
            maxLength: 7,
            customId: 'secondary-color',
            value: vipRole.colors.secondaryColor ? numberToHex(vipRole.colors.secondaryColor) : undefined,
            description: 'The secondary color of your role (for gradient style).'
        }));

        const modal = createModal({
            title: truncateString(`Update ${vipRole.name}`, 45),
            customId: 'modal.vip.role.update.colors',
            components: modalComponents
        });

        await context.modal(modal);
    };
};

export function numberToHex(color: number) {
    return `#${color.toString(16).toUpperCase().padEnd(6, '0')}`;
};
