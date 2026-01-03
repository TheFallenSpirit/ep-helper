import { createEvent } from 'seyfert';
import handleRoleAutomations from './_roleAutomations.js';
import { getGuild } from '../../store.js';

export default createEvent({
    data: { name: 'guildMemberUpdate' },
    run: async ([member, oldMember], client) => {
        const guildConfig = await getGuild(member.guildId);
        
        if ((guildConfig.roleAutomations ?? []).length > 0) {
            handleRoleAutomations(client, guildConfig, member, oldMember);
        };
    }
});
