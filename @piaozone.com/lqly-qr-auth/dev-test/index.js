import React from 'react';
import ReactDOM from 'react-dom';
import MyCom from '../src';
import './style.css';
//
// const list = [1, 2, 3, 4, 5, 6];

ReactDOM.render((
    <MyCom
        className='myCom'
        companyName='金蝶票据云（深圳有限公司）'
        taxNo='91440300MA5G9GK78Y'
    />
), document.getElementById('root'));