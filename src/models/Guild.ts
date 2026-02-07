import { randomId } from '@fallencodes/seyfert-utils';
import { model, Schema } from 'mongoose';

interface MediaI {
    autoDelete?: boolean;
    deleteAfterDelay?: number;
}

export interface RoleAutomation {
    name: string;
    primaryRoleId: string;
    triggerRoleIds: string[];
    type: 'add-on-add' | 'remove-on-add';
}

export interface GuildI {
    _id: string;
    media?: MediaI;
    prefix?: string;
    guildId: string;
    whipLines?: string[];
    logsChannelId?: string;
    mediaChannels?: string[];
    roleAutomations?: RoleAutomation[];
}

const mediaSchema = new Schema<MediaI>({
    autoDelete: { required: false, type: Boolean },
    deleteAfterDelay: { required: false, type: Number }
}, { _id: false, versionKey: false });

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
    logsChannelId: { required: false, type: String },
    whipLines: { required: false, type: [String] },
    mediaChannels: { required: false, type: [String] },
    media: { required: false, type: mediaSchema },
    roleAutomations: { required: false, type: [roleAutomationSchema] }
}, { _id: false, versionKey: false, timestamps: true });

export default model('guilds', guildSchema);
