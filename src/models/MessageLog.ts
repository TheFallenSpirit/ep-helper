import { model, Schema } from 'mongoose';
import { randomId } from '../utilities.js';

interface MessageLogI {
    _id: string;
    guildId: string;
    authorId: string;
    channelId: string;
    messageId: string;
}

const messageLogSchema = new Schema<MessageLogI>({
    _id: { required: true, type: String, default: () => randomId(16) },
    guildId: { required: true, type: String },
    authorId: { required: true, type: String },
    channelId: { required: true, type: String },
    messageId: { required: true, type: String }
}, { _id: false, versionKey: false, timestamps: { createdAt: true } });

export default model('message-logs', messageLogSchema);
