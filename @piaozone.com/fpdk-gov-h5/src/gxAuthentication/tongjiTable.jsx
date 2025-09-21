import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

function TongjiTable({ tongjiList, companyName, taxNo, belongMonth, updateTime, createTjbbStatus }) {
    return (
        <div>
            <p className='tableTitle' style={{ textAlign: 'center' }}>
                <span>发票统计表</span>{
                    createTjbbStatus === '03' ? (
                        <span>-预统计<span style={{ color: '#f00' }}>（未到申报期）</span></span>
                    ) : null
                }
                <span>报表更新时间：{updateTime || '--'}</span>
            </p>
            <p className='tableSubTitle'>
                <span className='item' style={{ textAlign: 'left', paddingLeft: 15, width: '30%' }}>纳税人名称：{companyName}</span>
                <span className='item'>纳税人识别号：{taxNo}</span>
                <span className='item' style={{ width: '20%' }}>所属月份：{belongMonth ? moment(belongMonth, 'YYYYMM').format('YYYY年MM月') : '--'}</span>
                <span className='item' style={{ textAlign: 'right' }}>单位：（份，元）</span>
            </p>
            <table>
                <thead>
                    <tr>
                        <th rowSpan='2' height='80' width='202'>
                            <div className='out'>
                                <div className='category'>
                                    <span className='fplx'>发票类型</span>
                                    <span className='fpyt'>用途</span>
                                </div>
                            </div>
                        </th>
                        <th colSpan='3'>抵扣</th>
                        <th colSpan='3'>不抵扣</th>
                    </tr>
                    <tr>
                        <th>份数</th>
                        <th>金额</th>
                        <th>有效税额</th>
                        <th>份数</th>
                        <th>金额</th>
                        <th>有效税额</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        tongjiList.map((item, i) => {
                            const itemList = item.split('=');
                            const type = itemList[0];
                            let name = '';
                            if (type === '01' || type === '4') {
                                name = '增值税专用发票';
                            } else if (type === '03' || type === '2') {
                                name = '增值税电子专用发票';
                            } else if (type === '08' || type === '12') {
                                name = '机动车销售统一发票';
                            } else if (type === '14' || type === '15') {
                                name = '通行费电子发票';
                            } else if (type === '17' || type === '21') {
                                name = '海关缴款书';
                            } else if (type === '24') {
                                name = '出口转内销发票';
                            } else if (type === '30') {
                                name = '出口转内销电子专用发票';
                            } else if (type === '80') {
                                name = '出口转内销海关缴款书';
                            } else if (type === '99') {
                                name = '总计';
                            }

                            return (
                                <tr key={itemList[0]} height='35px'>
                                    {
                                        itemList.map((v, i) => {
                                            return (
                                                <td key={i}>{i === 0 ? name : v}</td>
                                            );
                                        })
                                    }
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        </div>
    );
}

TongjiTable.propTypes = {
    tongjiList: PropTypes.array,
    companyName: PropTypes.string,
    taxNo: PropTypes.string,
    belongMonth: PropTypes.string,
    updateTime: PropTypes.string,
    createTjbbStatus: PropTypes.string
};

export default TongjiTable;