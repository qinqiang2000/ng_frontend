import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'antd';
import './index.less';

export default function LoginInstructions(props) {
    return (
        <Modal
            centered
            closable={false}
            visible={props.visible}
            title={null}
            footer={
                <Button style={{ width: '100%' }} type='link' onClick={props.onClose}>知道啦</Button>
            }
            maskClosable={false}
            width={305}
        >
            <article className='loginInstructions'>
                <header>为保障您和贵司的合法权益，请您确认以下登录行为</header>
                <section>
                    <p>我们的全电发票智慧管家将对整个过程中生成的数据进行加密存储，仅用于双方约定的发票开具、收取和勾选抵扣等服务，同时将贵司的数据严格保存在贵司专属的数据库当中。</p>
                    <p>如有任何非授权业务，请予以拒绝，如有任何疑问，请通过【金蝶发票云】公众号的在线客服反馈。</p>
                </section>
            </article>
        </Modal>
    );
}

LoginInstructions.propTypes = {
    visible: PropTypes.bool,
    onClose: PropTypes.func
};
