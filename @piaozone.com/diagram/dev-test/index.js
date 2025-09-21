import React from 'react';
import Diagram from '../src/index';
import data from './data1.json';

export default function Test() {
    const { vertexList, edgeList } = data;

    const handleClickDot = (value) => {
        console.log(value, 'value--------------------');
    }

    return (
        <Diagram
            contentWidth={1055}
            contentHeight={569}
            dotList={vertexList}
            lineList={edgeList}
            handleClickDot={handleClickDot}
        />
    )
};
