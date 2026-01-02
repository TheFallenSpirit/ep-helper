import { config } from "seyfert";

export default config.bot({
    token: process.env.DISCORD_TOKEN ?? '',
    locations: {
        base: 'build/src',
        events: 'events'
    },
    intents: [
        'Guilds',
        'GuildMembers',
        'GuildPresences'
    ]
});
