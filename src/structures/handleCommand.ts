import { ComponentCommand, ComponentContext, ComponentInteraction, InteractionCommandType, ModalCommand, ModalContext, ModalSubmitInteraction } from 'seyfert';
import { HandleCommand } from 'seyfert/lib/commands/handle.js';
import { Yuna } from 'yunaforseyfert';

export default class extends HandleCommand {
    argsParser = Yuna.parser({
        syntax: { namedOptions: ['--'] },
        breakSearchOnConsumeAllOptions: true
    });

    modal = async (interaction: ModalSubmitInteraction) => {
        const context = new ModalContext(this.client, interaction);
        const extended = this.client.options.context?.(interaction) ?? {};
        Object.assign(context, extended);

        const modal = this.client.components.commands.find((component) => (
            component.type === InteractionCommandType.MODAL &&
            component.customId === interaction.customId.split(':')[0]
        )) as ModalCommand;

        try {
            context.command = modal;
            await this.client.components.execute(modal, context);
        } catch (error) {
            this.client.components.onFail(error);
        };
    };

    messageComponent = async (interaction: ComponentInteraction) => {
        // @ts-expect-error
        const context = new ComponentContext(this.client, interaction);
        const extended = this.client.options.context?.(interaction) ?? {};
        Object.assign(context, extended);

        const component = this.client.components.commands.find((component) => (
            component.type === InteractionCommandType.COMPONENT &&
            component.cType === interaction.componentType &&
            component.customId === interaction.customId.split(':')[0]
        )) as ComponentCommand;

        try {
            context.command = component;
            await this.client.components.execute(component, context);
        } catch (error) {
            await this.client.components.onFail(error);
        };
    };
};

// interface ComponentDeclareOptions {
//     customId: string;
//     props?: ExtraProps;
//     type: keyof ContextComponentCommandInteractionMap;
// }

// export function CDeclare(options: ComponentDeclareOptions) {
//     return <T extends { new (...args: any[]): object }>(target: T) => (class extends target {
//         props = options.props;
//         customId = options.customId;
//         componentType = options.type;

//         constructor(...args: any[]) {
//             super(args);
//         };
//     });
// };

// export abstract class ComponentCommand extends (
//     SeyfertComponentCommand as unknown as ToClass<Omit<ComponentContext, keyof ComponentContext>, ComponentCommand>
// ) {
//     props!: ExtraProps;
//     type = InteractionCommandType.COMPONENT;
//     middlewares: (keyof RegisteredMiddlewares)[] = [];
//     componentType!: keyof ContextComponentCommandInteractionMap;


//     get cType(): number {
//         return ComponentType[this.componentType];
//     };

//     onRunError?(context: ComponentContext, error: unknown): any;
//     onInternalError?(client: UsingClient, error?: unknown): any;
//     onMiddlewaresError?(context: ComponentCon)
//     abstract run(context: ComponentContext<typeof this.componentType>): any;


// };
