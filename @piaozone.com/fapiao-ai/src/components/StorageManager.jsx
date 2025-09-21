/**
 * 存储管理组件
 * 提供查看存储状态、手动保存、清理数据等功能
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Card, Space, Statistic, Row, Col, message, Modal, Typography } from 'antd';
import {
    SaveOutlined,
    DeleteOutlined,
    InfoCircleOutlined,
    ReloadOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import {
    getStorageInfo,
    clearAllData,
    saveStoreState,
    manualSave
} from '../utils/storage';
import store from '../store';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const StorageManager = () => {
    const [storageInfo, setStorageInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    // 从store获取当前状态
    const chatList = useSelector((state) => state.fapiaoAiChat?.chatList || []);
    const templateUrl = useSelector((state) => state.fapiaoAiTemplate?.templateUrl || '');

    // 获取存储信息
    const fetchStorageInfo = () => {
        const info = getStorageInfo();
        setStorageInfo(info);
    };

    // 组件挂载时获取存储信息
    useEffect(() => {
        fetchStorageInfo();
    }, []);

    // 手动保存
    const handleManualSave = async () => {
        setLoading(true);
        try {
            const success = saveStoreState(store.getState());
            if (success) {
                message.success('数据保存成功！');
                fetchStorageInfo(); // 刷新存储信息
            } else {
                message.error('数据保存失败！');
            }
        } catch (error) {
            console.error('保存失败:', error);
            message.error('数据保存失败！');
        } finally {
            setLoading(false);
        }
    };

    // 清理所有数据
    const handleClearAll = () => {
        confirm({
            title: '确认清理所有数据',
            icon: <ExclamationCircleOutlined />,
            content: '这将删除所有保存的聊天记录和模板数据，操作不可恢复！',
            okText: '确认清理',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                const success = clearAllData();
                if (success) {
                    message.success('数据清理成功！');
                    fetchStorageInfo(); // 刷新存储信息
                } else {
                    message.error('数据清理失败！');
                }
            }
        });
    };

    // 刷新存储信息
    const handleRefresh = () => {
        fetchStorageInfo();
        message.info('存储信息已刷新');
    };

    if (!storageInfo) {
        return (
            <Card title="存储管理" loading>
                <Paragraph>正在加载存储信息...</Paragraph>
            </Card>
        );
    }

    return (
        <Card
            title={
                <Space>
                    <InfoCircleOutlined />
                    <span>存储管理</span>
                </Space>
            }
            extra={
                <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    type="text"
                >
                    刷新
                </Button>
            }
        >
            {/* 存储统计 */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                    <Statistic
                        title="聊天记录数量"
                        value={chatList.length}
                        suffix="条"
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title="存储总大小"
                        value={storageInfo.totalSizeKB}
                        suffix="KB"
                        precision={2}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title="模板URL"
                        value={templateUrl ? '已设置' : '未设置'}
                        valueStyle={{
                            color: templateUrl ? '#3f8600' : '#cf1322'
                        }}
                    />
                </Col>
            </Row>

            {/* 详细存储信息 */}
            <Title level={5}>存储详情</Title>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                    <Card size="small" title="聊天数据">
                        <Statistic
                            value={storageInfo.details.FAPIAO_AI_CHAT?.sizeKB || 0}
                            suffix="KB"
                            precision={2}
                        />
                        <Text type="secondary">
                            {storageInfo.details.FAPIAO_AI_CHAT?.exists ? '已保存' : '未保存'}
                        </Text>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card size="small" title="模板数据">
                        <Statistic
                            value={storageInfo.details.FAPIAO_AI_TEMPLATE?.sizeKB || 0}
                            suffix="KB"
                            precision={2}
                        />
                        <Text type="secondary">
                            {storageInfo.details.FAPIAO_AI_TEMPLATE?.exists ? '已保存' : '未保存'}
                        </Text>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card size="small" title="完整备份">
                        <Statistic
                            value={storageInfo.details.FAPIAO_AI_ALL?.sizeKB || 0}
                            suffix="KB"
                            precision={2}
                        />
                        <Text type="secondary">
                            {storageInfo.details.FAPIAO_AI_ALL?.exists ? '已保存' : '未保存'}
                        </Text>
                    </Card>
                </Col>
            </Row>

            {/* 操作按钮 */}
            <Space>
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleManualSave}
                    loading={loading}
                >
                    手动保存
                </Button>
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleClearAll}
                >
                    清理所有数据
                </Button>
            </Space>

            {/* 说明文字 */}
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6f8fa', borderRadius: 6 }}>
                <Title level={5}>说明</Title>
                <Paragraph>
                    <Text>• 数据会自动保存到浏览器本地存储（localStorage）</Text><br />
                    <Text>• 聊天记录和模板设置会在页面刷新后自动恢复</Text><br />
                    <Text>• 数据保存在本地，不会上传到服务器</Text><br />
                    <Text>• 超过7天的数据会自动清理</Text><br />
                    <Text>• 聊天记录超过50条时会自动清理旧记录</Text>
                </Paragraph>
            </div>
        </Card>
    );
};

export default StorageManager;