import React from 'react';
import { Button, Tooltip } from 'antd';
import PropTypes from 'prop-types';

function BottomBtn(props = {}) {
    return (
        <div
            style={{
                paddingRight: 15,
                textAlign: 'right',
                borderTop: '1px solid #eee',
                marginTop: 10,
                height: 40,
                lineHeight: '40px',
                verticalAlign: 'middle'
            }}
        >
            {
                props.invoiceState && !props.disabledEdit ? (
                    <span style={{ display: 'inline-block', paddingRight: '20px', color: '#ff9524' }}>
                        注：区块链电子发票校验码填五位即可
                    </span>
                ) : null
            }
            {
                props.onClose ? (
                    <Button onClick={props.onClose} style={{ width: 100 }}>关闭</Button>
                ) : null
            }

            {
                props.currentOperate ? (
                    <Button onClick={props.onShowLedgerdata} type='primary' style={{ width: 120, marginLeft: 10 }}>
                        {props.currentOperate === 'original' ? '查看底账数据' : '查看原图'}
                    </Button>
                ) : null
            }

            {
                typeof props.onPrintInvoice === 'function' ? (
                    <Button onClick={props.onPrintInvoice} type='primary' style={{ width: 100, marginLeft: 10 }}>打印发票</Button>
                ) : null
            }


            {
                props.onDelete ? (
                    <Button onClick={props.onDelete} style={{ width: 100, marginLeft: 10 }}>删除</Button>
                ) : null
            }

            {
                typeof props.onSave === 'function' && !props.disabledEdit ? (
                    props.disabled ? (
                        <Tooltip placement='bottom' title={props.disabledText}>
                            <Button
                                onClick={props.onSave}
                                loading={props.saving}
                                disabled={props.disabled}
                                style={{ marginLeft: 10, width: 100 }}
                            >
                                保存
                            </Button>
                        </Tooltip>
                    ) : (
                        <Button
                            onClick={props.onSave}
                            loading={props.saving}
                            disabled={props.disabled}
                            style={{ marginLeft: 10, width: 100 }}
                        >
                            保存
                        </Button>
                    )
                ) : null
            }
        </div>
    );
}

BottomBtn.propTypes = {
    onClose: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onPrintInvoice: PropTypes.func,
    onShowLedgerdata: PropTypes.func,
    disabled: PropTypes.bool,
    disabledText: PropTypes.string,
    invoiceState: PropTypes.string,
    disabledEdit: PropTypes.bool,
    currentOperate: PropTypes.string,
    saving: PropTypes.bool
};

export default BottomBtn;
