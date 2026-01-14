import { randomId } from '@fallencodes/seyfert-utils';
import { model, Schema } from 'mongoose';

interface VIPRole {
    id: string;
    name?: string;
    colors?: number[];
    members?: string[];
    encodedIcon?: string;
    maxSlotsModifier?: number;
}

interface VIPReaction {
    items?: string[];
    triggers?: string[];
}

export interface VIPI {
    _id: string;
    userId: string;
    tierId: string;
    role?: VIPRole;
    guildId: string;
    // triggers?: string[];
    // reactions?: string[];
    reaction?: VIPReaction;
    maxReactionsModifier?: number;
}

const vipReactionSchema = new Schema<VIPReaction>({
    items: { required: false, type: [String] },
    triggers: { required: false, type: [String] }
}, { _id: false, versionKey: false });

const vipRoleSchema = new Schema<VIPRole>({
    id: { required: true, type: String },
    name: { required: false, type: String },
    colors: { required: false, type: [Number] },
    members: { required: false, type: [String] },
    encodedIcon: { required: false, type: String },
    maxSlotsModifier: { required: false, type: Number }
}, { _id: false, versionKey: false });

const vipSchema = new Schema<VIPI>({
    _id: { required: true, type: String, default: () => randomId(16) },
    userId: { required: true, type: String },
    guildId: { required: true, type: String },
    tierId: { required: true, type: String },
    // triggers: { required: false, type: [String] },
    // reactions: { required: false, type: [String] },
    reaction: { required: false, type: vipReactionSchema },
    role: { required: false, type: vipRoleSchema },
    maxReactionsModifier: { required: false, type: Number }
}, { _id: false, versionKey: false, timestamps: true });

export default model('vip-profiles', vipSchema);
