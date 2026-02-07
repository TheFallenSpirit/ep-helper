import { AnyContext, Client, ParseClient, ParseMiddlewares } from "seyfert";
import middlewares from './common/middlewares.ts';
import { LangKey, LangProps } from './common/lang.ts';
import { PresenceUpdateStatus } from 'seyfert/lib/types/index.js';
import { AppConfigI } from './models/AppConfig.ts';

declare module 'seyfert' {
    interface RegisteredMiddlewares extends ParseMiddlewares<typeof middlewares> {}

    interface ExtraProps {
        category: CommandCategoryKey;
    }

    interface InternalOptions {
        withPrefix: true;
    }

    interface UsingClient extends ParseClient<Client<true>> {
        config: AppConfigI;
        replies: (key: LangKey, props?: LangProps) => string;
    }

    interface ExtendContext {
        replyWith: (context: AnyContext, key: LangKey, props?: LangProps) => void;
    }

    interface CustomEvents {
        redisExpiry: (key: string) => Promise<void>;
    }
};

export type CommandCategoryKey = 'fun' | 'info' | 'admin' | 'utility' | 'internal' | 'hidden';
