import { ActionBuilderComponents, ActionRow, Button, FixedComponents } from 'seyfert';
import { APIMessageComponentEmoji, ButtonStyle } from 'seyfert/lib/types/index.js';

export function createActionRow<T extends ActionBuilderComponents>(...components: FixedComponents<T>[]): ActionRow<T> {
    return new ActionRow<T>().setComponents(components);
};

interface ButtonData {
    url?: string;
    label: string;
    skuId?: string;
    customId: string;
    style: ButtonStyle;
    disabled?: boolean;
    emoji?: APIMessageComponentEmoji;
}

export function createButton(data: ButtonData): Button {
    const button = new Button(data).setCustomId(data.customId);
    if (data.skuId) button.setSKUId(data.skuId);
    return button;
};

