import { getChanges } from '@/common/changes.js';
import { GuildI } from '@/models/Guild.js';
import { updateGuild } from '@/store.js';
import { s, trueOrFalse } from '@fallencodes/seyfert-utils';
import { CommandContext, createNumberOption, createStringOption, Declare, Options, SubCommand } from 'seyfert';

const options = {
    'auto-delete': createStringOption({
        description: 'If media should be deleted when a user leaves the server (default: No).',
        choices: trueOrFalse
    }),
    'delete-delay': createNumberOption({
        description: 'How long to wait after a user leaves before deleting their media (default: 24 hours).',
        choices: [
            { name: '30 minutes', value: 30 },
            { name: '1 hour', value: 60 },
            { name: '2 hours', value: 120 },
            { name: '3 hours', value: 180 },
            { name: '6 hours', value: 360 },
            { name: '12 hours', value: 720 },
            { name: '1 day', value: 1440 },
            { name: '2 days', value: 2880 },
            { name: '3 days', value: 4320 },
            { name: '1 week', value: 10_080 }
        ]
    })
};

@Declare({
    name: 'media',
    description: `Update this server's media logging and deletion config.`
})

@Options(options)
export default class extends SubCommand {
    run = async (context: CommandContext<typeof options, 'guildConfig'>) => {
        const guild = await context.guild();
        if (!guild) return context.replyWith(context, 'guildUnavailable');

        const query: Partial<GuildI> = {};
        if (context.options['auto-delete']) Object.assign(query, {
            'media.autoDelete': context.options['auto-delete'] === 'true'
        });

        if (context.options['delete-delay']) Object.assign(query, {
            'media.deleteAfterDelay': context.options['delete-delay']
        });

        const changes = getChanges<GuildI>(query);
        if (!changes.modified) return context.replyWith(context, 'noChanges');
        await updateGuild(guild.id, changes.query);

        await context.editOrReply({
            content: `Successfully updated ${s(guild.name)}'s media config.\n${changes.formatted}`
        });
    };
};
