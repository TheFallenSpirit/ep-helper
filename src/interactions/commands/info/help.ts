import { CommandCategoryKey } from '@/module.js';
import { getGuild } from '@/store.js';
import { colors, isInstalled, name, s } from '@fallencodes/seyfert-utils';
import { createContainer, createSeparator, createTextDisplay, createTextSection } from '@fallencodes/seyfert-utils/components/message';
import { Command, CommandContext, createStringOption, Declare, IgnoreCommand, Options, SubCommand, UsingClient } from 'seyfert';
import { ApplicationCommandOptionType, ApplicationCommandType, MessageFlags } from 'seyfert/lib/types/index.js';

const categories: CommandCategory[] = [
    {
        key: 'info',
        label: 'Info Commands',
        description: 'Information commands like help, ping, and others.',
        headerDescription: 'these commands provide info about the app like ping, help (this command), and more.'
    },
    {
        key: 'fun',
        label: 'Fun & Game Commands',
        description: 'Fun and game commands like fast friends and others.',
        headerDescription: 'these commands let users have fun interacting with others, and participating in games.'
    },
    {
        key: 'utility',
        label: 'Utility Commands',
        description: 'Utility commands for managing and administrating your server.',
        headerDescription: 'these commands let moderators and admins do cool or tedious tasks in the server.'
    },
    {
        key: 'admin',
        label: 'Admin Commands',
        description: 'Admin commands for configuring me in your server.',
        headerDescription: 'these commands are for configuring the app and taking admin actions.'
    },
    {
        key: 'internal',
        label: 'Internal Commands',
        description: 'Internal commands for configuring me globally.',
        headerDescription: 'these commands are for configuring my global settings (internal admins only).'
    }
];

const options = {
    category: createStringOption({
        description: 'The category to list commands for.',
        choices: categories.map(({ key, label }) => ({ name: label, value: key }))
    })
};

@Declare({
    name: 'help',
    contexts: ['Guild', 'BotDM', 'PrivateChannel'],
    integrationTypes: ['UserInstall', 'GuildInstall'],
    description: 'View a list of commands and information about commands.',
    props: { category: 'info' }
})

@Options(options)
export default class extends Command {
    run = async (context: CommandContext<typeof options>) => {
        const category = context.options.category;
        const lines = { header: [] as string[], content: [] as string[], footer: [] as string[] };

        let prefix = 'ep';
        let guildName: string | undefined;
        let username = s(context.client.me.username);
        let avatarUrl = context.client.me.avatarURL();

        if (context.guildId) {
            const member = context.client.cache.members?.get(context.client.me.id, context.guildId);

            if (member) {
                username = s(member.displayName);
                avatarUrl = member.avatarURL();
            };
        };

        if (isInstalled(context)) {
            const guild = await context.guild();

            if (guild) {
                guildName = s(guild.name);
                const guildConfig = await getGuild(guild.id);
                if (guildConfig?.prefix) prefix = guildConfig.prefix;
            };
        };

        if (category) {
            const commands = generateCommandList(context.client, { category });
            const categoryInfo = categories.find(({ key }) => key === category)!;

            lines.header.push(
                `### ${categoryInfo.label} • ${username}\n`,
                `A list of ${username}'s ${categoryInfo.label.toLowerCase()} -- ${categoryInfo.headerDescription}`
            );

            lines.content.push(...commands.map((command) => {
                const lines = [getCommandInfo(command, { prefix, isSubCommand: false })];

                if (command.subCommands) lines.push(
                    ...command.subCommands.map((cmd) => `\n  ${getCommandInfo(cmd, { prefix, isSubCommand: true })}`)
                );

                lines.push('\n');
                return lines.join('');
            }));

            lines.footer.push(
                'To view all command categories, use this command without a category.',
                ' All slash commands are also usable as plain text commands.'
            );
        } else {
            lines.header.push(
                `### Help • ${username}\n`,
                `Welcome to ${username}, ${name(context.member ?? context.author, 'display-s')} :wave:`,
                ` -- to view a list of commands, specify a category when using this command.`
            );

            lines.content.push(
                `Here's a list of command categories, and what they are for:\n`,
                ...categories.map(({ key, description }) => `- \`${key}\` - ${description}`).join('\n'),
                `\n\nTo request a feature, or for additional help, contact ${guildName}'s staff team.`
            );

            lines.footer.push(
                'This bot is based on [EP Helper](https://github.com/TheFallenSpirit/ep-helper)',
                ' built by [@TheFallenSpirit](https://guns.lol/fallenspirit).'
            );
        };

        const container = createContainer([
            createTextSection(lines.header.join(''), { type: 'thumbnail', url: avatarUrl }),
            createTextDisplay(lines.content.join('')),
            createSeparator(),
            createTextDisplay(lines.footer.join(''))
        ], { color: colors.green });

        await context.editOrReply({ flags: MessageFlags.IsComponentsV2, components: [container] });
    };
};

function generateCommandList(client: UsingClient, options?: CommandListOptions): CommandListItem[] {
    const commandList: CommandListItem[] = [];
    let filteredClientCommands = filterClientCommands(client);

    if (options?.category) filteredClientCommands = filteredClientCommands
    .filter(({ props: { category } }) => category === options.category);

    for (const command of filteredClientCommands) {
        const subCommands = ((command.options ?? []).filter(({ type }) => {
            return type === ApplicationCommandOptionType.Subcommand;
        }) as SubCommand[]).map((cmd) => ({
            ...cmd,
            name: `${command.name}${cmd.group ? ` ${cmd.group}` : ''} ${cmd.name}`,
            isTextOnly: command.ignore === IgnoreCommand.Slash
        }));

        commandList.push({
            name: command.name,
            aliases: command.aliases,
            description: command.description,
            isTextOnly: command.ignore === IgnoreCommand.Slash,
            subCommands: subCommands.length > 0 ? subCommands : undefined
            // syntax: options.withOptions === true ? command.props.textSyntax : undefined,
            // options: options.withOptions === true ? command.options?.filter(({ type }) => type !== 1) : undefined
        });
    };

    commandList.sort((cmd1, cmd2) => (cmd1.subCommands?.length ?? 0) - (cmd2.subCommands?.length ?? 0));
    return commandList;
};

function filterClientCommands(client: UsingClient) {
    return client.commands.values.filter((cmd) => (cmd instanceof Command))
    .filter(({ type }) => type === ApplicationCommandType.ChatInput);
};

interface CommandInfoOptions {
    prefix: string;
    isSubCommand: boolean;
}

function getCommandInfo(command: CommandListItem, options: CommandInfoOptions) {
    return [
        `${command.subCommands ? '\n' : ''}- `,
        command.isTextOnly === true ? `**\`${options.prefix} ${command.name}\`**` : `/${command.name}`,
        command.aliases ? ` ${command.aliases.map((a) => `\`${a}\``).join('')}` : '',
        ` - ${command.description}`
    ].join('')
};

interface CommandCategory {
    label: string;
    description: string;
    key: CommandCategoryKey;
    headerDescription: string;
}

interface CommandListOptions {
    category?: CommandCategoryKey;
}

interface CommandListItem {
    name: string;
    syntax?: string;
    aliases?: string[];
    description: string;
    isTextOnly?: boolean;
    subCommands?: CommandListItem[];
    // options?: CommandOptionWithType[];
}
