import { getProfile, redis } from '@/store.js';
import { replacer, reviver } from '@fallencodes/seyfert-utils';
import { Command, CommandContext, createUserOption, Declare, GuildMember, Middlewares, Options } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types/index.js';
import { DeclareParserConfig } from 'yunaforseyfert';

const options = {
    user: createUserOption({
        required: true,
        description: 'The user you want to whip.'
    })
};

@Declare({
    name: 'whip',
    contexts: ['Guild'],
    botPermissions: ['ManageChannels', 'ManageWebhooks'],
    integrationTypes: ['GuildInstall'],
    description: 'Whip another user and cause them to moan a random line.'
})

@Options(options)
@Middlewares(['profile', 'guildConfig'])
@DeclareParserConfig({ useRepliedUserAsAnOption: { requirePing: false } })

export default class extends Command {
    run = async (context: CommandContext<typeof options, 'profile' | 'guildConfig'>) => {
        const whipLines = context.metadata.guildConfig.whipLines ?? [];
        if (whipLines.length < 1) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: "The whip command isn't enabled in this server."
        })

        const authorProfile = context.metadata.profile;
        if (authorProfile.rpEnabled !== true) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'You must be opted-in to use RP commands. Use /opt in to opt-in.'
        });

        const target = context.options.user;
        if (!(target instanceof GuildMember)) return context.editOrReply({
            allowed_mentions: { parse: [] },
            content: `${target} isn't a member of this server.`
        });

        const targetProfile = await getProfile(context.guildId!, target.id);
        if (targetProfile?.rpEnabled !== true) return context.editOrReply({
            allowed_mentions: { parse: [] },
            content: `${target} hasn't opted-in to RP commands. They can use /opt in to opt-in.`
        });

        const channel = await context.channel();
        if (!channel.isTextGuild()) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'Hold up! This command only works in text channels.'
        });

        let error = false;
        const webhookCacheRaw = await redis.get(`ep_webhook:${channel.id}`);

        const webhookBody = {
            username: target.displayName,
            avatar_url: target.avatarURL(),
            content: whipLines[Math.floor(Math.random() * whipLines.length)]
        };

        if (webhookCacheRaw) {
            const data = JSON.parse(webhookCacheRaw, reviver) as WebhookCache;
            error = await context.client.webhooks.writeMessage(data.id, data.token, {
                body: webhookBody
            }).then(() => false).catch(() => true);
        };

        if (!error) return;
        const webhooks = await channel.webhooks.list();

        let webhook = webhooks.find(({ applicationId }) => applicationId === context.client.me.id);
        if (!webhook) webhook = await channel.webhooks.create({ name: 'EP Utility' });

        error = await webhook.messages.write({
            body: webhookBody
        }).then(() => true).catch(() => false);

        if (!error) await redis.set(
            `ep_webhook:${channel.id}`,
            JSON.stringify({ id: webhook.id, token: webhook.token }, replacer)
        );
    };
};

interface WebhookCache {
    id: string;
    token: string;
}
