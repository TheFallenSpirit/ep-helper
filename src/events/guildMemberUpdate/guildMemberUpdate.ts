import { createEvent } from 'seyfert';
import handleRoleAutomations from './_roleAutomations.js';
import config from '../../../config.json' with { type: 'json' };

export default createEvent({
    data: { name: 'guildMemberUpdate' },
    run: async ([member, oldMember], client) => {
        if (config['role-automations'].length > 0) handleRoleAutomations(client, member, oldMember);
    }
});
