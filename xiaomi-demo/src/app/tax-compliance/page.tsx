
'use client';

import Header from '@/client/components/Header';
import StatCard from '@/client/components/ui/StatCard';
import StatusBadge from '@/client/components/ui/StatusBadge';
import { useState } from 'react';
import {
  // LineChart,
  // Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function TaxCompliancePage() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [activeTab, setActiveTab] = useState('overview');

  // Tax compliance data
  const complianceData = [
    {
      id: 'TC-001',
      jurisdiction: 'United States',
      taxType: 'Federal Income Tax',
      entity: 'TechCorp USA Inc.',
      filingDeadline: '2024-03-15',
      status: 'Filed',
      amount: '$285,430.00',
      penalties: '$0.00',
      lastFiled: '2024-03-10',
      nextDue: '2024-06-15',
    },
    {
      id: 'TC-002',
      jurisdiction: 'United Kingdom',
      taxType: 'Corporation Tax',
      entity: 'TechCorp UK Ltd',
      filingDeadline: '2024-01-31',
      status: 'Pending Review',
      amount: '£156,250.00',
      penalties: '£0.00',
      lastFiled: '2024-01-28',
      nextDue: '2024-07-31',
    },
    {
      id: 'TC-003',
      jurisdiction: 'Germany',
      taxType: 'Corporate Income Tax',
      entity: 'TechCorp Deutschland GmbH',
      filingDeadline: '2024-05-31',
      status: 'In Preparation',
      amount: '€198,750.00',
      penalties: '€0.00',
      lastFiled: null,
      nextDue: '2024-05-31',
    },
    {
      id: 'TC-004',
      jurisdiction: 'Singapore',
      taxType: 'Corporate Income Tax',
      entity: 'TechCorp Singapore Pte Ltd',
      filingDeadline: '2024-11-30',
      status: 'Filed',
      amount: 'S$89,420.00',
      penalties: 'S$0.00',
      lastFiled: '2024-01-15',
      nextDue: '2024-11-30',
    },
    {
      id: 'TC-005',
      jurisdiction: 'Canada',
      taxType: 'Corporate Income Tax',
      entity: 'TechCorp Canada Inc.',
      filingDeadline: '2024-06-30',
      status: 'Overdue',
      amount: 'C$167,890.00',
      penalties: 'C$2,450.00',
      lastFiled: null,
      nextDue: '2024-06-30',
    },
  ];

  // Monthly compliance metrics
  const monthlyMetrics = [
    { month: 'Jan', filed: 45, pending: 12, overdue: 3 },
    { month: 'Feb', filed: 52, pending: 8, overdue: 2 },
    { month: 'Mar', filed: 48, pending: 15, overdue: 1 },
    { month: 'Apr', filed: 61, pending: 9, overdue: 4 },
    { month: 'May', filed: 58, pending: 11, overdue: 2 },
    { month: 'Jun', filed: 67, pending: 14, overdue: 3 },
  ];

  // Tax liability by jurisdiction
  const jurisdictionData = [
    { jurisdiction: 'United States', liability: 2450000, filings: 24 },
    { jurisdiction: 'United Kingdom', liability: 1890000, filings: 18 },
    { jurisdiction: 'Germany', liability: 2100000, filings: 16 },
    { jurisdiction: 'Singapore', liability: 850000, filings: 12 },
    { jurisdiction: 'Canada', liability: 1340000, filings: 14 },
    { jurisdiction: 'Australia', liability: 980000, filings: 10 },
  ];

  const jurisdictionOptions = [
    { value: 'all', label: 'All Jurisdictions' },
    { value: 'US', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'SG', label: 'Singapore' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
  ];

  const filteredCompliance = complianceData.filter(
    (item) =>
      selectedJurisdiction === 'all' ||
      item.jurisdiction.includes(selectedJurisdiction)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tax Compliance Management
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor and manage global tax compliance obligations across
                all jurisdictions
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer">
                <i className="ri-file-add-line mr-2"></i>
                New Filing
              </button>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
                <i className="ri-download-line mr-2"></i>
                Export Report
              </button>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <StatCard
              title="Active Entities"
              value="89"
              icon="ri-building-line"
              color="blue"
            />
            <StatCard
              title="Jurisdictions"
              value="28"
              icon="ri-global-line"
              color="green"
            />
            <StatCard
              title="Due This Month"
              value="14"
              icon="ri-time-line"
              color="orange"
            />
            <StatCard
              title="Filed"
              value="156"
              change="+12%"
              changeType="increase"
              icon="ri-file-check-line"
              color="green"
            />
            <StatCard
              title="Overdue"
              value="3"
              change="-25%"
              changeType="decrease"
              icon="ri-alert-line"
              color="red"
            />
            <StatCard
              title="Total Liability"
              value="$8.9M"
              change="+5.2%"
              changeType="increase"
              icon="ri-money-dollar-circle-line"
              color="purple"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="ri-dashboard-line mr-2"></i>
                Compliance Overview
              </button>
              <button
                onClick={() => setActiveTab('filings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                  activeTab === 'filings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="ri-file-list-line mr-2"></i>
                Tax Filings
              </button>
              <button
                onClick={() => setActiveTab('obligations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                  activeTab === 'obligations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="ri-calendar-check-line mr-2"></i>
                Obligations Calendar
              </button>
              <button
                onClick={() => setActiveTab('penalties')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                  activeTab === 'penalties'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="ri-error-warning-line mr-2"></i>
                Penalties &amp; Interest
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Monthly Compliance Metrics */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Monthly Filing Status
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyMetrics}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                      />
                      <XAxis
                        dataKey="month"
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="filed"
                        stackId="a"
                        fill="#10b981"
                        name="Filed"
                      />
                      <Bar
                        dataKey="pending"
                        stackId="a"
                        fill="#f59e0b"
                        name="Pending"
                      />
                      <Bar
                        dataKey="overdue"
                        stackId="a"
                        fill="#ef4444"
                        name="Overdue"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Tax Liability by Jurisdiction */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tax Liability by Jurisdiction
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={jurisdictionData} layout="horizontal">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                      />
                      <XAxis
                        type="number"
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis
                        type="category"
                        dataKey="jurisdiction"
                        stroke="#6b7280"
                        fontSize={10}
                        width={100}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `$${(typeof value === 'number' ? (value / 1000000).toFixed(1) : '0')}M`,
                          'Liability',
                        ]}
                      />
                      <Bar dataKey="liability" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Critical Alerts */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4">
                  <i className="ri-alert-line mr-2"></i>
                  Critical Compliance Alerts
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <i className="ri-time-line text-white text-sm"></i>
                      </div>
                      <div>
                        <div className="font-medium text-red-900">
                          Canada Corporate Tax Overdue
                        </div>
                        <div className="text-sm text-red-700">
                          TechCorp Canada Inc. - Due: 2024-06-30
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-900">
                        C$167,890.00
                      </div>
                      <div className="text-sm text-red-700">
                        Penalty: C$2,450.00
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <i className="ri-time-line text-white text-sm"></i>
                      </div>
                      <div>
                        <div className="font-medium text-yellow-900">
                          Germany VAT Return Due Soon
                        </div>
                        <div className="text-sm text-yellow-700">
                          TechCorp Deutschland GmbH - Due: 2024-02-10
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-yellow-900">
                        €45,230.00
                      </div>
                      <div className="text-sm text-yellow-700">
                        3 days remaining
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tax Filings Tab */}
          {activeTab === 'filings' && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center mb-6">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">
                    Jurisdiction:
                  </label>
                  <select
                    value={selectedJurisdiction}
                    onChange={(e) => setSelectedJurisdiction(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                  >
                    {jurisdictionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">
                    Period:
                  </label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                  >
                    <option value="current">Current Period</option>
                    <option value="previous">Previous Period</option>
                    <option value="all">All Periods</option>
                  </select>
                </div>

                <div className="flex-1"></div>

                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search entities..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
              </div>

              {/* Filings Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-6 font-medium text-gray-900">
                        Filing ID
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">
                        Entity
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">
                        Jurisdiction
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">
                        Tax Type
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">
                        Amount
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">
                        Due Date
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompliance.map((filing) => (
                      <tr
                        key={filing.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-6">
                          <span className="font-mono text-sm text-blue-600">
                            {filing.id}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">
                              {filing.entity}
                            </p>
                            <p className="text-xs text-gray-500">
                              {filing.lastFiled
                                ? `Last filed: ${filing.lastFiled}`
                                : 'Never filed'}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-700">
                            {filing.jurisdiction}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {filing.taxType}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <span className="font-medium text-gray-900">
                              {filing.amount}
                            </span>
                            {filing.penalties !== '$0.00' &&
                              filing.penalties !== '£0.00' &&
                              filing.penalties !== '€0.00' &&
                              filing.penalties !== 'S$0.00' &&
                              filing.penalties !== 'C$0.00' && (
                                <p className="text-xs text-red-600">
                                  Penalty: {filing.penalties}
                                </p>
                              )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <span className="text-sm text-gray-600">
                              {filing.filingDeadline}
                            </span>
                            <p className="text-xs text-gray-500">
                              Next: {filing.nextDue}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={filing.status} type="filing" />
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
                              <i className="ri-send-plane-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Obligations Calendar Tab */}
          {activeTab === 'obligations' && (
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  <i className="ri-calendar-line mr-2"></i>
                  Upcoming Tax Obligations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">
                        Feb 10, 2024
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                        Due Soon
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <div className="font-medium">Germany VAT Return</div>
                      <div>TechCorp Deutschland GmbH</div>
                      <div className="text-blue-600 font-medium mt-1">
                        €45,230.00
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">
                        Mar 15, 2024
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        On Track
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <div className="font-medium">US Federal Income Tax</div>
                      <div>TechCorp USA Inc.</div>
                      <div className="text-blue-600 font-medium mt-1">
                        $285,430.00
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">
                        May 31, 2024
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                        Scheduled
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <div className="font-medium">
                        Germany Corp Income Tax
                      </div>
                      <div>TechCorp Deutschland GmbH</div>
                      <div className="text-blue-600 font-medium mt-1">
                        €198,750.00
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Annual Tax Calendar
                </h3>
                <div className="grid grid-cols-12 gap-1 text-xs">
                  {/* Calendar header */}
                  <div className="col-span-12 grid grid-cols-12 gap-1 mb-2">
                    {[
                      'Jan',
                      'Feb',
                      'Mar',
                      'Apr',
                      'May',
                      'Jun',
                      'Jul',
                      'Aug',
                      'Sep',
                      'Oct',
                      'Nov',
                      'Dec',
                    ].map((month) => (
                      <div
                        key={month}
                        className="text-center font-medium text-gray-700 py-2"
                      >
                        {month}
                      </div>
                    ))}
                  </div>

                  {/* Calendar body - simplified representation */}
                  <div className="col-span-12 grid grid-cols-12 gap-1">
                    <div className="bg-green-100 p-2 rounded text-center">
                      <div className="font-medium">15</div>
                      <div className="text-green-800">US Q4</div>
                    </div>
                    <div className="bg-yellow-100 p-2 rounded text-center">
                      <div className="font-medium">10</div>
                      <div className="text-yellow-800">DE VAT</div>
                    </div>
                    <div className="bg-blue-100 p-2 rounded text-center">
                      <div className="font-medium">15</div>
                      <div className="text-blue-800">US Fed</div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded text-center">
                      <div className="font-medium">30</div>
                      <div className="text-gray-800">UK VAT</div>
                    </div>
                    <div className="bg-purple-100 p-2 rounded text-center">
                      <div className="font-medium">31</div>
                      <div className="text-purple-800">DE Corp</div>
                    </div>
                    <div className="bg-red-100 p-2 rounded text-center">
                      <div className="font-medium">30</div>
                      <div className="text-red-800">CA Corp</div>
                    </div>
                    <div className="bg-indigo-100 p-2 rounded text-center">
                      <div className="font-medium">31</div>
                      <div className="text-indigo-800">UK Corp</div>
                    </div>
                    <div className="bg-green-100 p-2 rounded text-center">
                      <div className="font-medium">15</div>
                      <div className="text-green-800">US Q3</div>
                    </div>
                    <div className="bg-orange-100 p-2 rounded text-center">
                      <div className="font-medium">30</div>
                      <div className="text-orange-800">AU GST</div>
                    </div>
                    <div className="bg-teal-100 p-2 rounded text-center">
                      <div className="font-medium">31</div>
                      <div className="text-teal-800">SG Corp</div>
                    </div>
                    <div className="bg-pink-100 p-2 rounded text-center">
                      <div className="font-medium">30</div>
                      <div className="text-pink-800">FR VAT</div>
                    </div>
                    <div className="bg-cyan-100 p-2 rounded text-center">
                      <div className="font-medium">31</div>
                      <div className="text-cyan-800">Year End</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Penalties Tab */}
          {activeTab === 'penalties' && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4">
                  <i className="ri-error-warning-line mr-2"></i>
                  Outstanding Penalties &amp; Interest
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        C$2,450.00
                      </div>
                      <div className="text-sm text-red-800">
                        Late Filing Penalty
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Canada Corporate Tax
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        $850.00
                      </div>
                      <div className="text-sm text-red-800">
                        Interest Charges
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        US State Tax
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        €1,200.00
                      </div>
                      <div className="text-sm text-yellow-800">
                        Potential Penalty
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Germany VAT (if late)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Penalty Prevention System
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <i className="ri-shield-check-line text-white text-sm"></i>
                      </div>
                      <div>
                        <div className="font-medium text-green-900">
                          Automated Reminders
                        </div>
                        <div className="text-sm text-green-700">
                          Email alerts 30, 14, and 7 days before due dates
                        </div>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <i className="ri-calendar-check-line text-white text-sm"></i>
                      </div>
                      <div>
                        <div className="font-medium text-blue-900">
                          Calendar Integration
                        </div>
                        <div className="text-sm text-blue-700">
                          Sync with team calendars and project management
                          tools
                        </div>
                      </div>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <i className="ri-robot-line text-white text-sm"></i>
                      </div>
                      <div>
                        <div className="font-medium text-purple-900">
                          AI Risk Assessment
                        </div>
                        <div className="text-sm text-purple-700">
                          Predictive analysis for potential compliance issues
                        </div>
                      </div>
                    </div>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      Beta
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
