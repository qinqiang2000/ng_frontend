import { configureStore } from '@reduxjs/toolkit';
import appAndModuleReducer from './appAndModule';

const store = configureStore({
    reducer: {
        appAndModule: appAndModuleReducer
    }
});

export default store;