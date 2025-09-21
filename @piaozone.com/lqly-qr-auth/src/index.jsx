import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Select, Radio, message } from 'antd';
import './style.css';
import { queryQrInfo, queryCheckResult } from './service/scanFace';

const successTip = require('./img/auth_success.png');

const Option = Select.Option;

const LQScanFaceCheck = ({ className, style = {}, companyName, taxNo, API_PRE_PATH }) => {
    const [zrrlx, setZrrlx] = useState('01');
    const [cardType, setCardType] = useState('201');
    const [qrInfo, setQrInfo] = useState({});
    const [cardNumber, setCardNumber] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    let defaultCls = ['pwy-render-in-body lqlyQrAuth'];
    if (className) {
        defaultCls = defaultCls.concat(className.split(' '));
    }

    let tick;

    // 查询认证结果
    const queryScanCheckResult = async(checkId) => {
        const res = await queryCheckResult(API_PRE_PATH, {
            checkId,
            type: 3,
            taxNo
        });

        if (res.errcode !== '0000' && res.errcode !== '91307') {
            message.info(res.description);
        }

        if (res.errcode === '0000') {
            message.info('认证成功');
            window.clearTimeout(tick);
            // 认证成功
            setStep(3);
            return;
        }

        tick = setTimeout(async() => {
            if (step === 2) {
                await queryScanCheckResult(checkId);
            }
        }, 3000);
    };

    // 输入认证信息拿到二维码信息后，触发查询认证结果
    useEffect(() => {
        if (step === 2 && qrInfo.qrId) {
            queryScanCheckResult(qrInfo.qrId);
        }
        return () => {};
    }, [step]);

    const cardTypeList = [
        {
            value: '201',
            name: '居民身份证'
        },
        {
            value: '208',
            name: '外国护照'
        },
        {
            value: '210',
            name: '港澳居民来往内地通行证'
        },
        {
            value: '213',
            name: '台湾居民来往大陆通行证'
        },
        {
            value: '227',
            name: '中国护照'
        },
        {
            value: '233',
            name: '外国人永久居留证'
        },
        {
            value: '237',
            name: '中华人民共和国港澳居民居住证'
        },
        {
            value: '238',
            name: '中华人民共和国台湾居民居住证'
        },
        {
            value: '239',
            name: '中华人民共和国外国人工作许可证（A类）'
        },
        {
            value: '240',
            name: '中华人民共和国外国人工作许可证（B类）'
        },
        {
            value: '241',
            name: '中华人民共和国外国人工作许可证（C类）'
        },
        {
            value: '299',
            name: '其他个人证件'
        }
    ];
    const onChangeZrrlx = (e) => {
        setZrrlx(e.target.value);
    };
    const onChangeCardType = (value) => {
        setCardType(value);
    };

    const onChangeCardNumber = (e) => {
        setCardNumber(e.target.value);
    };



    const getQrInfo = async() => {
        setLoading(true);
        const res = await queryQrInfo(API_PRE_PATH, {
            naturalPersonType: zrrlx,
            authCardType: cardType,
            authCardNumber: cardNumber,
            taxNo
        });
        if (res.errcode !== '0000') {
            message.info(res.description);
            setLoading(false);
            return;
        }
        const resData = res.data || {};
        setLoading(false);
        setQrInfo({
            qrId: resData.rzid,
            qrBase64: resData.base64
        });
        setStep(2);
    };
    if (step === 2) {
        return (
            <div className={defaultCls.join(' ')} style={style}>
                <h1>请使用<b>税务APP</b>扫描二维码进行授权，金蝶帮助企业接入乐企服务</h1>
                <div className='qrBox'>
                    <img src={'data:image/png;base64,' + qrInfo.qrBase64} />
                    <div className='btnRow'>
                        <Button type='primary' onClick={() => setStep(1)}>重新输入认证信息</Button>
                    </div>
                </div>
            </div>
        );
    }
    if (step === 3) {
        return (
            <div className={defaultCls.join(' ')} style={style}>
                <div className='qrBox'>
                    <img src={successTip} className='successIcon' />
                    <p className='successTip'>乐企实人认证成功</p>
                    <div className='btnRow'>
                        <Button type='primary' onClick={() => setStep(1)}>重新输入认证信息</Button>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className={defaultCls.join(' ')} style={style}>
            <h1>请输入企业法定代表人、或财务负责人的信息，开始授权金蝶帮助企业接入乐企服务</h1>
            <div className='row'>
                <label className='label'>企业名称</label>
                <div className='item'>{companyName}</div>
            </div>
            <div className='row gap'>
                <label className='label'>企业税号</label>
                <div className='item'>{taxNo}</div>
            </div>
            <div className='row radioRow'>
                <label className='label'>自然人类型</label>
                <div className='item'>
                    <Radio.Group onChange={onChangeZrrlx} value={zrrlx} className='clearfix'>
                        <Radio value='01'>法定代表人</Radio>
                        <Radio value='02'>财务负责人</Radio>
                    </Radio.Group>
                </div>
            </div>
            <div className='row'>
                <label className='inputLabel label'>证件类型</label>
                <div className='item'>
                    <Select value={cardType} onChange={onChangeCardType}>
                        {
                            cardTypeList.map((item) => {
                                return <Option value={item.value} key={item.key}>{item.name}</Option>;
                            })
                        }
                    </Select>
                </div>
            </div>
            <div className='row'>
                <label className='inputLabel label'>证件号码</label>
                <div className='item'>
                    <Input type='text' value={cardNumber} placeholder='请输入证件号码' onChange={onChangeCardNumber} maxLength={25} />
                </div>
            </div>
            <div className='row btnRow'>
                <Button loading={loading} type='primary' className='btn' disabled={cardNumber.length < 5} onClick={getQrInfo}>获取电子税局验证二维码</Button>
                <p className='tip'>未授权无法使用乐企能力</p>
            </div>
        </div>
    );
};

LQScanFaceCheck.propTypes = {
    API_PRE_PATH: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    companyName: PropTypes.string,
    taxNo: PropTypes.string
};

export default LQScanFaceCheck;