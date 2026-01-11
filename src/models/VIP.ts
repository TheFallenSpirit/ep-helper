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

export interface VIPI {
    _id: string;
    userId: string;
    role?: VIPRole;
    guildId: string;
    reactions?: string[];
    maxReactionsModifier?: number;
}

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
    reactions: { required: false, type: [String] },
    role: { required: false, type: vipRoleSchema },
    maxReactionsModifier: { required: false, type: Number }
}, { _id: false, versionKey: false, timestamps: true });

export default model('vip-profiles', vipSchema);
