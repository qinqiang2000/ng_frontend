'use client';

import Header from '@/client/components/Header';
import StatCard from '@/client/components/ui/StatCard';
import StatusBadge from '@/client/components/ui/StatusBadge';
import { useState } from 'react';

export default function SubscriptionsPage() {
  // const [selectedTab, setSelectedTab] = useState('active');
  const [selectedScope, setSelectedScope] = useState('all');

  const subscriptions = [
    {
      id: 1,
      orgId: 'ORG-2024-001',
      orgName: 'TechCorp Limited',
      engineCode: 'VAT_EU_ENGINE',
      engineName: '欧盟增值税引擎',
      country: '英国',
      taxType: 'VAT',
      industry: '科技服务',
      scope: 'MANDATORY',
      status: 'Active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      appliedEntities: 15,
      monthlyRequests: 12450,
      version: 'v2.1.3'
    },
    {
      id: 2,
      orgId: 'ORG-2024-002',
      orgName: 'Global Services GmbH',
      engineCode: 'VAT_DE_ENGINE',
      engineName: '德国增值税引擎',
      country: '德国',
      taxType: 'VAT',
      industry: '制造业',
      scope: 'GROUP_ENFORCED',
      status: 'Active',
      startDate: '2024-02-15',
      endDate: '2024-12-31',
      appliedEntities: 8,
      monthlyRequests: 8750,
      version: 'v1.9.2'
    },
    {
      id: 3,
      orgId: 'ORG-2024-003',
      orgName: 'Singapore Tech Pte Ltd',
      engineCode: 'GST_SG_ENGINE',
      engineName: '新加坡消费税引擎',
      country: '新加坡',
      taxType: 'GST',
      industry: '金融服务',
      scope: 'CUSTOM',
      status: 'PendingUpdate',
      startDate: '2024-01-20',
      endDate: '2024-12-31',
      appliedEntities: 3,
      monthlyRequests: 2340,
      version: 'v1.5.1'
    },
    {
      id: 4,
      orgId: 'ORG-2024-004',
      orgName: 'American Corp Inc',
      engineCode: 'SALES_TAX_US_ENGINE',
      engineName: '美国销售税引擎',
      country: '美国',
      taxType: 'Sales Tax',
      industry: '零售业',
      scope: 'MANDATORY',
      status: 'Provisioned',
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      appliedEntities: 25,
      monthlyRequests: 18900,
      version: 'v3.0.1'
    },
    {
      id: 5,
      orgId: 'ORG-2024-005',
      orgName: 'French Solutions SARL',
      engineCode: 'VAT_FR_ENGINE',
      engineName: '法国增值税引擎',
      country: '法国',
      taxType: 'VAT',
      industry: '咨询服务',
      scope: 'CUSTOM',
      status: 'Suspended',
      startDate: '2023-12-01',
      endDate: '2024-11-30',
      appliedEntities: 6,
      monthlyRequests: 3200,
      version: 'v2.0.8'
    }
  ];

  const scopes = ['全部', 'MANDATORY', 'GROUP_ENFORCED', 'CUSTOM'];

  const filteredSubscriptions = subscriptions.filter(sub => 
    selectedScope === 'all' || selectedScope === '全部' || sub.scope === selectedScope
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">企业订阅管理</h1>
              <p className="text-gray-600 mt-2">管理企业对税务和发票引擎的订阅服务</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
              <i className="ri-add-line mr-2"></i>
              新增订阅
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <StatCard
              title="总订阅数"
              value="89"
              change="+5"
              changeType="increase"
              icon="ri-building-4-line"
              color="blue"
            />
            <StatCard
              title="活跃订阅"
              value="67"
              icon="ri-check-double-line"
              color="green"
            />
            <StatCard
              title="待更新"
              value="12"
              icon="ri-time-line"
              color="orange"
            />
            <StatCard
              title="暂停订阅"
              value="8"
              icon="ri-pause-line"
              color="red"
            />
            <StatCard
              title="月度调用量"
              value="156.2K"
              change="+23.5%"
              changeType="increase"
              icon="ri-line-chart-line"
              color="purple"
            />
          </div>
        </div>

        {/* Subscription Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">订阅范围分布</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">强制订阅 (MANDATORY)</span>
                </div>
                <span className="text-sm font-medium text-gray-900">45</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">集团强制 (GROUP_ENFORCED)</span>
                </div>
                <span className="text-sm font-medium text-gray-900">28</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">自定义 (CUSTOM)</span>
                </div>
                <span className="text-sm font-medium text-gray-900">16</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">热门引擎</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">欧盟增值税引擎</span>
                <span className="text-sm font-medium text-gray-900">23 订阅</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">美国销售税引擎</span>
                <span className="text-sm font-medium text-gray-900">18 订阅</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">新加坡消费税引擎</span>
                <span className="text-sm font-medium text-gray-900">12 订阅</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">德国增值税引擎</span>
                <span className="text-sm font-medium text-gray-900">9 订阅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">即将到期</h3>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">TechCorp Limited</p>
                <p className="text-xs text-gray-600">欧盟增值税引擎 - 30天后到期</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">French Solutions</p>
                <p className="text-xs text-gray-600">法国增值税引擎 - 45天后到期</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Canada Inc</p>
                <p className="text-xs text-gray-600">加拿大HST引擎 - 60天后到期</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">订阅范围:</label>
              <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                {scopes.map((scope) => (
                  <option key={scope} value={scope === '全部' ? 'all' : scope}>
                    {scope}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">状态:</label>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8">
                <option>全部状态</option>
                <option>Active</option>
                <option>Provisioned</option>
                <option>PendingUpdate</option>
                <option>Suspended</option>
              </select>
            </div>

            <div className="flex-1"></div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索企业或引擎..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer">
                <i className="ri-download-line mr-1"></i>
                导出
              </button>
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">订阅列表</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-6 font-medium text-gray-900">企业信息</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">引擎服务</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">国家/税种</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">订阅范围</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">应用实体</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">月度调用</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">状态</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">有效期</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{subscription.orgName}</p>
                        <p className="text-xs text-gray-500 font-mono">{subscription.orgId}</p>
                        <p className="text-xs text-gray-500">{subscription.industry}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{subscription.engineName}</p>
                        <p className="text-xs text-gray-500 font-mono">{subscription.engineCode}</p>
                        <p className="text-xs text-gray-500">版本 {subscription.version}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <span className="text-sm text-gray-900">{subscription.country}</span>
                        <p className="text-xs">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {subscription.taxType}
                          </span>
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        subscription.scope === 'MANDATORY' ? 'bg-red-100 text-red-800' :
                        subscription.scope === 'GROUP_ENFORCED' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {subscription.scope}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{subscription.appliedEntities} 个实体</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{subscription.monthlyRequests.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={subscription.status} type="subscription" />
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm text-gray-900">{subscription.startDate}</p>
                        <p className="text-xs text-gray-500">至 {subscription.endDate}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 cursor-pointer">
                          <i className="ri-eye-line"></i>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600 cursor-pointer">
                          <i className="ri-edit-line"></i>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-orange-600 cursor-pointer">
                          <i className="ri-refresh-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                显示 1-{filteredSubscriptions.length} 条，共 {filteredSubscriptions.length} 条记录
              </p>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap">
                  上一页
                </button>
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                  1
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap">
                  2
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap">
                  下一页
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}