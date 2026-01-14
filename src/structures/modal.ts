import { Label, Modal, StringSelectMenu, TextInput } from 'seyfert';
import { APISelectMenuOption, TextInputStyle } from 'seyfert/lib/types/index.js';

interface ModalData {
    title: string;
    customId: string;
    components: Label[];
}

export default (data: ModalData) => {
    return new Modal({ title: data.title, custom_id: data.customId }).setComponents(data.components);
};

interface ModalTextInputData {
    label?: string;
    value?: string;
    customId: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    description?: string;
    placeholder?: string;
    style: TextInputStyle;
};

export function createModalTextInput(data: ModalTextInputData) {
    return new Label({
        label: data.label,
        description: data.description
    }).setComponent(new TextInput({
        value: data.value,
        style: data.style,
        required: data.required,
        custom_id: data.customId,
        min_length: data.minLength,
        max_length: data.maxLength,
        placeholder: data.placeholder
    }));
};

interface ModalStringSelectMenuData {
    label?: string;
    customId: string;
    required?: boolean;
    minValues?: number;
    maxValues?: number;
    description?: string;
    placeholder?: string;
    options: APISelectMenuOption[];
}

export function createModalStringSelectMenu(data: ModalStringSelectMenuData) {
    return new Label({
        label: data.label,
        description: data.description,
    }).setComponent(new StringSelectMenu({
        options: data.options,
        required: data.required,
        custom_id: data.customId,
        min_values: data.minValues,
        max_values: data.maxValues,
        placeholder: data.placeholder
    }));
};
