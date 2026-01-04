import { capitalCase, noCase } from 'change-case';
import { AnyContext, CommandContext, OnOptionsReturnObject, PermissionStrings } from 'seyfert';
import { ChannelType, MessageFlags } from 'seyfert/lib/types/index.js';

export default {
    onOptionsError,
    onPermissionsFail,
    onBotPermissionsFail
};

async function onPermissionsFail(context: AnyContext, permissions: PermissionStrings) {
    const lines = [
        `Hold up! | You don't have permissions to do this, you need the following permissions:\n`,
        `\`\`\`txt\n${permissions.map((permission) => capitalCase(permission)).join(', ')}\n\`\`\``
    ];

    return context.editOrReply({ flags: MessageFlags.Ephemeral, content: lines.join('') });
};

async function onBotPermissionsFail(context: AnyContext, permissions: PermissionStrings) {
    const lines = [
        `Hold up! | I don't have permissions to do this, I need the following permissions:\n`,
        `\`\`\`txt\n${permissions.map((permission) => capitalCase(permission)).join(', ')}\n\`\`\``
    ];

    return context.editOrReply({ flags: MessageFlags.Ephemeral, content: lines.join('') });
};

async function onOptionsError(context: CommandContext, metadata: OnOptionsReturnObject) {
    const errorMessages: string[] = [];

    for (const [option, error] of Object.entries(metadata)) {
        if (!error.failed) continue;

        let errorMessage: string | undefined;
        if (error.value.includes('is required but returned no value')) {
            errorMessage = "is required but wasn't provided";
        };
        
        if (error.value.includes('Unknown Role 10011')) errorMessage = "isn't a valid role mention or ID";
        if (error.value.includes('Unknown User 10013')) errorMessage = "isn't a valid user mention or ID";
        if (error.value.includes('Unknown Channel 10003')) errorMessage = "isn't a valid channel mention or ID";

        const parseError = error.parseError?.[0];
        const parseErrorValue = error.parseError?.[1];

        switch (parseError) {
            case 'NUMBER_NAN': errorMessage = `isn't a valid number.`; break;
            case 'NUMBER_MAX_VALUE': errorMessage = `must be less than or equal to ${parseErrorValue}`; break;
            case 'NUMBER_MIN_VALUE': errorMessage = `must be greater than or equal to ${parseErrorValue}`; break;

            case 'STRING_MAX_LENGTH':
                errorMessage = `must be less than or equal to ${parseErrorValue} characters long`;
                break;

            case 'STRING_MIN_LENGTH':
                errorMessage = `must be greater than or equal to ${parseErrorValue} characters long`;
                break;

            case 'NUMBER_INVALID_CHOICE':
            case 'STRING_INVALID_CHOICE':
                errorMessage = `must be equal to ${listFormat((parseErrorValue as ChoiceObject[]))}`;
                break;

            case 'CHANNEL_TYPES':
                errorMessage = `must be a ${channelTypeFormat((parseErrorValue as number[]))} channel mention or ID`;
                break;

            case 'UNKNOWN':
            case 'OPTION_REQUIRED':
                errorMessage = `was provided but isn't valid`;
                break;
        };

        if (!errorMessage) errorMessage = error.value.replace(`${option} `, '');
        errorMessages.push(`The option "${option}" ${errorMessage}.`);
    };

    const lines: string[] = [];
    if (errorMessages.length === 1) lines.push(`Hold up! | ${errorMessages[0]}`); else lines.push(
        `Hold up! | Multiple errors were found with your command syntax:\n`,
        errorMessages.map((message) => `- ${message}`).join('\n')
    );

    return context.editOrReply({ content: lines.join(''), flags: MessageFlags.Ephemeral })
};

interface ChoiceObject {
    name: string;
    value: number | string;
}

function listFormat(options: (string | ChoiceObject)[]) {
    const formatter = new Intl.ListFormat('en', { style: 'long', type: 'disjunction' });

    const mappedOptions = options.map((option) => {
        return typeof option === 'string' ? option.toLowerCase() : option.value.toString().toLowerCase();
    });

    return formatter.format(mappedOptions);
};

function channelTypeFormat(types: number[]) {
    return listFormat(types.map((type) => noCase(ChannelType[type] ?? '').replace('guild ', '')));
};
