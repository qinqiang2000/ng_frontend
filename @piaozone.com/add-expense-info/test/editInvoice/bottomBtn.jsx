import React from 'react';
import { Button, Tooltip } from 'antd';

function BottomBtn(props = {}) {
    return (
        <div style={{ paddingRight: 15, textAlign: 'right', borderTop: '1px solid #eee', marginTop: 10, height: 40, lineHeight: '40px', verticalAlign: 'middle' }}>
            {
                props.invoiceState ? (
                    <span style={{ display: 'inline-block', paddingRight: '20px', color: '#ff9524' }}>
                        注：*必填项前四栏为增值税发票查验要素，区块链电子发票校验码填五位即可
                    </span>
                ) : null
            }
            {
                props.onClose ? (
                    <Button onClick={props.onClose} style={{ width: 100 }}>返回</Button>
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
export default BottomBtn;
