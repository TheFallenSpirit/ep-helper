import { AppConfigI } from '@/module.js';
import { PresenceUpdateStatus } from 'seyfert/lib/types/index.js';

const defaultConfig: AppConfigI = {
    internalAdminIds: [],
    whitelistedGuilds: [],
    status: {
        changeInterval: 120,
        statuses: [{ status: PresenceUpdateStatus.Online, message: 'Being super helpful; Change me' }]
    }
};

export default defaultConfig;
