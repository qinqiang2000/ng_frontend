//附件

import React from 'react';
import Attach from './attach';
import PwyCarouse from '@piaozone.com/carouse';
import { Empty, message } from 'antd';
import { confirmDialog } from './tools';
import BottomBtn from './bottomBtn';
import PropTypes from 'prop-types';
import { pwyFetch } from '@piaozone.com/utils';

class AttachList extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            tabIndex: props.activeIndex || 0,
            listData: props.attachList || []
        };
    }

    async componentDidMount() {
        if (!this.props.attachList && typeof this.props.invoiceSerialNo !== 'undefined') {
            const res = await pwyFetch(this.props.queryAttachUrl, {
                method: 'post',
                data: {
                    billSerialNo: this.props.invoiceSerialNo
                }
            });

            if (res.errcode !== '0000') {
                message.destroy();
                message.loading(res.description + '[' + res.errcode + ']');
            } else {
                message.destroy();
                this.setState({
                    listData: res.data
                });
            }
        }
    }

    deleteAttach = (info) => {
        confirmDialog('确定要删除该附件吗？', true, async() => {
            message.loading('处理中...');
            const invoiceSerialNo = this.props.invoiceSerialNo;
            // const res = await deleteInvoiceAttach({
            //     billSerialNos: invoiceSerialNo,
            //     attachSerialNos: info.serialNo
            // });
            const res = { errcode: '0000', description: 'success' };
            if (res.errcode !== '0000') {
                message.info(res.description + '[' + res.errcode + ']');
                message.destroy();
                return;
            }

            const newListData = this.state.listData.filter((item) => {
                return item.serialNo !== info.serialNo;
            });
            this.setState({
                listData: newListData,
                tabIndex: !newListData[this.state.tabIndex] ? 0 : this.state.tabIndex
            });
            this.props.onDelete(invoiceSerialNo, info.serialNo);
            message.destroy();
            message.info('删除成功');
        });
    }

    render() {
        const { tabIndex, listData } = this.state;
        const { clientHeight, clientWidth } = this.props;
        return (
            <div className='selectInvoice attachList' style={{ padding: 0 }}>
                {
                    listData.length > 0 ? (
                        <PwyCarouse
                            index={tabIndex}
                            onChangeIndex={(tIndex) => this.setState({ tabIndex: tIndex })}
                            style={{ width: clientWidth - 24, height: clientHeight - 46, background: '#fff' }}
                            disabledDots={true}
                            disabledHandlerIcon={false}
                        >
                            {
                                listData.map((item, i) => {
                                    return (
                                        <Attach
                                            key={item.serialNo}
                                            total={listData.length}
                                            index={tabIndex}
                                            billData={item}
                                            visbile={i === tabIndex}
                                            clientWidth={clientWidth - 24}
                                            clientHeight={clientHeight - 46}
                                            scrollHeight={clientHeight - 240}
                                            onClose={this.props.onClose}
                                            onDelete={this.deleteAttach}
                                            onOk={this.props.onOk}
                                        />
                                    );
                                })
                            }
                        </PwyCarouse>
                    ) : (
                        <div style={{ paddingTop: 100, textAlign: 'center' }}>
                            <div style={{ height: clientHeight - 232 }}>
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </div>
                            <BottomBtn
                                onClose={this.props.onClose}
                            />
                        </div>
                    )
                }
            </div>
        );
    }
}

AttachList.propTypes = {
    attachList: PropTypes.array.isRequired,
    clientHeight: PropTypes.number.isRequired,
    clientWidth: PropTypes.number.isRequired,
    invoiceSerialNo: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    activeIndex: PropTypes.number,
    queryAttachUrl: PropTypes.string
};

export default AttachList;
