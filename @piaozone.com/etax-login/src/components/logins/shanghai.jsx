import React, { useState, useEffect } from 'react';
import PropTypes, { bool } from 'prop-types';
import { Radio } from 'antd';

import ShanghaiV1 from './shanghai-v1';
import ShanghaiV2 from './login';

function Shanghai(props) {
    const [disabled, disabledSet] = useState(false);
    const [loginType, loginTypeSet] = useState(true);

    useEffect(() => {
        if (props.loginAccount?.loginAccountUid) {
            disabledSet(true);
            // FIXME
            // 旧版loginAccountUid用的是字符，大于长度21 二字姓名-身份证号
            loginTypeSet(props.loginAccount.loginAccountUid.length <= 21);
        }
    }, []);

    return (
        <>
            {
                props.visibleCity ? (
                    <div className='loginItem'>
                        <label className='loginLabel'>登录方式：</label>
                        <Radio.Group disabled={disabled} className='loginInput' onChange={(e) => loginTypeSet(e.target.value)} value={loginType}>
                            <Radio value={true}>新版登录</Radio>
                            <Radio value={false}>旧版登录</Radio>
                        </Radio.Group>
                    </div>
                ) : null
            }

            {
                loginType
                    ? <ShanghaiV2 {...props} visibleCitySet={props.visibleCitySet} />
                    : <ShanghaiV1 {...props} visibleCitySet={props.visibleCitySet} />
            }
        </>
    );
}

Shanghai.propTypes = {
    visibleCity: bool,
    visibleCitySet: PropTypes.func,
    loginAccount: PropTypes.object
};

export default Shanghai;
