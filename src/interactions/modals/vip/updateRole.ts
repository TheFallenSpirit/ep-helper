import { Middlewares, ModalCommand, ModalContext } from 'seyfert';
import { getVipRole } from '../../../common/vip.js';
import { MessageFlags, RESTPatchAPIGuildRoleJSONBody } from 'seyfert/lib/types/index.js';
import { updateVipProfile } from '../../../store.js';
import vipInfoPanel from '../../../common/panels/vipInfo.js';

@Middlewares(['guildConfig', 'vipProfile'])
export default class extends ModalCommand {
    customId = 'modal.vip.role.update';

    run = async (context: ModalContext<'vipProfile' | 'guildConfig'>) => {
        const vipRoleRequest = await getVipRole(context);
        if (vipRoleRequest.error) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: vipRoleRequest.message
        });

        const vipRole = vipRoleRequest.role;
        const name = context.interaction.getInputValue('name', true) as string;
        const hoist = (context.interaction.getInputValue('hoist', true) as string[])[0] === 'true';
        const mentionable = (context.interaction.getInputValue('mentionable', true) as string[])[0] === 'true';

        const query: RESTPatchAPIGuildRoleJSONBody = {};
        if (name !== vipRole.name) Object.assign(query, { name });
        if (hoist !== vipRole.hoist) Object.assign(query, { hoist });
        if (mentionable !== vipRole.mentionable) Object.assign(query, { mentionable });

        if (Object.keys(query).length < 1) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: "You didn't make any changes to your role silly."
        });

        await context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'Loading! | Updating your VIP role...'
        });

        try {
            await vipRole.edit(query);
            if (name !== vipRole.name) context.metadata.vipProfile = await updateVipProfile(
                context.guildId!,
                context.author.id,
                { $set: { 'role.name': name } }
            );
        } catch (_error) {
            return context.editOrReply({
                content: 'Error! | I failed to updated your VIP role, please contact server admins.'
            });
        };

        await context.interaction.message?.edit({ ...(await vipInfoPanel(context)) }).catch(() => {});
        await context.editOrReply({ content: `Successfully updated your VIP role.` });
    };
};
