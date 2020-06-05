import { Plugin, PluginEvents } from '../types';
export declare function activatePlugin(pluginToActivate: Plugin | (() => Plugin)): void;
declare type PluginParameters<T> = T extends (...args: infer P) => any ? P : never;
export declare function runPlugins<T extends keyof PluginEvents, E extends PluginParameters<PluginEvents[T]>>(key: T, ...args: E): void;
export {};
