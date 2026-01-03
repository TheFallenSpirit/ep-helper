import { UsingClient, GuildMember } from 'seyfert';
import { GuildI, RoleAutomation } from '../../models/Guild.js';

export default async function handleRoleAutomations(client: UsingClient, guildConfig: GuildI, member: GuildMember, oldMember?: GuildMember) {
    if (!oldMember) return;

    const memberRoles = member.roles.keys;
    const oldMemberRoles = oldMember.roles.keys;

    async function addOnAdd(automation: RoleAutomation) {
        if (memberRoles.includes(automation.primaryRoleId)) return;
        await client.proxy.guilds(member.guildId).members(member.id).roles(automation.primaryRoleId).put({
            reason: 'Automated Action: Role add-on-add automation triggered'
        });
    };

    async function removeOnAdd(automation: RoleAutomation) {
        if (!memberRoles.includes(automation.primaryRoleId)) return;
        await client.proxy.guilds(member.guildId).members(member.id).roles(automation.primaryRoleId).delete({
            reason: 'Automated Action: Role remove-on-add automation triggered'
        });
    };

    for (const automation of guildConfig.roleAutomations ?? []) {
        if (!automation.triggerRoleIds.some((roleId) => memberRoles.includes(roleId) && !oldMemberRoles.includes(roleId))) continue;

        switch (automation.type) {
            case 'add-on-add': await addOnAdd(automation); break;
            case 'remove-on-add': await removeOnAdd(automation); break;
        };
    };
};
