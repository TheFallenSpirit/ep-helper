import { config } from "seyfert";

export default config.bot({
    token: process.env.DISCORD_TOKEN ?? '',
    locations: {
        base: 'build',
        events: 'events',
        components: 'interactions',
        commands: 'interactions/commands'
    },
    intents: [
        'Guilds',
        'GuildMembers',
        'GuildMessages',
        'GuildPresences',
        'MessageContent'
    ]
});
