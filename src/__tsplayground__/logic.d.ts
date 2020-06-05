export declare const logic: import("../types").LogicWrapper<{
    actions: () => {
        doit: boolean;
        doitAgain: boolean;
    };
    reducers: () => {
        somethingDone: [boolean, {
            doit: () => boolean;
        }];
    };
}>;
