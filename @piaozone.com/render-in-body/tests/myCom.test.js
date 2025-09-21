import React from 'react';
import {shallow, mount} from 'enzyme';
import RenderInBody from '../src/myCom.js';


describe('myCom Tests', function () {
    const props = {
        layerStyle: { width: 100 },
        className: 'test'
    };
    const mWrapper = shallow(
        <RenderInBody {...props}>
            <h1>Todos</h1>
        </RenderInBody>
    )

    it('创建div层', function () {
        expect(mWrapper.find('div').exists()).toEqual(true);
    });

    it('渲染子组件', function () {
        expect(mWrapper.contains(<h1>Todos</h1>)).toEqual(true);
    });

    it('className传递', function () {
        expect(mWrapper.find('div.pwy-render-in-body').hasClass('test')).toEqual(true);
    });

    it('style传递', function () {
        expect(mWrapper.find('div').props().style.width).toEqual(props.layerStyle.width);
    });

});