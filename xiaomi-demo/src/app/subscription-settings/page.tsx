
'use client';

import Header from '@/client/components/Header';
import { useState } from 'react';

export default function SubscriptionSettingsPage() {
  const [selectedRuleType, setSelectedRuleType] = useState('tax');
  const [selectedTaxType, setSelectedTaxType] = useState('VAT');
  const [viewMode, setViewMode] = useState('grid');
  const [activeView, setActiveView] = useState('subscribe');
  const [expandedRegions, setExpandedRegions] = useState<string[]>([]);

  const toggleRegion = (regionId: string) => {
    setExpandedRegions(prev => 
      prev.includes(regionId) 
        ? prev.filter(id => id !== regionId)
        : [...prev, regionId]
    );
  };

  const taxEngines = [
    {
      id: 1,
      name: 'China VAT Standard Edition',
      description: 'Applicable to general taxpayers VAT calculation',
      region: 'Mainland China',
      updateTime: '2024-12-15',
      subscribers: '1,234',
      status: 'available',
      currency: 'CNY'
    },
    {
      id: 2,
      name: 'US Federal Tax Enterprise Edition',
      description: 'Applicable to US enterprise federal tax calculation',
      region: 'United States',
      updateTime: '2024-12-10',
      subscribers: '856',
      status: 'subscribed',
      currency: 'USD'
    },
    {
      id: 3,
      name: 'Germany VAT Standard Edition',
      description: 'VAT calculation compliant with German tax regulations',
      region: 'Germany',
      updateTime: '2024-12-08',
      subscribers: '432',
      status: 'available',
      currency: 'EUR'
    },
    {
      id: 4,
      name: 'Japan Consumption Tax Standard Edition',
      description: 'Applicable to Japan consumption tax calculation and filing',
      region: 'Japan',
      updateTime: '2024-12-12',
      subscribers: '678',
      status: 'available',
      currency: 'JPY'
    },
    {
      id: 5,
      name: 'UK VAT Standard Edition',
      description: 'VAT calculation meeting HMRC requirements',
      region: 'United Kingdom',
      updateTime: '2024-12-05',
      subscribers: '523',
      status: 'available',
      currency: 'GBP'
    },
    {
      id: 6,
      name: 'Singapore GST Engine',
      description: 'Applicable to Singapore GST calculation and filing',
      region: 'Singapore',
      updateTime: '2024-12-14',
      subscribers: '289',
      status: 'available',
      currency: 'SGD'
    }
  ];

  const invoiceEngines = [
    {
      id: 1,
      name: 'China Electronic Invoice Engine',
      description: 'Support VAT special invoices and general invoices',
      region: 'Mainland China',
      updateTime: '2024-12-15',
      subscribers: '2,156',
      status: 'available',
      currency: 'CNY'
    },
    {
      id: 2,
      name: 'EU Digital Invoice Standard Edition',
      description: 'Compliant with EU electronic invoice directive requirements',
      region: 'European Union',
      updateTime: '2024-12-12',
      subscribers: '1,089',
      status: 'subscribed',
      currency: 'EUR'
    },
    {
      id: 3,
      name: 'US Invoice Compliance Engine',
      description: 'Meet US state invoice format requirements',
      region: 'United States',
      updateTime: '2024-12-10',
      subscribers: '745',
      status: 'available',
      currency: 'USD'
    },
    {
      id: 4,
      name: 'Japan Electronic Books Engine',
      description: 'Support Japanese electronic books storage law requirements',
      region: 'Japan',
      updateTime: '2024-12-08',
      subscribers: '467',
      status: 'available',
      currency: 'JPY'
    },
    {
      id: 5,
      name: 'Singapore Invoice Digitization',
      description: 'Compliant with IRAS electronic invoice requirements',
      region: 'Singapore',
      updateTime: '2024-12-06',
      subscribers: '234',
      status: 'available',
      currency: 'SGD'
    },
    {
      id: 6,
      name: 'Australia GST Invoice Engine',
      description: 'Australian GST invoice processing and filing',
      region: 'Australia',
      updateTime: '2024-12-09',
      subscribers: '189',
      status: 'available',
      currency: 'AUD'
    }
  ];

  const currentEngines = selectedRuleType === 'tax' ? taxEngines : invoiceEngines;
  const taxTypes = selectedRuleType === 'tax' 
    ? ['VAT', 'Corporate Income Tax', 'Personal Income Tax', 'Resource Tax', 'Customs Duty', 'Consumption Tax', 'Environmental Tax']
    : ['Special Invoice', 'General Invoice', 'Digital Invoice', 'Electronic Invoice', 'Customs Invoice', 'Export Invoice'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex h-screen pt-16">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Country/Region Classification</h2>
              <button 
                onClick={() => setExpandedRegions(['asia-pacific', 'europe', 'north-america'])}
                className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <i className="ri-arrow-down-s-line mr-1"></i>
                Expand All
              </button>
            </div>

            <div className="space-y-2">
              {/* Asia Pacific Region */}
              <div className="tree-node">
                <div 
                  className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => toggleRegion('asia-pacific')}
                >
                  <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <i className={`ri-arrow-right-s-line mr-2 transition-transform ${expandedRegions.includes('asia-pacific') ? 'rotate-90' : ''}`}></i>
                  <span className="text-sm font-medium text-gray-700">Asia Pacific</span>
                  <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">156</span>
                </div>
                
                {expandedRegions.includes('asia-pacific') && (
                  <div className="ml-6 space-y-1">
                    <div className="tree-node">
                      <div 
                        className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => toggleRegion('china')}
                      >
                        <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <i className={`ri-arrow-right-s-line mr-2 transition-transform ${expandedRegions.includes('china') ? 'rotate-90' : ''}`}></i>
                        <span className="text-sm text-gray-600">China</span>
                        <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">45</span>
                      </div>
                      
                      {expandedRegions.includes('china') && (
                        <div className="ml-6 space-y-1">
                          <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                            <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="text-sm text-gray-600">{selectedRuleType === 'tax' ? 'VAT' : 'Special Invoice'}</span>
                            <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">12</span>
                          </div>
                          <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                            <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="text-sm text-gray-600">{selectedRuleType === 'tax' ? 'Corporate Income Tax' : 'General Invoice'}</span>
                            <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">18</span>
                          </div>
                          <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                            <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="text-sm text-gray-600">{selectedRuleType === 'tax' ? 'Personal Income Tax' : 'Electronic Invoice'}</span>
                            <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">15</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="tree-node">
                      <div 
                        className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => toggleRegion('japan')}
                      >
                        <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <i className={`ri-arrow-right-s-line mr-2 transition-transform ${expandedRegions.includes('japan') ? 'rotate-90' : ''}`}></i>
                        <span className="text-sm text-gray-600">Japan</span>
                        <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">38</span>
                      </div>
                      
                      {expandedRegions.includes('japan') && (
                        <div className="ml-6 space-y-1">
                          <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                            <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="text-sm text-gray-600">{selectedRuleType === 'tax' ? 'Consumption Tax' : 'Electronic Books'}</span>
                            <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">16</span>
                          </div>
                          <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                            <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="text-sm text-gray-600">{selectedRuleType === 'tax' ? 'Corporate Tax' : 'Qualified Invoice'}</span>
                            <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">22</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Europe Region */}
              <div className="tree-node">
                <div 
                  className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => toggleRegion('europe')}
                >
                  <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <i className={`ri-arrow-right-s-line mr-2 transition-transform ${expandedRegions.includes('europe') ? 'rotate-90' : ''}`}></i>
                  <span className="text-sm font-medium text-gray-700">Europe</span>
                  <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">203</span>
                </div>
                
                {expandedRegions.includes('europe') && (
                  <div className="ml-6 space-y-1">
                    <div className="tree-node">
                      <div 
                        className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => toggleRegion('germany')}
                      >
                        <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <i className={`ri-arrow-right-s-line mr-2 transition-transform ${expandedRegions.includes('germany') ? 'rotate-90' : ''}`}></i>
                        <span className="text-sm text-gray-600">Germany</span>
                        <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">52</span>
                      </div>
                      
                      {expandedRegions.includes('germany') && (
                        <div className="ml-6 space-y-1">
                          <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                            <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="text-sm text-gray-600">{selectedRuleType === 'tax' ? 'VAT' : 'E-Rechnung'}</span>
                            <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">19</span>
                          </div>
                          <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                            <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="text-sm text-gray-600">{selectedRuleType === 'tax' ? 'Corporate Tax' : 'Rechnung'}</span>
                            <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">33</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* North America Region */}
              <div className="tree-node">
                <div 
                  className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => toggleRegion('north-america')}
                >
                  <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <i className={`ri-arrow-right-s-line mr-2 transition-transform ${expandedRegions.includes('north-america') ? 'rotate-90' : ''}`}></i>
                  <span className="text-sm font-medium text-gray-700">North America</span>
                  <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">89</span>
                </div>
                
                {expandedRegions.includes('north-america') && (
                  <div className="ml-6 space-y-1">
                    <div className="tree-node">
                      <div 
                        className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => toggleRegion('usa')}
                      >
                        <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <i className={`ri-arrow-right-s-line mr-2 transition-transform ${expandedRegions.includes('usa') ? 'rotate-90' : ''}`}></i>
                        <span className="text-sm text-gray-600">United States</span>
                        <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">67</span>
                      </div>
                      
                      {expandedRegions.includes('usa') && (
                        <div className="ml-6 space-y-1">
                          <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                            <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="text-sm text-gray-600">{selectedRuleType === 'tax' ? 'Federal Tax' : '1099 Form'}</span>
                            <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">28</span>
                          </div>
                          <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                            <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="text-sm text-gray-600">{selectedRuleType === 'tax' ? 'State Tax' : 'W-2 Form'}</span>
                            <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">39</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
                Bulk Add Selected Items
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Rule Type Selection */}
            <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Enterprise Rules Subscription Settings</h2>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedRuleType('tax')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                      selectedRuleType === 'tax'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Tax Rules
                  </button>
                  <button
                    onClick={() => setSelectedRuleType('invoice')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                      selectedRuleType === 'invoice'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Invoice Rules
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Select {selectedRuleType === 'tax' ? 'tax' : 'invoice'} rule engines suitable for your enterprise, the system will provide professional {selectedRuleType === 'tax' ? 'tax calculation' : 'invoice processing'} services
              </p>
            </div>

            {/* View Controls */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveView('subscribe')}
                    className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                      activeView === 'subscribe'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Subscription View
                  </button>
                  <button
                    onClick={() => setActiveView('applied')}
                    className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                      activeView === 'applied'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Applied View
                  </button>
                </div>
                
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
                  <i className="ri-add-line mr-2"></i>
                  Create New {selectedRuleType === 'tax' ? 'Tax' : 'Invoice'} Engine
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px space-x-8" aria-label="Tabs">
                  {taxTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedTaxType(type)}
                      className={`px-1 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                        selectedTaxType === type
                          ? 'text-blue-600 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content Area */}
            {activeView === 'subscribe' ? (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1 rounded-md ${
                        viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                      }`}
                    >
                      <i className={`ri-grid-line ${viewMode === 'grid' ? 'text-gray-600' : 'text-gray-400'}`}></i>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1 rounded-md ${
                        viewMode === 'list' ? 'bg-white shadow-sm' : ''
                      }`}
                    >
                      <i className={`ri-list-check ${viewMode === 'list' ? 'text-gray-600' : 'text-gray-400'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Engine Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentEngines.map((engine) => (
                    <div key={engine.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{engine.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{engine.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          engine.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {engine.status === 'available' ? 'Available' : 'Added'}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <i className="ri-map-pin-line mr-2"></i>
                          {engine.region}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <i className="ri-time-line mr-2"></i>
                          Updated: {engine.updateTime}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <i className="ri-user-line mr-2"></i>
                          {engine.subscribers} enterprises subscribed
                        </div>
                      </div>

                      <div className="flex items-center justify-end">
                        <button 
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                            engine.status === 'available'
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-100 text-gray-600 cursor-not-allowed'
                          }`}
                          disabled={engine.status !== 'available'}
                        >
                          {engine.status === 'available' ? 'Add Now' : 'Added'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-gray-600">Showing 1-6 of 24 results</div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 whitespace-nowrap cursor-pointer">
                      Previous
                    </button>
                    <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer">1</button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 whitespace-nowrap cursor-pointer">2</button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 whitespace-nowrap cursor-pointer">3</button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 whitespace-nowrap cursor-pointer">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Applied View */
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Applied {selectedRuleType === 'tax' ? 'Tax' : 'Invoice'} Engines</h2>
                  <p className="text-sm text-gray-600 mt-1">View all {selectedRuleType === 'tax' ? 'tax' : 'invoice'} rule engines currently applied to your enterprise</p>
                </div>

                {/* Mandatory Rules */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <i className="ri-shield-check-line text-red-600 mr-3 text-xl"></i>
                    <h3 className="text-lg font-semibold text-gray-900">Mandatory Application</h3>
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Legal Requirement</span>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {selectedRuleType === 'tax' ? 'China VAT Standard Edition' : 'China Electronic Invoice Engine'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">Applicable scope: Mainland China | Effective date: 2024-01-01</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Mandatory</span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap cursor-pointer">View Details</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {selectedRuleType === 'tax' ? 'China Corporate Income Tax Standard Edition' : 'China Special Invoice System'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">Applicable scope: Mainland China | Effective date: 2024-01-01</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Mandatory</span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap cursor-pointer">View Details</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group Rules */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <i className="ri-building-line text-blue-600 mr-3 text-xl"></i>
                    <h3 className="text-lg font-semibold text-gray-900">Group Designation</h3>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Corporate Requirement</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {selectedRuleType === 'tax' ? 'US Federal Tax Enterprise Edition' : 'US Invoice Compliance Engine'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">Applicable scope: United States | Effective date: 2024-03-01</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Group</span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap cursor-pointer">View Details</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {selectedRuleType === 'tax' ? 'Germany VAT Standard Edition' : 'EU Digital Invoice Standard Edition'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">Applicable scope: {selectedRuleType === 'tax' ? 'Germany' : 'European Union'} | Effective date: 2024-06-01</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Group</span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap cursor-pointer">View Details</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Rules */}
                <div>
                  <div className="flex items-center mb-4">
                    <i className="ri-settings-line text-green-600 mr-3 text-xl"></i>
                    <h3 className="text-lg font-semibold text-gray-900">Custom Engines</h3>
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Enterprise Custom</span>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {selectedRuleType === 'tax' ? 'Cross-border E-commerce Tax Engine V2.0' : 'Cross-border E-commerce Invoice Engine V2.0'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">Applicable scope: Global cross-border business | Effective date: 2024-08-15</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Custom</span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap cursor-pointer">Edit</button>
                        <button className="text-gray-400 hover:text-gray-600 text-sm font-medium whitespace-nowrap cursor-pointer">Deactivate</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {selectedRuleType === 'tax' ? 'Special Industry Tax Calculation Engine' : 'Special Industry Invoice Processing Engine'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">Applicable scope: {selectedRuleType === 'tax' ? 'Manufacturing special taxes' : 'Manufacturing special invoices'} | Effective date: 2024-09-01</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Custom</span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap cursor-pointer">Edit</button>
                        <button className="text-gray-400 hover:text-gray-600 text-sm font-medium whitespace-nowrap cursor-pointer">Deactivate</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
