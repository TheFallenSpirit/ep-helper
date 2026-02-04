import { randomId } from '@fallencodes/seyfert-utils';
import { model, Schema } from 'mongoose';
import { PresenceUpdateStatus } from 'seyfert/lib/types/index.js';

export interface StatusItem {
    status: Omit<PresenceUpdateStatus, 'offline'>;
    message: string;
}

interface Status {
    items?: StatusItem[];
    changeInterval?: number;
}

export interface AppConfigI {
    _id: string;
    appId: string;
    status?: Status;
    internalAdminIds: string[];
    whitelistedGuildIds?: string[];
};

const statusItemSchema = new Schema<StatusItem>({
    status: { required: true, type: String },
    message: { required: true, type: String }
}, { _id: false, versionKey: false });

const statusSchema = new Schema<Status>({
    items: { required: false, type: [statusItemSchema], default: [] },
    changeInterval: { required: false, type: Number, default: 120 }
}, { _id: false, versionKey: false });

const appConfigSchema = new Schema<AppConfigI>({
    _id: { required: true, type: String, default: () => randomId(16) },
    appId: { required: true, type: String },
    internalAdminIds: { required: true, type: [String], default: [] },
    whitelistedGuildIds: { required: false, type: [String] },
    status: { required: false, type: statusSchema }
}, { _id: false, versionKey: false, timestamps: true });

export default model('app-configs', appConfigSchema);
