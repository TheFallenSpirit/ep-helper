import { Declare, SubCommand } from 'seyfert';
import VIPInfo from './info.js';

@Declare({
    name: 'role',
    botPermissions: ['ManageRoles'],
    description: 'View and or manage your VIP role and reactions.'
})

export default class extends SubCommand {
    run = new VIPInfo().run;
};
