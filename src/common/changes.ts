const changesSecretValueRegex = /^\d{17,19}:.+$/;

export function getChanges<T>(query: Partial<T>): Changes {
    const entries = Object.entries(query);
    if (entries.length < 1) return ({ modified: false });

    const formattedChanges = entries.map(([key, value]) => {
        if (changesSecretValueRegex.test(String(value))) {
            return `${key}: ${String(value).split(':')[0]}:<redacted-token>`;
        } else return `${key}: ${value}`
    });

    const toSet = Object.fromEntries(entries.filter(([_, value]) => value !== 'null'));
    const toUnSet = Object.fromEntries(entries.filter(([_, value]) => value === 'null'));

    return ({
        modified: true,
        raw: formattedChanges,
        query: { $set: toSet, $unset: toUnSet },
        formatted: `\`\`\`txt\n${formattedChanges.join('\n')}\n\`\`\``
    });
};

interface AllChanges {
    raw: string[];
    formatted: string;
    query: Record<any, any>;
}

type Changes = ({ modified: false })
| (AllChanges & ({ modified: true }));
