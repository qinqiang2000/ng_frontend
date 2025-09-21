import React from 'react';
import { shallow } from 'enzyme';
import IndexCom from '../src/index';

describe('myCom Tests', function () {
    const props1 = {
        style: { width: 100 },
        className: 'my-test' + (+new Date())
    };

    const props2 = {};

    const mWrapper1 = shallow(
        <IndexCom {...props1}>
            <h1>Todos</h1>
        </IndexCom>
    );

    const mWrapper2 = shallow(
        <IndexCom {...props2}>
            <h1>Todos</h1>
        </IndexCom>
    );

    const clsStr = 'div.' + props1.className;
    const obj = mWrapper1.find(clsStr);
    const obj2 = mWrapper2.find('div.pwy-render-in-body');

    it('元素创建及className控制', function () {
        expect(obj.exists()).toEqual(true);
        expect(obj2.exists()).toEqual(true);
    });

    it('渲染子组件', function () {
        expect(obj.contains(<h1>Todos</h1>)).toEqual(true);
        expect(obj2.contains(<h1>Todos</h1>)).toEqual(true);
    });

    it('style控制', function () {
        expect(obj.props().style.width).toEqual(props1.style.width);
    });
});