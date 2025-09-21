'use client';

import Header from '@/client/components/Header';
import { useState } from 'react';
import { useTaxRulesTranslation } from '@/client/hooks/useTranslation';

export default function TaxRulesPage() {
  const { t } = useTaxRulesTranslation();
  const [activeRule, setActiveRule] = useState('CN-BJ-TECH-001');
  // const [selectedTab, setSelectedTab] = useState('vat');
  const [showVatRules, setShowVatRules] = useState(true);
  const [showCorpRules, setShowCorpRules] = useState(false);
  const [showPersonalRules, setShowPersonalRules] = useState(false);
  const [showTariffRules, setShowTariffRules] = useState(false);

  const vatRules = [
    {
      id: 'CN-BJ-TECH-001',
      name: '北京科技企业增值税',
      description: '北京科技企业增值税计算规则',
      status: 'active',
      type: 'validation'
    },
    {
      id: 'CN-SH-MANU-002',
      name: '上海制造业增值税',
      description: '上海制造业增值税计算规则',
      status: 'inactive',
      type: 'validation'
    },
    {
      id: 'CN-GD-SERV-003',
      name: '广东服务业增值税',
      description: '广东服务业增值税计算规则',
      status: 'active',
      type: 'validation'
    }
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('title')}</h2>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer">
                <i className="ri-add-line"></i>
              </button>
            </div>
            <div className="relative">
              <input 
                placeholder={t('searchPlaceholder')} 
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-gray-400"></i>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {/* VAT Rules */}
              <div className="space-y-1">
                <button 
                  onClick={() => setShowVatRules(!showVatRules)}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${showVatRules ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'} text-gray-500`}></i>
                  </div>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-folder-line text-blue-500"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{t('categories.vatRules')}</span>
                  <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded-full">12</span>
                </button>
                
                {showVatRules && (
                  <div className="ml-6 space-y-1">
                    {vatRules.map((rule) => (
                      <button
                        key={rule.id}
                        onClick={() => setActiveRule(rule.id)}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left cursor-pointer ${
                          activeRule === rule.id 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className={`ri-file-code-line ${activeRule === rule.id ? 'text-blue-600' : 'text-gray-500'}`}></i>
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${activeRule === rule.id ? 'text-blue-600' : 'text-gray-900'}`}>
                            {rule.id}
                          </div>
                          <div className="text-xs text-gray-500">{rule.name}</div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${rule.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Corporate Tax Rules */}
              <div className="space-y-1">
                <button 
                  onClick={() => setShowCorpRules(!showCorpRules)}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${showCorpRules ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'} text-gray-500`}></i>
                  </div>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-folder-line text-green-500"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-900">企业所得税规则</span>
                  <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded-full">8</span>
                </button>
              </div>

              {/* Personal Tax Rules */}
              <div className="space-y-1">
                <button 
                  onClick={() => setShowPersonalRules(!showPersonalRules)}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${showPersonalRules ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'} text-gray-500`}></i>
                  </div>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-folder-line text-purple-500"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-900">个人所得税规则</span>
                  <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded-full">15</span>
                </button>
              </div>

              {/* Tariff Rules */}
              <div className="space-y-1">
                <button 
                  onClick={() => setShowTariffRules(!showTariffRules)}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${showTariffRules ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'} text-gray-500`}></i>
                  </div>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-folder-line text-orange-500"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-900">关税规则</span>
                  <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded-full">6</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">CN-BJ-TECH-001</h1>
                <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">启用</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">系统预置</span>
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer">
                  <div className="w-4 h-4 flex items-center justify-center inline-block mr-2">
                    <i className="ri-play-line"></i>
                  </div>
                  测试运行
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer">
                  <div className="w-4 h-4 flex items-center justify-center inline-block mr-2">
                    <i className="ri-history-line"></i>
                  </div>
                  版本历史
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
                  <div className="w-4 h-4 flex items-center justify-center inline-block mr-2">
                    <i className="ri-save-line"></i>
                  </div>
                  保存规则
                </button>
              </div>
            </div>
            <div className="text-lg font-medium text-gray-900 mb-2">北京科技企业增值税计算规则</div>
            <p className="text-gray-600">适用于北京市注册的科技类企业，按照最新增值税政策进行税额计算和优惠减免处理</p>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            <div className="grid grid-cols-2 gap-6 h-full">
              {/* Rule Configuration */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">规则配置</h3>
                </div>
                <div className="flex-1 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">规则名称</label>
                      <input 
                        value="Beijing Tech VAT Rule" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">规则类型</label>
                      <button className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
                        校验规则
                        <div className="w-4 h-4 flex items-center justify-center float-right">
                          <i className="ri-arrow-down-s-line text-gray-500"></i>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">国家</label>
                      <input 
                        value="CN" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">省份</label>
                      <input 
                        value="Beijing" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">行业标签</label>
                      <input 
                        value="TECH" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">应用条件 (JEXL)</label>
                    <textarea 
                      rows={3} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value="company.type == 'TECH' && company.location == 'BEIJING'"
                      readOnly
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">生效时间</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        defaultValue="2024-01-01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">失效时间</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">错误提示</label>
                    <textarea 
                      rows={2} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value="税率计算错误，请检查企业类型和地区信息"
                      readOnly
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">启用状态</label>
                    <div className="relative">
                      <input type="checkbox" id="active-toggle" className="sr-only" defaultChecked />
                      <label htmlFor="active-toggle" className="flex items-center cursor-pointer">
                        <div className="w-11 h-6 bg-green-500 rounded-full shadow-inner relative">
                          <div className="w-4 h-4 bg-white rounded-full shadow absolute top-1 right-1 transition-transform duration-200"></div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rule Expression */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">规则表达式</h3>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 whitespace-nowrap cursor-pointer">
                      <div className="w-4 h-4 flex items-center justify-center inline-block mr-1">
                        <i className="ri-code-line"></i>
                      </div>
                      格式化
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 whitespace-nowrap cursor-pointer">
                      <div className="w-4 h-4 flex items-center justify-center inline-block mr-1">
                        <i className="ri-check-line"></i>
                      </div>
                      验证
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <div className="h-full bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-auto">
                    <div className="text-green-400">{/* 北京科技企业增值税计算规则 */}</div>
                    <div className="text-blue-400">if</div>
                    <div className="text-white">(company.type ==</div>
                    <div className="text-yellow-400">&apos;TECH&apos;</div>
                    <div className="text-white">&& company.location ==</div>
                    <div className="text-yellow-400">&apos;BEIJING&apos;</div>
                    <div className="text-white">) {'{'}</div>
                    <div className="ml-4 text-white">var baseAmount = invoice.amount;</div>
                    <div className="ml-4 text-white">var vatRate =</div>
                    <div className="text-orange-400">0.13</div>
                    <div className="text-white">;</div>
                    <div className="ml-4 text-white">var discountRate =</div>
                    <div className="text-orange-400">0.1</div>
                    <div className="text-white">;</div>
                    <div className="ml-4 text-white"></div>
                    <div className="ml-4 text-green-400">{/* 计算基础增值税 */}</div>
                    <div className="ml-4 text-white">var basicVat = baseAmount * vatRate;</div>
                    <div className="ml-4 text-white"></div>
                    <div className="ml-4 text-green-400">{/* 科技企业优惠 */}</div>
                    <div className="ml-4 text-blue-400">if</div>
                    <div className="text-white">(company.revenue &lt;</div>
                    <div className="text-orange-400">5000000</div>
                    <div className="text-white">) {'{'}</div>
                    <div className="ml-8 text-white">basicVat = basicVat * (</div>
                    <div className="text-orange-400">1</div>
                    <div className="text-white">- discountRate);</div>
                    <div className="ml-4 text-white">{'}'}</div>
                    <div className="ml-4 text-white"></div>
                    <div className="ml-4 text-blue-400">return</div>
                    <div className="text-white">basicVat;</div>
                    <div className="text-white">{'}'}</div>
                    <div className="text-blue-400">return</div>
                    <div className="text-orange-400">0</div>
                    <div className="text-white">;</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test and Debug Section */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">测试与调试</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">测试数据</h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="text-gray-600 mb-2">输入参数:</div>
                      <div className="font-mono text-xs">
                        <div>company.type: &quot;TECH&quot;</div>
                        <div>company.location: &quot;BEIJING&quot;</div>
                        <div>company.revenue: 3000000</div>
                        <div>invoice.amount: 100000</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">执行结果</h4>
                    <div className="bg-green-50 rounded-lg p-3 text-sm">
                      <div className="text-green-700 mb-2">
                        <div className="w-4 h-4 flex items-center justify-center inline-block mr-1">
                          <i className="ri-check-line"></i>
                        </div>
                        执行成功
                      </div>
                      <div className="font-mono text-xs">
                        <div>计算结果: 11700</div>
                        <div>执行时间: 12ms</div>
                        <div>优惠减免: 1300</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">调试日志</h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm h-20 overflow-y-auto">
                      <div className="font-mono text-xs space-y-1">
                        <div className="text-blue-600">[INFO] 规则匹配成功</div>
                        <div className="text-green-600">[DEBUG] 基础税额: 13000</div>
                        <div className="text-green-600">[DEBUG] 优惠税额: 1300</div>
                        <div className="text-blue-600">[INFO] 最终税额: 11700</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Tools Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">工具面板</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Tax Elements */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">税务元素</h3>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-move hover:bg-blue-100 transition-colors" draggable>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-building-line text-blue-600"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-900">销售方信息</div>
                      <div className="text-xs text-blue-700">纳税人识别号、税务资质</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 cursor-move hover:bg-green-100 transition-colors" draggable>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-user-line text-green-600"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-green-900">购买方信息</div>
                      <div className="text-xs text-green-700">纳税人类型、注册地</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 cursor-move hover:bg-purple-100 transition-colors" draggable>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-truck-line text-purple-600"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-purple-900">物流信息</div>
                      <div className="text-xs text-purple-700">发货地、收货地、港口</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 cursor-move hover:bg-orange-100 transition-colors" draggable>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-map-pin-line text-orange-600"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-orange-900">贸易地点</div>
                      <div className="text-xs text-orange-700">交易地、税务辖区</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4P Rule Templates */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">4P 规则模板</h3>
              <div className="space-y-2">
                <button className="w-full p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="text-sm font-medium text-gray-900">货物/服务类型判断</div>
                  <div className="text-xs text-gray-600 mt-1">基于商品编码和服务分类</div>
                </button>
                <button className="w-full p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="text-sm font-medium text-gray-900">购买方资质判断</div>
                  <div className="text-xs text-gray-600 mt-1">一般纳税人、小规模纳税人</div>
                </button>
                <button className="w-full p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="text-sm font-medium text-gray-900">销售方资质判断</div>
                  <div className="text-xs text-gray-600 mt-1">纳税人身份、优惠政策</div>
                </button>
                <button className="w-full p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="text-sm font-medium text-gray-900">送达地判断</div>
                  <div className="text-xs text-gray-600 mt-1">跨境、跨省、同城交易</div>
                </button>
                <button className="w-full p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="text-sm font-medium text-gray-900">税务辖区判断</div>
                  <div className="text-xs text-gray-600 mt-1">管辖范围、适用政策</div>
                </button>
              </div>
            </div>

            {/* Algorithm Rules */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">算法规则</h3>
              <div className="space-y-2">
                <button className="w-full p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="text-sm font-medium text-gray-900">二分查找</div>
                  <div className="text-xs text-gray-600 mt-1">税率区间快速定位</div>
                </button>
                <button className="w-full p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="text-sm font-medium text-gray-900">堆栈计算</div>
                  <div className="text-xs text-gray-600 mt-1">多级税率叠加计算</div>
                </button>
                <button className="w-full p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="text-sm font-medium text-gray-900">交集算法</div>
                  <div className="text-xs text-gray-600 mt-1">多重条件匹配判断</div>
                </button>
                <button className="w-full p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="text-sm font-medium text-gray-900">差集算法</div>
                  <div className="text-xs text-gray-600 mt-1">税收减免差额计算</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}