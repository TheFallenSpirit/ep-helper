import { randomId } from '@fallencodes/seyfert-utils';
import { model, Schema } from 'mongoose';

export interface RoleAutomation {
    name: string;
    primaryRoleId: string;
    triggerRoleIds: string[];
    type: 'add-on-add' | 'remove-on-add';
}

interface VIPRole {
    canBeHoisted?: boolean;
    canBeMentionable?: boolean;
    defaultMemberLimit?: boolean;
}

interface VIP {
    role?: VIPRole;
    enabled?: boolean;
    vipRoleId?: string;
    defaultMaxReactions?: number;
}

export interface GuildI {
    vip?: VIP;
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

const vipRoleSchema = new Schema<VIPRole>({
    canBeHoisted: { required: false, type: Boolean },
    canBeMentionable: { required: false, type: Boolean },
    defaultMemberLimit: { required: false, type: Number }
}, { _id: false, versionKey: false });

const vipSchema = new Schema<VIP>({
    enabled: { required: false, type: Boolean },
    vipRoleId: { required: false, type: String },
    defaultMaxReactions: { required: false, type: Number },
    role: { required: false, type: vipRoleSchema }
}, { _id: false, versionKey: false });

const guildSchema = new Schema<GuildI>({
    _id: { required: true, type: String, default: () => randomId(16) },
    guildId: { required: true, type: String },
    prefix: { required: false, type: String },
    vip: { required: false, type: vipSchema },
    mediaChannels: { required: false, type: [String] },
    roleAutomations: { required: false, type: [roleAutomationSchema] } 
}, { _id: false, versionKey: false, timestamps: true });

export default model('guilds', guildSchema);
