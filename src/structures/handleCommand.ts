import { HandleCommand } from 'seyfert/lib/commands/handle.js';
import { Yuna } from 'yunaforseyfert';

export default class extends HandleCommand {
    argsParser = Yuna.parser({
        syntax: { namedOptions: ['--'] },
        breakSearchOnConsumeAllOptions: true
    });
};
