import { UsingClient, GuildMember } from 'seyfert';
import config from '../../../config.json' with { type: 'json' };

// interface RoleAutomation {
//     primaryRoleId: string;
//     triggerRoles: string[];
//     type: 'add-on-add' | 'remove-on-add';
// };

// const roleAutomations: RoleAutomation[] = [
//     { type: 'remove-on-add', primaryRoleId: roles.introAccess, triggerRoles: [roles.verified] }
// ];

type RoleAutomation = typeof config['role-automations'][number];

export default async function handleRoleAutomations(client: UsingClient, member: GuildMember, oldMember?: GuildMember) {
    if (!oldMember) return;

    const memberRoles = member.roles.keys;
    const oldMemberRoles = oldMember.roles.keys;

    async function addOnAdd(automation: RoleAutomation) {
        if (memberRoles.includes(automation['primary-role'])) return;
        await client.proxy.guilds(member.guildId).members(member.id).roles(automation['primary-role']).put({
            reason: 'Automated Action: Role add-on-add automation triggered'
        });
    };

    async function removeOnAdd(automation: RoleAutomation) {
        if (!memberRoles.includes(automation['primary-role'])) return;
        await client.proxy.guilds(member.guildId).members(member.id).roles(automation['primary-role']).delete({
            reason: 'Automated Action: Role remove-on-add automation triggered'
        });
    };

    for (const automation of config['role-automations']) {
        if (!automation['trigger-roles'].some((roleId) => memberRoles.includes(roleId) && !oldMemberRoles.includes(roleId))) continue;

        switch (automation.type) {
            case 'add-on-add': await addOnAdd(automation); break;
            case 'remove-on-add': await removeOnAdd(automation); break;
        };
    };
};
