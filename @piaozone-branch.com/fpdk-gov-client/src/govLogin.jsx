import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import PropTypes from 'prop-types';
import { pwyFetch } from '@piaozone.com/utils';

const GovLoginBox = ({ needClientLoginUrl, clientLoginUrl, onloginCallback }) => {
    const [loginState, setLoginState] = useState(1);
    useEffect(() => {
        onPolling();
    }, []);

    const onPolling = async() => { //轮询二次登录状态登录状态
        if (!needClientLoginUrl) {
            return;
        }
        let goOn = true;
        do {
            const res = await pwyFetch(clientLoginUrl, {
                method: 'post',
                data: {}
            });
            if (res.errcode == '0000') {
                if (res.data && (res.data.loginType == 2 && res.data.etaxAccountType != -1)) {
                    goOn = false;
                    setLoginState(2);
                    onloginCallback({ errcode: '0000', description: '登录成功' });
                }
            } else {
                onloginCallback({ errcode: res.errcode || 'fail', description: res.description });
            }
        } while (goOn);
    };

    return (
        <Modal
            visible={needClientLoginUrl}
            title='客户端登录'
            width={800}
            footer={null}
            zIndex={9999}
            bodyStyle={{ display: 'flex' }}
            onCancel={() => {
                onloginCallback({ errcode: 'cancel', description: '取消电子税局登录' });
            }}
        >
            <iframe
                style={{ margin: '0 auto', width: 600, height: 600, border: 0 }}
                loginState={loginState}
                id='clientLogin'
                src={needClientLoginUrl}
            />
        </Modal>
    );
};

GovLoginBox.propTypes = {
    onloginCallback: PropTypes.func,
    needClientLoginUrl: PropTypes.string.isRequired,
    clientLoginUrl: PropTypes.string.isRequired
};

export default GovLoginBox;