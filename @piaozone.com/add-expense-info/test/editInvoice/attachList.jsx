//附件
import React from 'react';
import Attach from './attach';
import PwyCarouse from '@piaozone.com/carouse';
import { getInvoiceAttaches, deleteInvoiceAttach, updateAttach } from '../../services/imported';
import { Empty, message } from 'antd';
import { confirmDialog } from '$commons/utils/tools';
import BottomBtn from './bottomBtn';

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
            const res = await getInvoiceAttaches(this.props.invoiceSerialNo);
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
            const res = await deleteInvoiceAttach({
                billSerialNos: invoiceSerialNo,
                attachSerialNos: info.serialNo
            });
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
        const { clientHeight, clientWidth, disabledEdit } = this.props;
        return (
            <div className='noneAddedBillForm selectInvoice' style={{ padding: 0 }}>
                {
                    listData.length > 0 ? (
                        <PwyCarouse
                            index={tabIndex}
                            onChangeIndex={(tIndex) => this.setState({ tabIndex: tIndex })}
                            style={{ width: clientWidth, height: clientHeight - 46, background: '#fff', borderRight: '1px solid #e1e1e1' }}
                            disabledDots={true}
                            disabledHandlerIcon={false}
                        >
                            {
                                listData.map((item, i) => {
                                    return (
                                        <Attach
                                            disabledEdit={disabledEdit}
                                            key={item.serialNo}
                                            total={listData.length}
                                            index={tabIndex}
                                            billData={item}
                                            visbile={i === tabIndex}
                                            clientWidth={clientWidth}
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

export default AttachList;
