import { redis } from '@/store.js';
import { randomId, wait } from '@fallencodes/seyfert-utils';
import { CommandContext, createChannelOption, createNumberOption, Declare, Options, SubCommand } from 'seyfert';
import { ChannelType, MessageFlags, OverwriteType } from 'seyfert/lib/types/index.js';

const options = {
    time: createNumberOption({
        required: true,
        description: 'The amount of time to pair each couple for (in minutes, min: 2, max: 15).',
        min_value: 2,
        max_value: 15
    }),
    'group-size': createNumberOption({
        required: true,
        description: 'The members per pair (min: 2, max: 5).',
        min_value: 2,
        max_value: 5
    }),
    category: createChannelOption({
        required: true,
        description: 'The category to create the VCs in.',
        channel_types: [ChannelType.GuildCategory]
    })
};

@Declare({
    name: 'pair',
    description: 'Pair all fast friends participants in private VCs.',
    botPermissions: ['Administrator'],
    defaultMemberPermissions: ['ManageEvents']
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        const channel = await context.channel();
        if (!channel.isVoice() && !channel.isStage()) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'Hold up! You must use this command in a voice or stage channel.'
        });

        const channelId = await redis.get(`ep_ff_active:${guild.id}`);
        if (!channelId || channel.id !== channelId) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'Hold up! You must use this command in the channel you started the session in.'
        });

        const members = await redis.smembers(`ep_ff_members:${guild.id}`);
        if (members.length < 2) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: 'Hold up! There needs to be at least 2 participants before starting.'
        });

        const groupSize = context.options['group-size'];
        if ((members.length % groupSize) !== 0) return context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: `Hold up! The amount of participants can't be paired in groups of ${groupSize}.`
        });

        const time = context.options.time;
        const groupCount = members.length / groupSize;

        await context.editOrReply({
            flags: MessageFlags.Ephemeral,
            content: `Loading! Pairing ${members.length} participants in ${groupCount} groups...`
        });

        const pairs = createPairs(members, groupSize);
        console.log(pairs);

        for await (const pair of pairs) {
            const pairChannel = await guild.channels.create({
                nsfw: true,
                type: ChannelType.GuildVoice,
                name: `FF Pair // Group ${randomId(3)}`,
                parent_id: context.options.category.id,
                permission_overwrites: [
                    { id: guild.id, type: OverwriteType.Role, deny: '1114112' },
                    ...pair.map((id) => ({ id, type: OverwriteType.Member, allow: '687198293568' }))
                ]
            }).catch(() => {});

            if (!pairChannel) continue;
            for await (const id of pair) {
                await guild.members.edit(
                    id,
                    { channel_id: pairChannel.id },
                    `Automated Action: User paired in group of ${groupSize} for fast friends`
                ).catch(() => {});
            };

            setTimeout(async () => {
                for await (const id of pair) {
                    await guild.members.edit(
                        id,
                        { channel_id: channelId },
                        `Automated Action: User paired in group of ${groupSize} for fast friends`
                    ).catch(() => {});
                };

                await pairChannel.delete('Automated Action: Pairing created for fast friends').catch(() => {});
            }, time * 60_000);

            await wait(2500);
        };

        await context.editOrReply({
            content: `Successfully paired ${members.length} participants in ${groupCount} groups for ${time} minutes.`
        });

        await redis.del(
            `ep_ff_active:${guild.id}`,
            `ep_ff_members:${guild.id}`
        );
    };
};

function createPairs(members: string[], groupSize: number): [string, string][] {
    const pairs: [string, string][] = [];
    const shuffled = members.toSorted(() => Math.random() - 0.5);

    for (let index = 0; index < shuffled.length; index += groupSize) {
        pairs.push(shuffled.slice(index, index + groupSize) as [string, string]);
    };

    return pairs;
};
