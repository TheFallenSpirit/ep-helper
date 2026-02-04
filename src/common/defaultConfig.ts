import { AppConfigI } from '@/models/AppConfig.js';
import { PresenceUpdateStatus } from 'seyfert/lib/types/index.js';

const defaultConfig: AppConfigI = {
    _id: '',
    appId: '',
    internalAdminIds: [],
    status: {
        items: [{ status: PresenceUpdateStatus.Online, message: 'Being super helpful; Change me' }],
    }
};

export default defaultConfig;
