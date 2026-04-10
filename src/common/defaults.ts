import { capitalCase } from 'change-case';
import { AnyContext, CommandContext, MenuCommandContext, Message, OnOptionsReturnObject, PermissionStrings } from 'seyfert';
import { GatewayOpcodes, MessageFlags } from 'seyfert/lib/types/index.js';
import { getGuild } from '../store.js';
import { validateOptions } from '@fallencodes/seyfert-utils/options';
import { isInstalled } from '@fallencodes/seyfert-utils';

export default {
    onOptionsError,
    onPermissionsFail,
    onBotPermissionsFail
};

async function onPermissionsFail(context: AnyContext, permissions: PermissionStrings) {
    const lines = [
        `Hold up! | You don't have permissions to do this, you need the following permissions:\n`,
        `\`\`\`txt\n${permissions.map((permission) => capitalCase(permission.toString())).join(', ')}\n\`\`\``
    ];

    return context.editOrReply({ flags: MessageFlags.Ephemeral, content: lines.join('') });
};

async function onBotPermissionsFail(context: AnyContext, permissions: PermissionStrings) {
    const lines = [
        `Hold up! | I don't have permissions to do this, I need the following permissions:\n`,
        `\`\`\`txt\n${permissions.map((permission) => capitalCase(permission.toString())).join(', ')}\n\`\`\``
    ];

    return context.editOrReply({ flags: MessageFlags.Ephemeral, content: lines.join('') });
};

async function onOptionsError(context: CommandContext, metadata: OnOptionsReturnObject) {
    const lines = [`Hold up! `];
    const errors = await validateOptions(metadata);

    if (errors.length === 1) lines.push(`${errors[0]}`); else lines.push(
        `The following errors were found with your command usage:\n`,
        errors.map((e) => `- ${e}`).join('\n')
    );

    return context.editOrReply({
        flags: MessageFlags.Ephemeral,
        content: lines.join('')
    });
};

export async function prefix(message: Message) {
    if (!message.guildId) return ['ep'];    
    const guildConfig = await getGuild(message.guildId);
    if (guildConfig.prefix) return ['ep', guildConfig.prefix];
    return ['ep'];
};

export async function onBeforeMiddlewares(context: CommandContext | MenuCommandContext<any>) {
    if (isInstalled(context) && context.guildId) if (
        !context.client.cachedGuildList.get(context.guildId) &&
        !Array.from(context.client.cachedGuildList.values()).includes(false)
    ) {
        context.client.gateway.send(context.shardId, {
            op: GatewayOpcodes.RequestGuildMembers,
            d: { guild_id: context.guildId, query: '', limit: 0 }
        });

        context.client.cachedGuildList.set(context.guildId, false);
        setTimeout(() => context.client.cachedGuildList.set(context.guildId!, true), 25_000);
    };
};
