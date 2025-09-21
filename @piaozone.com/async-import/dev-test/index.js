import React from 'react';
import ReactDOM from 'react-dom';
import AsyncCom from './asyncCom';

const domCom = React.createElement(AsyncCom, {});
ReactDOM.render(domCom, document.getElementById('root'));
