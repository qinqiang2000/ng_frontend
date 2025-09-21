import React from 'react';
import asyncImport from '../src/index';

const TestCom = asyncImport(() => import('./testCom'), {
    Loading: (props) => {
        return (
            <div {...props}>加载中...</div>
        );
    },
    loadingProps: {
        className: 'loading'
    },
    delayTime: 0
});

export default function AsyncTestCom() {
    return (
        <div>
            <h1 style={{ margin: 0 }}>AsyncTestCom demo</h1>
            <TestCom className="test" />
        </div>
    );
};