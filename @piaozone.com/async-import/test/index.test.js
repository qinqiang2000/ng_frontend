import React from 'react';
import ReactDOM from 'react-dom';
import asyncImport from '../src/index';

const TestCom = asyncImport(() => import('./testCom'));

const domCom = React.createElement(TestCom, {});
ReactDOM.render(domCom, document.getElementById('root'));
