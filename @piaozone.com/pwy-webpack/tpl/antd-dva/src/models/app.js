export default {
    namespace: 'fpdkInfo',
    state: {
        appInfo: {}
    },
    subscriptions: {
        async setup(props) {}
    },
    effects: {
        * getAppInfo({ payload: data }, { call, put }) {}
    },
    reducers: {
        updateAppInfo(state, action) {
            const appInfo = action.payload;
            return {
                ...state,
                appInfo: appInfo
            };
        }
    }
};
