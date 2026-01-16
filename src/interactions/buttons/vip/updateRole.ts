import { truncateString } from '@fallencodes/seyfert-utils';
import { ComponentCommand, ComponentContext, Middlewares } from 'seyfert';
import { APISelectMenuOption, MessageFlags, TextInputStyle } from 'seyfert/lib/types/index.js';
import { createModal, createModalStringSelectMenu, createModalTextInput } from '@fallencodes/seyfert-utils/components/modal';
import { getVipRole } from '../../../common/vip.js';

@Middlewares(['userLock', 'guildConfig', 'vipProfile'])
export default class extends ComponentCommand {
    customId = 'button.vip.role.update';
    componentType = 'Button' as const;

    run = async (context: ComponentContext<'Button', 'vipProfile' | 'guildConfig'>) => {
        const vipRoleRequest = await getVipRole(context);
        if (vipRoleRequest.error) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: vipRoleRequest.message
        });

        const vipRole = vipRoleRequest.role;
        const vipProfile = vipRoleRequest.profile;
        const vipTier = context.metadata.guildConfig.vipTiers?.get(vipProfile.tierId);
        
        const isDisabledText = ' This feature is disabled by the server.';
        let hoistedDescription = 'If your VIP role should be shown on the member list.';
        let mentionableDescription = 'If your VIP role should be mentionable by all members.';

        let hoistedOptions: APISelectMenuOption[] = [
            { label: 'Yes', value: 'true', default: vipRole.hoist },
            { label: 'No', value: 'false', default: !vipRole.hoist }
        ];

        let mentionableOptions: APISelectMenuOption[] = [
            { label: 'Yes', value: 'true', default: vipRole.mentionable },
            { label: 'No', value: 'false', default: !vipRole.mentionable }
        ];

        if (vipTier?.role?.canBeHoisted !== true) {
            hoistedDescription = hoistedDescription + isDisabledText;
            hoistedOptions = [{ label: vipRole.hoist ? 'Yes' : 'No', value: 'false', default: true }];
        };

        if (vipTier?.role?.canBeMentionable !== true) {
            mentionableDescription = mentionableDescription + isDisabledText;
            mentionableOptions = [{ label: vipRole.mentionable ? 'Yes' : 'No', value: 'false', default: true }];
        };

        const modal = createModal({
            title: truncateString(`Update ${vipRole.name}`, 45),
            customId: 'modal.vip.role.update',
            components: [
                createModalTextInput({
                    label: 'Name',
                    value: vipRole.name,
                    style: TextInputStyle.Short,
                    customId: 'name',
                    maxLength: 32,
                    description: 'The name of your VIP role.'
                }),
                createModalStringSelectMenu({
                    label: 'Hoisted',
                    minValues: 1,
                    maxValues: 1,
                    required: false,
                    customId: 'hoist',
                    options: hoistedOptions,
                    description: hoistedDescription
                }),
                createModalStringSelectMenu({
                    label: 'Mentionable',
                    minValues: 1,
                    maxValues: 1,
                    required: false,
                    customId: 'mentionable',
                    options: mentionableOptions,
                    description: mentionableDescription
                })
            ]
        });

        await context.modal(modal);
    };
};

