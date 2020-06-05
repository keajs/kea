import { Context, ContextOptions } from '../types';
export declare function getContext(): Context;
export declare const getStoreState: () => any;
export declare function setContext(newContext: Context): void;
export declare function openContext(options?: ContextOptions): Context;
export declare function closeContext(): void;
export declare function resetContext(options?: {}): Context;
export declare function withContext(code: (context?: Context) => any, options?: {}): {
    context: Context;
    returnValue: any;
};
export declare function getPluginContext(name: string): Record<string, any>;
export declare function setPluginContext(name: string, pluginContext: object): void;
