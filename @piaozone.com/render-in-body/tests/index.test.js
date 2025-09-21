import React from 'react';
import { shallow, mount, render} from 'enzyme';
import RenderInBody from '../src/index.js';

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

    it('传递className', function () {
        expect(mWrapper.instance().popup.className).toEqual('pwy-render-in-body test');
    });
});