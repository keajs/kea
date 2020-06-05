import { Input, InputConnect, Logic, LogicWrapper } from '../types';
export declare function proxyFieldToLogic(wrapper: LogicWrapper, key: keyof Logic | 'path' | 'pathString' | 'props'): void;
export declare function proxyFields(wrapper: LogicWrapper): void;
export declare function kea<T extends Input<T['actions'], T['reducers']>>(input: T): LogicWrapper<T>;
export declare function connect<T extends InputConnect>(input: T): LogicWrapper<{
    connect: T;
}>;
