import React from 'react';
import ReactDOM from 'react-dom';
import ScollWapper from '../src/';
import './test.css';

const list = [1, 2, 3, 4, 5, 6];
const onMounted = (changeScrollLoc, scrollObj) => {
    console.log(changeScrollLoc);
    console.log(scrollObj);
}

ReactDOM.render((
    <ScollWapper width={400} height={320} onMounted={onMounted}>
        <ul>
            {
                list.map((item) => {
                    return (
                        <li>{item}</li>
                    )
                })
            }
        </ul>
    </ScollWapper>
), document.getElementById('root'));