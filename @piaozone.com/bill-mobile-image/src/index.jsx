/*eslint-disbale*/
import React from 'react';
import PropTypes from 'prop-types';
import './style.less';
import Tabs from './tabs/';
import Cover from './cover/';
import MobileCarouse from '@piaozone.com/mobile-carouse';
import Electron from './electron';
import PaperInvoices from './paper';
import Attaches from './attach';
import LoadFail from './loadFail';
const imgIcon = require('./media/img/imgIcon.png');
const listIcon = require('./media/img/viewIcon.png');
class MobileImage extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            showList: true,
            tabIndex: 0,
            rejectState: false,
            tabList: []
        };
    }

    componentDidMount() {
        const { rejectFunc } = this.props;
        if (rejectFunc) {
            this.setState({
                rejectState: true
            });
        }
        const tabList = this.creatTabs();
        this.setState({
            tabList
        });
    }

    creatTabs = () => {
        const { cover, paperInvoice, attachment, electronicInvoice } = this.props;
        const tabList = [];
        if (cover.length > 0) {
            tabList.push({ value: '封面', name: 'cover' });
        }
        if (electronicInvoice.length > 0) {
            tabList.push({ value: '电票', name: 'elecInvoice' });
        }
        if (paperInvoice.length > 0) {
            tabList.push({ value: '纸票', name: 'paperInvoice' });
        }
        if (attachment.length > 0) {
            tabList.push({ value: '附件', name: 'attachment' });
        }
        return tabList;
    }

    changeTabIndex = (nextActiveIndex) => {
        const { tabList } = this.state;
        let tabIndex = nextActiveIndex;
        if (nextActiveIndex == tabList.length) {
            tabIndex = tabList.length - 1;
        }
        this.setState({
            tabIndex
        });
    }

    checkPdf = (item) => {
        this.props.checkPdf(item);
    }

    render() {
        const { clientWidth, clientHeight } = document.body;
        const { tabIndex, showList, tabList = [] } = this.state;
        const { rejectState } = this.state;
        const { cover } = this.props;

        return (
            <div className='pwyMobileImage' id='checkImg'>
                {
                    tabList.length > 0 ? (
                        <>
                            <Tabs onChange={this.changeTabIndex} tabIndex={tabIndex} tabList={tabList} />
                            <MobileCarouse
                                index={tabIndex}
                                itemWidth={clientWidth - 1}
                                disabledSwiper={false}
                                disabledDots={true}
                                onSwiperEnd={(e, nextActiveIndex) => this.changeTabIndex(nextActiveIndex)}
                                className='imgContent'
                                showType='page'
                            >
                                {
                                    tabList.map((item) => {
                                        const { name } = item;
                                        if (name === 'cover') {
                                            return (
                                                <Cover
                                                    cover={cover}
                                                    width={clientWidth - 40}
                                                    height={clientHeight - 146}
                                                    changeTabIndex={this.changeTabIndex}
                                                />
                                            );
                                        } else if (name === 'elecInvoice') {
                                            return (
                                                <Electron
                                                    electronicInvoice={this.props.electronicInvoice}
                                                    onDetailClick={this.props.detailClick}
                                                    rejectState={rejectState}
                                                    onCheckPdf={this.checkPdf}
                                                />
                                            );
                                        } else if (name === 'paperInvoice') {
                                            return (
                                                <PaperInvoices
                                                    showList={showList}
                                                    paperInvoice={this.props.paperInvoice}
                                                    onDetailClick={this.props.detailClick}
                                                    changeTabIndex={this.changeTabIndex}
                                                    rejectState={rejectState}
                                                    onCheckPdf={this.checkPdf}
                                                />
                                            );
                                        } else if (name === 'attachment') {
                                            return (
                                                <Attaches
                                                    showList={showList}
                                                    attachment={this.props.attachment}
                                                    onDetailClick={this.props.detailClick}
                                                    changeTabIndex={this.changeTabIndex}
                                                    rejectState={rejectState}
                                                    onCheckPdf={this.checkPdf}
                                                />
                                            );
                                        }
                                    })
                                }
                            </MobileCarouse>
                            {
                                tabList.length > 0 ? (
                                    ['paperInvoice', 'attachment'].indexOf(tabList[tabIndex].name) != -1 ? (
                                        showList ? (
                                            <img className='imgBtn' src={imgIcon} alt='' onClick={() => this.setState({ showList: !showList })} />
                                        ) : (
                                            <img className='imgBtn' src={listIcon} onClick={() => this.setState({ showList: !showList })} alt='' />
                                        )
                                    ) : null
                                ) : null
                            }
                            {
                                rejectState ? (
                                    <div className='bottomBtns'>
                                        <a href='javascript:;' className='btn' onClick={this.props.rejectFunc}>驳回影像</a>
                                    </div>
                                ) : null
                            }
                        </>
                    ) : (
                        <LoadFail />
                    )
                }

            </div>
        );
    }
}

MobileImage.propTypes = {
    paperInvoice: PropTypes.array,
    attachment: PropTypes.array,
    cover: PropTypes.array,
    electronicInvoice: PropTypes.array,
    detailClick: PropTypes.func,
    rejectFunc: PropTypes.func,
    checkPdf: PropTypes.func
};

export default MobileImage;