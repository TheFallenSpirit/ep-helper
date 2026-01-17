import { randomId } from '@fallencodes/seyfert-utils';
import { model, Schema } from 'mongoose';

export interface RoleAutomation {
    name: string;
    primaryRoleId: string;
    triggerRoleIds: string[];
    type: 'add-on-add' | 'remove-on-add';
}

interface VIPReactions {
    defaultTriggerLimit?: number;
    defaultReactionLimit?: number;
}

interface VIPRole {
    enabled?: boolean;
    canBeHoisted?: boolean;
    canBeMentionable?: boolean;
    defaultMemberLimit?: number;
}

export interface VIPTier {
    _id: string;
    name: string;
    role?: VIPRole;
    enabled: boolean;
    vipRoleId: string;
    reactions?: VIPReactions;
}

export interface GuildI {
    _id: string;
    prefix?: string;
    guildId: string;
    mediaChannels?: string[];
    vipTiers?: Map<string, VIPTier>;
    roleAutomations?: RoleAutomation[];
}

const roleAutomationSchema = new Schema<RoleAutomation>({
    type: { required: true, type: String },
    name: { required: true, type: String },
    primaryRoleId: { required: true, type: String },
    triggerRoleIds: { required: true, type: [String] }
}, { _id: false, versionKey: false });

const vipReactionsSchema = new Schema<VIPReactions>({
    defaultTriggerLimit: { required: false, type: Number },
    defaultReactionLimit: { required: false, type: Number }
}, { _id: false, versionKey: false });

const vipRoleSchema = new Schema<VIPRole>({
    enabled: { required: false, type: Boolean },
    canBeHoisted: { required: false, type: Boolean },
    canBeMentionable: { required: false, type: Boolean },
    defaultMemberLimit: { required: false, type: Number }
}, { _id: false, versionKey: false });

const vipTierSchema = new Schema<VIPTier>({
    _id: { required: true, type: String, default: () => randomId(8) },
    vipRoleId: { required: true, type: String },
    name: { required: true, type: String },
    enabled: { required: true, type: Boolean, default: true },
    role: { required: false, type: vipRoleSchema },
    reactions: { required: false, type: vipReactionsSchema }
}, { _id: false, versionKey: false });

const guildSchema = new Schema<GuildI>({
    _id: { required: true, type: String, default: () => randomId(16) },
    guildId: { required: true, type: String },
    prefix: { required: false, type: String },
    mediaChannels: { required: false, type: [String] },
    roleAutomations: { required: false, type: [roleAutomationSchema] },
    vipTiers: { required: false, type: Map, of: vipTierSchema }
}, { _id: false, versionKey: false, timestamps: true });

export default model('guilds', guildSchema);
