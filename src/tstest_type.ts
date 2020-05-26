//
declare type Reducers<Actions> = {
    [K in keyof Actions]: () => Actions[K];
};
declare type GoesInActions<G extends GoesIn, Actions extends G['actions'] = G['actions']> = {
    [K in keyof Actions]: () => Actions[K];
} & {
    blue: true;
};
interface GoesIn<K extends Record<string, string> = Record<string, string>> {
    actions: K;
    reducers: Reducers<K>;
}
declare const goesIn: GoesIn;
declare const makeThing: <T extends GoesIn<Record<string, string>>>(x: T) => T;
declare const a: {
    actions: {
        firstAction: string;
        secondAction: string;
        thirdAction: string;
    };
    reducers: {
        firstAction: () => string;
        secondAction: () => string;
    };
};
declare type ValueOrArray<T> = T | Array<ValueOrArray<T>>;
declare const a0: ValueOrArray<number>;
declare const a1: ValueOrArray<number>;
interface Input {
    actions?: Record<string, string>;
    reducers?: Record<string, string>;
}
