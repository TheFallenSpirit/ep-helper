import { Container, ContainerBuilderComponents, Separator, TextDisplay } from 'seyfert';
import { Spacing } from 'seyfert/lib/types/index.js';

export function createSeparator(spacing?: Spacing, divider?: boolean) {
    return new Separator({ spacing, divider });
};

export function createTextDisplay(content: string) {
    return new TextDisplay({ content });
};

interface ContainerOptions {
    color?: string | number;
}

export function createContainer(components: ContainerBuilderComponents[], options?: ContainerOptions) {
    const container = new Container().setComponents(components);

    if (options?.color) {
        let color: number | undefined;
        if (typeof options.color === 'number') color = options.color;
        if (typeof options.color === 'string') color = parseInt(options.color.toString().replace('#', '0x'));
        container.setColor(color!);
    };

    return container;
};
