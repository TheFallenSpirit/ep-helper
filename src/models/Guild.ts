import { randomId } from '@fallencodes/seyfert-utils';
import { model, Schema } from 'mongoose';

export interface RoleAutomation {
    name: string;
    primaryRoleId: string;
    triggerRoleIds: string[];
    type: 'add-on-add' | 'remove-on-add';
}

export interface GuildI {
    _id: string;
    prefix?: string;
    guildId: string;
    mediaChannels?: string[];
    roleAutomations?: RoleAutomation[];
}

const roleAutomationSchema = new Schema<RoleAutomation>({
    type: { required: true, type: String },
    name: { required: true, type: String },
    primaryRoleId: { required: true, type: String },
    triggerRoleIds: { required: true, type: [String] }
}, { _id: false, versionKey: false });

const guildSchema = new Schema<GuildI>({
    _id: { required: true, type: String, default: () => randomId(16) },
    guildId: { required: true, type: String },
    prefix: { required: false, type: String },
    mediaChannels: { required: false, type: [String] },
    roleAutomations: { required: false, type: [roleAutomationSchema] }    
}, { _id: false, versionKey: false, timestamps: true });

export default model('guilds', guildSchema);
