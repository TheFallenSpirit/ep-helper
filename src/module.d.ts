import { AnyContext, Client, ParseClient, ParseMiddlewares } from "seyfert";
import middlewares from './common/middlewares.ts';
import { LangKey, LangProps } from './common/lang.ts';

declare module 'seyfert' {
    interface RegisteredMiddlewares extends ParseMiddlewares<typeof middlewares> {}

    interface InternalOptions {
        withPrefix: true;
    }

    interface UsingClient extends ParseClient<Client<true>> {
        replies: (key: LangKey, props?: LangProps) => string;
    }

    interface ExtendContext {
        replyWith: (context: AnyContext, key: LangKey, props?: LangProps) => void;
    }
};
