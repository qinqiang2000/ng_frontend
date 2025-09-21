import React from 'react';
import ReactDOM from 'react-dom';
import MyCom from '../src';
import './style.css';

const list = [1, 2, 3, 4, 5, 6];

ReactDOM.render((
    <MyCom className='myCom' style={{ width: 100 }}>
        <ul>
            {
                list.map((item, index) => {
                    return (
                        <li key={index}>{item}</li>
                    )
                })
            }
        </ul>
    </MyCom>
), document.getElementById('root'));