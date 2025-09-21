import { createSlice } from '@reduxjs/toolkit';
import getAppAndModule from '../utils/getAppAndModule';

const appAndModuleSlice = createSlice({
    name: 'appAndModule',
    initialState: getAppAndModule(true),
    reducers: {
        setAppAndModule(state, action) {
            state.version = action.payload.version;
            state.appText = action.payload.appText;
            state.moduleText = action.payload.moduleText;
        }
    }
});

// 导出 action 和 reducer
export const { setAppAndModule } = appAndModuleSlice.actions;
export default appAndModuleSlice.reducer;
