import { HandleCommand } from 'seyfert/lib/commands/handle.js';
import { Yuna } from 'yunaforseyfert';
import { handleModal, handleMessageComponent } from '@fallencodes/seyfert-utils/handleCommand';

export default class extends HandleCommand {
    argsParser = Yuna.parser({
        syntax: { namedOptions: ['--'] },
        breakSearchOnConsumeAllOptions: true
    });

    modal = handleModal;
    messageComponent = handleMessageComponent;
};
