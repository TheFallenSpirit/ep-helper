import { CommandContext, Declare, SubCommand } from 'seyfert';
import vipInfoPanel from '../../../common/panels/vipInfo.js';

@Declare({
    name: 'info',
    botPermissions: ['ManageRoles'],
    description: 'View and or manage your VIP role and reactions.'
})

export default class extends SubCommand {
    run = async (context: CommandContext<{}, 'vipProfile' | 'guildConfig'>) => {
        await context.editOrReply({ content: 'Loading! | Loading your VIP experience...' });
        await context.editOrReply({ ...(await vipInfoPanel(context)) });
    };
};
