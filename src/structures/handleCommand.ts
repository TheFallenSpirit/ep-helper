import { HandleCommand } from 'seyfert/lib/commands/handle.js';
import { Yuna } from 'yunaforseyfert';
import { handleModal, handleMessageComponent } from '@fallencodes/seyfert-utils/handleCommand';

export default class extends HandleCommand {
    modal = handleModal;
    messageComponent = handleMessageComponent;

    argsParser = Yuna.parser({
        syntax: { namedOptions: ['--'] },
        breakSearchOnConsumeAllOptions: true
    });

    resolveCommandFromContent = Yuna.resolver({
        client: this.client,
        afterPrepare: () => this.client.logger.debug('Yuna resolver is ready.')
    });
};
