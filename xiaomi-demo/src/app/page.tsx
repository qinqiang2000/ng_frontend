
'use client';

import Header from '@/client/components/Header';
import StatCard from '@/client/components/ui/StatCard';
import StatusBadge from '@/client/components/ui/StatusBadge';
import Link from 'next/link';
import { useDashboardTranslation } from '@/client/hooks/useTranslation';

export default function Home() {
  const { t } = useDashboardTranslation();
  const recentActivities = [
    { id: 1, type: 'Rule Version Update', description: 'EU-VAT-001 rule engine updated to v2.1.3', time: '2 hours ago', status: 'Active' },
    { id: 2, type: 'Engine Release', description: 'DE-VAT engine passed QA testing', time: '4 hours ago', status: 'Approved' },
    { id: 3, type: 'Corporate Subscription', description: 'TechCorp applied for MANDATORY tier subscription', time: '6 hours ago', status: 'Provisioned' },
    { id: 4, type: 'Invoice Request', description: 'Batch invoice request status changed to Delivered', time: '1 day ago', status: 'Delivered' },
  ];

  // Invoice delivery data - based on real data structure
  const invoiceDeliveryList = [
    {
      buyerId: 'ORG-UK-001234',
      countryCode: 'GB',
      tradeAreaCode: 'EU',
      buyerName: 'TechCorp Limited',
      buyerTaxInfo: {
        taxTypeCode: 'VAT',
        taxTypeName: 'Value Added Tax',
        vatNumber: 'GB123456789',
        registrationStatus: 'ACTIVE'
      },
      todayRequestTasks: 145,
      historicalPendingTasks: 23,
      todayCompletedTasks: 142,
      todayInvoiceCount: 138,
      todayDeliveredCount: 135,
      pendingInvoiceRatio: '2.1%'
    },
    {
      buyerId: 'ORG-DE-001567',
      countryCode: 'DE',
      tradeAreaCode: 'EU',
      buyerName: 'Global Services GmbH',
      buyerTaxInfo: {
        taxTypeCode: 'VAT',
        taxTypeName: 'Value Added Tax',
        vatNumber: 'DE987654321',
        registrationStatus: 'ACTIVE'
      },
      todayRequestTasks: 89,
      historicalPendingTasks: 15,
      todayCompletedTasks: 87,
      todayInvoiceCount: 84,
      todayDeliveredCount: 82,
      pendingInvoiceRatio: '1.7%'
    },
    {
      buyerId: 'ORG-SG-002348',
      countryCode: 'SG',
      tradeAreaCode: 'APAC',
      buyerName: 'Singapore Tech Pte Ltd',
      buyerTaxInfo: {
        taxTypeCode: 'GST',
        taxTypeName: 'Goods and Services Tax',
        vatNumber: 'SG200012345M',
        registrationStatus: 'ACTIVE'
      },
      todayRequestTasks: 67,
      historicalPendingTasks: 8,
      todayCompletedTasks: 64,
      todayInvoiceCount: 62,
      todayDeliveredCount: 60,
      pendingInvoiceRatio: '3.0%'
    },
    {
      buyerId: 'ORG-US-003789',
      countryCode: 'US',
      tradeAreaCode: 'NAFTA',
      buyerName: 'American Corp Inc',
      buyerTaxInfo: {
        taxTypeCode: 'SALES_TAX',
        taxTypeName: 'Sales Tax',
        vatNumber: 'US-EIN-123456789',
        registrationStatus: 'ACTIVE'
      },
      todayRequestTasks: 234,
      historicalPendingTasks: 45,
      todayCompletedTasks: 228,
      todayInvoiceCount: 221,
      todayDeliveredCount: 215,
      pendingInvoiceRatio: '2.6%'
    },
    {
      buyerId: 'ORG-FR-004521',
      countryCode: 'FR',
      tradeAreaCode: 'EU',
      buyerName: 'French Solutions SARL',
      buyerTaxInfo: {
        taxTypeCode: 'VAT',
        taxTypeName: 'Value Added Tax',
        vatNumber: 'FR12345678901',
        registrationStatus: 'SUSPENDED'
      },
      todayRequestTasks: 156,
      historicalPendingTasks: 32,
      todayCompletedTasks: 149,
      todayInvoiceCount: 145,
      todayDeliveredCount: 142,
      pendingInvoiceRatio: '4.5%'
    },
    {
      buyerId: 'ORG-CA-005894',
      countryCode: 'CA',
      tradeAreaCode: 'NAFTA',
      buyerName: 'Canadian Enterprises Ltd',
      buyerTaxInfo: {
        taxTypeCode: 'HST',
        taxTypeName: 'Harmonized Sales Tax',
        vatNumber: 'CA-BN-123456789RT0001',
        registrationStatus: 'ACTIVE'
      },
      todayRequestTasks: 112,
      historicalPendingTasks: 18,
      todayCompletedTasks: 108,
      todayInvoiceCount: 105,
      todayDeliveredCount: 103,
      pendingInvoiceRatio: '1.8%'
    }
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="px-6 py-8">
        {/* Hero Section */}
        <div 
          className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-blue-900 to-blue-700"
        >
          <div className="bg-blue-900/80 p-12">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold text-white mb-4">
                {t('hero.title')}
              </h1>
              <p className="text-xl text-blue-100 mb-6">
                {t('hero.subtitle')}
              </p>
              <div className="flex space-x-4">
                <Link href="/tax-rules" className="bg-white text-blue-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap">
                  {t('hero.cta')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview - based on actual data structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('stats.activeStatusRules')}
            value="127"
            change="+12"
            changeType="increase"
            icon="ri-file-list-3-line"
            color="blue"
          />
          <StatCard
            title={t('stats.approvedStatusEngines')}
            value="89"
            change="+7"
            changeType="increase"
            icon="ri-file-check-line"
            color="green"
          />
          <StatCard
            title={t('stats.mandatorySubscriptions')}
            value="45"
            change="+5"
            changeType="increase"
            icon="ri-building-4-line"
            color="purple"
          />
          <StatCard
            title={t('stats.ruleEngineInvocations')}
            value="156,234"
            change="+15.8%"
            changeType="increase"
            icon="ri-loop-right-line"
            color="orange"
          />
        </div>

        {/* Additional Stats - Invoice Processing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('stats.submittedStatusRequests')}
            value="2,341"
            change="+8.2%"
            changeType="increase"
            icon="ri-file-paper-line"
            color="blue"
          />
          <StatCard
            title={t('stats.enrichmentSuccess')}
            value="2,187"
            change="+6.8%"
            changeType="increase"
            icon="ri-check-line"
            color="green"
          />
          <StatCard
            title={t('stats.failedStatusRequests')}
            value="154"
            change="-2.1%"
            changeType="decrease"
            icon="ri-close-line"
            color="red"
          />
          <StatCard
            title={t('stats.validatedStatusRequests')}
            value="2,098"
            change="+7.2%"
            changeType="increase"
            icon="ri-shield-check-line"
            color="green"
          />
        </div>

        {/* Additional Stats - Processing Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Rejected Status Requests"
            value="89"
            change="-5.3%"
            changeType="decrease"
            icon="ri-shield-cross-line"
            color="red"
          />
          <StatCard
            title="Delivery Success Rate"
            value="96.2%"
            change="+0.8%"
            changeType="increase"
            icon="ri-check-double-line"
            color="purple"
          />
          <StatCard
            title="Tax Determination Pass Rate"
            value="95.9%"
            change="+1.2%"
            changeType="increase"
            icon="ri-award-line"
            color="orange"
          />
          <StatCard
            title="Average Processing Time"
            value="2.3s"
            change="-0.4s"
            changeType="increase"
            icon="ri-time-line"
            color="blue"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions.title')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/tax-rules" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-settings-3-line text-white"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('quickActions.taxRules.title')}</p>
                  <p className="text-sm text-gray-600">{t('quickActions.taxRules.subtitle')}</p>
                </div>
              </Link>

              <Link href="/invoice-rules" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-file-check-line text-white"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('quickActions.invoiceRules.title')}</p>
                  <p className="text-sm text-gray-600">{t('quickActions.invoiceRules.subtitle')}</p>
                </div>
              </Link>

              <Link href="/subscriptions" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-building-line text-white"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('quickActions.corporateSubscriptions.title')}</p>
                  <p className="text-sm text-gray-600">{t('quickActions.corporateSubscriptions.subtitle')}</p>
                </div>
              </Link>

              <Link href="/release-center" className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-rocket-line text-white"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('quickActions.releaseCenter.title')}</p>
                  <p className="text-sm text-gray-600">{t('quickActions.releaseCenter.subtitle')}</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('recentActivity.title')}</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{activity.type}</p>
                    <p className="text-gray-600 text-sm">{activity.description}</p>
                    <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                  </div>
                  <StatusBadge status={activity.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health - based on Engine status enumeration */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('systemHealth.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">{t('systemHealth.taxEngine')}</p>
                <p className="text-sm text-gray-600">EU-VAT-ENGINE-001</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">{t('systemHealth.invoiceEngine')}</p>
                <p className="text-sm text-gray-600">US-SALES-ENGINE-002</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">{t('systemHealth.apiGateway')}</p>
                <p className="text-sm text-gray-600">{t('systemHealth.deploymentPending')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Delivery List - based on real data structure */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Invoice Delivery Statistics by Organization</h3>
                <p className="text-sm text-gray-600 mt-1">InvoiceRequest processing statistics based on org_id</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer">
                  <i className="ri-refresh-line mr-2"></i>
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Organization ID (org_id)</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Jurisdiction Information</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Organization Name</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Tax Type Information</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Today Submitted</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Historical Queued</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Today Validated</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Today Draft Generated</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Delivered Count</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Failure Rate</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoiceDeliveryList.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm text-blue-600">{item.buyerId}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {item.countryCode}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            {item.tradeAreaCode}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{item.buyerName}</p>
                        <p className="text-xs text-gray-500">Corporate Entity</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                            {item.buyerTaxInfo.taxTypeCode}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.buyerTaxInfo.registrationStatus === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {item.buyerTaxInfo.registrationStatus}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{item.buyerTaxInfo.taxTypeName}</p>
                        <p className="text-xs text-gray-500 font-mono">{item.buyerTaxInfo.vatNumber}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-center">
                        <span className="text-lg font-semibold text-gray-900">{item.todayRequestTasks}</span>
                        <p className="text-xs text-gray-500">Requests</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-center">
                        <span className="text-lg font-semibold text-orange-600">{item.historicalPendingTasks}</span>
                        <p className="text-xs text-gray-500">In Queue</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-center">
                        <span className="text-lg font-semibold text-green-600">{item.todayCompletedTasks}</span>
                        <p className="text-xs text-gray-500">Validated</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-center">
                        <span className="text-lg font-semibold text-blue-600">{item.todayInvoiceCount}</span>
                        <p className="text-xs text-gray-500">Drafts Generated</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-center">
                        <span className="text-lg font-semibold text-purple-600">{item.todayDeliveredCount}</span>
                        <p className="text-xs text-gray-500">Delivered</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-center">
                        <span className={`text-lg font-semibold ${parseFloat(item.pendingInvoiceRatio) > 3 ? 'text-red-600' : 'text-green-600'}`}>
                          {item.pendingInvoiceRatio}
                        </span>
                        <p className="text-xs text-gray-500">Failure Rate</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 cursor-pointer" title="View Details">
                          <i className="ri-eye-line"></i>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600 cursor-pointer" title="Reprocess">
                          <i className="ri-refresh-line"></i>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-orange-600 cursor-pointer" title="Batch Invoice">
                          <i className="ri-file-text-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Statistics */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {invoiceDeliveryList.reduce((sum, item) => sum + item.todayRequestTasks, 0)}
                </div>
                <div className="text-sm text-gray-600">Today Submitted Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {invoiceDeliveryList.reduce((sum, item) => sum + item.todayCompletedTasks, 0)}
                </div>
                <div className="text-sm text-gray-600">Today Validated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {invoiceDeliveryList.reduce((sum, item) => sum + item.todayInvoiceCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Today Draft Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {invoiceDeliveryList.reduce((sum, item) => sum + item.todayDeliveredCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Successfully Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {invoiceDeliveryList.reduce((sum, item) => sum + item.historicalPendingTasks, 0)}
                </div>
                <div className="text-sm text-gray-600">Historical Queued</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
