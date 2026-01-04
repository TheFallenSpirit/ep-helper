import { model, Schema } from 'mongoose';
import { randomId } from '../common/utilities.js';

interface MediaLogI {
    _id: string;
    guildId: string;
    authorId: string;
    channelId: string;
    messageId: string;
}

const mediaLogSchema = new Schema<MediaLogI>({
    _id: { required: true, type: String, default: () => randomId(16) },
    guildId: { required: true, type: String },
    authorId: { required: true, type: String },
    channelId: { required: true, type: String },
    messageId: { required: true, type: String }
}, { _id: false, versionKey: false, timestamps: { createdAt: true, updatedAt: false } });

export default model('media-logs', mediaLogSchema);
