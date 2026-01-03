import { config } from "seyfert";

export default config.bot({
    token: process.env.DISCORD_TOKEN ?? '',
    locations: {
        base: 'build/src',
        events: 'events',
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
