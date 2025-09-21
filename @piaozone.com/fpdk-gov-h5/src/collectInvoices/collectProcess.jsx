
import React from 'react';
import { Table } from 'antd';

import PropTypes from 'prop-types';

const CollectProcess = ({ onRetry, processList, pageSize }) => {
    let retryIng = false;
    for (let i = 0; i < processList.length; i++) {
        if (processList[i].retryIng) {
            retryIng = true;
            break;
        }
    }

    return (
        <Table
            dataSource={processList}
            pagination={false}
            bordered={false}
            scroll={{ x: 570, y: 700 }}
            keyValue='key'
            columns={[{
                title: '数据源名称',
                align: 'left',
                dataIndex: 'name',
                width: 150
            }, {
                title: '数据范围',
                dataIndex: 'dataIndex',
                align: 'left',
                width: 120,
                render: (v, r) => {
                    const startNum = (v + 1);
                    let endNum = (v + 1) * pageSize;
                    endNum = endNum > r.totalNum ? r.totalNum : endNum;
                    return '第' + startNum + '-' + endNum + '条';
                }
            }, {
                title: '错误描述',
                dataIndex: 'description',
                width: 200,
                render: (v) => {
                    return v || '--';
                }
            }, {
                title: '操作',
                key: 'operate',
                align: 'left',
                render: (v, r, i) => {
                    if (r.retryIng) {
                        return <span>处理中...</span>;
                    } else if (retryIng) {
                        return <span>请等待...</span>;
                    } else {
                        return <a href='javascript:;' onClick={() => onRetry(r, i)}>重试</a>;
                    }                    
                }
            }]}
        />
    );
};

CollectProcess.propTypes = {
    onRetry: PropTypes.func.isRequired,
    processList: PropTypes.array.isRequired,
    pageSize: PropTypes.number.isRequired
};

export default CollectProcess;