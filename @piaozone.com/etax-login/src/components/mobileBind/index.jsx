import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';

import LoginInstructions from '../loginInstructions';
import './index.less';

export default function MobileBindSuccess(props) {
    const [visibleLoginInstructions, visibleLoginInstructionsSet] = useState(true);

    return (
        <div className='etax-mobileBindSuccess'>
            <div className='success'>
                <div className='icon' />
                <div className='text'>您正在绑定电子税局账号</div>
            </div>
            <p>后续您的账号登录税局，金蝶发票云服务号将为您的微信推送登录消息，在微信内即可登录税局</p>
            <p>请点击【验证电子税局账号】完成本次校验</p>
            <Button className='login' type='primary' onClick={props.onClose}>验证电子税局账号</Button>
            <LoginInstructions visible={visibleLoginInstructions} onClose={() => visibleLoginInstructionsSet(false)} />
        </div>
    );
}

MobileBindSuccess.propTypes = {
    onClose: PropTypes.func
};
