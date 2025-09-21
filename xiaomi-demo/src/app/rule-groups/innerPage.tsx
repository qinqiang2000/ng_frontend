'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/client/components/Header';
import CountryRegionSelector from '@/client/components/ui/CountryRegionSelector';
import { fetchRuleGroupsByCompanyId, InvoiceRuleGroup, getStatusColor, fetchAvailableRules, AvailableRule, fetchRulesInGroup, RuleInGroup, createRuleGroup, RuleGroupCreateRequest, updateRuleGroup, RuleGroupUpdateRequest } from '@/client/services/ruleGroupService';
import { useCountry } from '@/client/contexts/CountryContext';
import { useToast } from '@/client/components/ui/ToastContainer';
import { useServerSession } from '@/client/contexts/ServerSessionContext';
import { useRuleGroupsTranslation } from '@/client/hooks/useTranslation';
import Pagination from '@/client/components/ui/Pagination';

export default function RuleGroupsPage() {
  const { selectedCountry } = useCountry();
  const { sessionData } = useServerSession();
  const user = sessionData?.user;
  const { showSuccess, showError } = useToast();
  const { t } = useRuleGroupsTranslation();
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupSearchValue, setGroupSearchValue] = useState('');
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [ruleGroups, setRuleGroups] = useState<InvoiceRuleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    icon: 'ri-folder-line',
    color: 'blue'
  });

  // Available rules state
  const [availableRules, setAvailableRules] = useState<AvailableRule[]>([]);
  const [availableRulesLoading, setAvailableRulesLoading] = useState(false);
  const [availableRulesError, setAvailableRulesError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Rule execution order state
  const [ruleExecutionOrder, setRuleExecutionOrder] = useState<RuleInGroup[]>([]);
  const [ruleExecutionLoading, setRuleExecutionLoading] = useState(false);
  const [ruleExecutionError, setRuleExecutionError] = useState<string | null>(null);

  // Group editing state
  const [editingGroupData, setEditingGroupData] = useState({
    name: '',
    description: ''
  });

  // Get rule type display label
  const getRuleTypeLabel = (ruleType: string): string => {
    const typeMap: { [key: string]: string } = {
      '1': t('ruleTypes.validation'),
      '2': t('ruleTypes.completion')
    };
    return typeMap[ruleType] || `Type ${ruleType}`;
  };

  // Get rule status display label and style
  const getStatusDisplay = (status: number): { label: string; style: string } => {
    switch (status) {
      case 1:
        return { label: t('status.draft'), style: 'bg-gray-100 text-gray-800' };
      case 2:
        return { label: t('status.testPassed'), style: 'bg-blue-100 text-blue-800' };
      case 3:
        return { label: t('status.published'), style: 'bg-orange-100 text-orange-800' };
      case 4:
        return { label: t('status.activated'), style: 'bg-green-100 text-green-800' };
      default:
        return { label: t('status.unknown'), style: 'bg-gray-100 text-gray-800' };
    }
  };


  const organizations = [
    { id: 'KingDee', name: 'KingDee Bill Cloud (Shenzhen) Technology Co., Ltd.', selected: true },
    { id: 'alibaba', name: 'Alibaba Group', selected: false },
    { id: 'tencent', name: 'Tencent Technology', selected: false },
    { id: 'saic', name: 'SAIC Motor Corporation', selected: false },
    { id: 'byd', name: 'BYD Auto', selected: false },
    { id: 'petrochina', name: 'PetroChina', selected: false },
    { id: 'cscec', name: 'China State Construction', selected: false },
    { id: 'cmb', name: 'China Merchants Bank', selected: false },
    { id: 'icbc', name: 'Industrial and Commercial Bank of China', selected: false },
    { id: 'cmcc', name: 'China Mobile', selected: false }
  ];

  const selectedOrgCount = organizations.filter(org => org.selected).length;
  const currentGroup = ruleGroups.find(group => group.id.toString() === selectedGroup);

  const loadRuleGroups = useCallback(async (preserveSelection: boolean = false, currentSelectedGroup?: string) => {
    // Only proceed if user.orgId has a value
    if (!user?.orgId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Hide existing data during loading
      setRuleGroups([]);
      const groups = await fetchRuleGroupsByCompanyId(
        selectedCountry || 'CN',
        groupSearchValue || undefined,
        user.orgId
      );
      setRuleGroups(groups);

      // Use the passed currentSelectedGroup parameter or fall back to state
      const currentSelection = currentSelectedGroup !== undefined ? currentSelectedGroup : selectedGroup;

      // Only set first group as selected if no group is currently selected and we're not preserving selection
      if (groups.length > 0 && !currentSelection && !preserveSelection) {
        const firstGroup = groups[0];
        const firstGroupId = firstGroup.id.toString();
        setSelectedGroup(firstGroupId);
        // Load rules for the first group
        loadRulesInGroup(firstGroup.groupCode);
        // Set initial editing data
        setEditingGroupData({
          name: firstGroup.groupName,
          description: firstGroup.groupDesc || ''
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('messages.failedToLoadGroups');
      setError(errorMessage);
      console.error('Error loading rule groups:', err);
      showError(t('messages.loadFailed'), errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, groupSearchValue, user?.orgId]);

  // Load available rules
  const loadAvailableRules = useCallback(async (searchOverride?: string) => {
    if (!selectedCountry) return;

    try {
      setAvailableRulesLoading(true);
      setAvailableRulesError(null);

      // Use searchOverride if provided, otherwise use current searchTerm
      const searchValue = searchOverride !== undefined
        ? (searchOverride.trim() || undefined)
        : (searchTerm.trim() || undefined);

      const response = await fetchAvailableRules(
        selectedCountry,
        searchValue,
        currentPage,
        pageSize
      );

      setAvailableRules(response.data);
      setTotalRecords(response.totalElement);
      setTotalPages(response.totalPage);
      setCurrentPage(response.currentPage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('messages.failedToLoadRules');
      setAvailableRulesError(errorMessage);
      console.error('Error loading available rules:', err);
      showError(t('messages.loadRulesFailed'), errorMessage);
    } finally {
      setAvailableRulesLoading(false);
    }
  }, [selectedCountry, searchTerm, currentPage, pageSize]);

  // Load rules in selected group
  const loadRulesInGroup = useCallback(async (groupCode: string) => {
    try {
      setRuleExecutionLoading(true);
      setRuleExecutionError(null);
      const rules = await fetchRulesInGroup(groupCode);
      // Sort rules by priority
      const sortedRules = rules.sort((a, b) => a.priority - b.priority);
      setRuleExecutionOrder(sortedRules);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('messages.failedToLoadGroupRules');
      setRuleExecutionError(errorMessage);
      console.error('Error loading rules in group:', err);
      showError(t('messages.loadGroupRulesFailed'), errorMessage);
    } finally {
      setRuleExecutionLoading(false);
    }
  }, []);

  // Load rule groups on component mount and when country changes
  useEffect(() => {
    loadRuleGroups(false, selectedGroup);
  }, [loadRuleGroups]);

  // 1. Initial page load trigger
  useEffect(() => {
    if (selectedCountry && isInitialLoad) {
      loadAvailableRules();
      setIsInitialLoad(false);
    }
  }, [selectedCountry, isInitialLoad, loadAvailableRules]);

  // 2. Country change trigger - clear search and reload
  useEffect(() => {
    if (selectedCountry && !isInitialLoad) {
      setSearchTerm(''); // Clear search input
      setCurrentPage(1); // Reset to first page
      loadAvailableRules(''); // Load with cleared search explicitly
    }
  }, [selectedCountry]); // Only depend on selectedCountry change

  // 5. Pagination change trigger
  useEffect(() => {
    if (selectedCountry && !isInitialLoad) {
      loadAvailableRules();
    }
  }, [currentPage, pageSize]); // Only depend on pagination changes

  // 3. Handle search input change - trigger debounced search
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (selectedCountry) {
      // If search is cleared (empty), trigger immediately
      if (value.trim() === '') {
        loadAvailableRules(''); // Pass empty string explicitly
      } else {
        // For non-empty search, use debounce
        const timeoutId = setTimeout(() => {
          loadAvailableRules(value); // Pass the current value explicitly
        }, 500);

        setSearchTimeout(timeoutId);
      }
    }
  };

  // Handle search on Enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      loadAvailableRules();
    }
  };

  // 4. Manual search button trigger
  const handleManualSearch = () => {
    loadAvailableRules();
  };

  // Handle rule group selection change
  const handleGroupSelection = (groupId: string) => {
    setSelectedGroup(groupId);
    const group = ruleGroups.find(g => g.id.toString() === groupId);
    if (group) {
      loadRulesInGroup(group.groupCode);
      // Set current group data
      setEditingGroupData({
        name: group.groupName,
        description: group.groupDesc || ''
      });
    }
  };

  // Check if a rule is already in the execution order
  const isRuleInExecutionOrder = (ruleCode: string): boolean => {
    return ruleExecutionOrder.some(rule => rule.ruleCode === ruleCode);
  };

  // Handle add rule to execution order
  const handleAddRuleToExecutionOrder = (availableRule: AvailableRule) => {
    if (isRuleInExecutionOrder(availableRule.ruleCode)) return;

    // Convert AvailableRule to RuleInGroup format (mock data for missing fields)
    const newRuleInGroup: RuleInGroup = {
      id: availableRule.id,
      country: availableRule.country,
      invoiceType: availableRule.invoiceType || '',
      subInvoiceType: availableRule.subInvoiceType || '',
      invoiceTypeCode: '',
      subInvoiceTypeCode: '',
      ruleCode: availableRule.ruleCode,
      ruleName: availableRule.ruleName,
      ruleType: parseInt(availableRule.ruleType),
      active: true,
      status: availableRule.status,
      applyTo: '',
      errorMessage: '',
      fieldPath: '',
      priority: ruleExecutionOrder.length + 1, // Set priority as next in order
      ruleExpression: '',
      description: availableRule.description,
      startTime: '',
      endTime: '',
      createTime: availableRule.publishTime,
      updateTime: availableRule.publishTime,
      engineType: 1,
      aiPrompt: ''
    };

    const updatedRules = [...ruleExecutionOrder, newRuleInGroup];
    // Sort by priority to maintain correct order
    const sortedRules = updatedRules.sort((a, b) => a.priority - b.priority);
    setRuleExecutionOrder(sortedRules);
  };

  // Handle remove rule from execution order
  const handleRemoveRuleFromExecutionOrder = (ruleId: number) => {
    const updatedRules = ruleExecutionOrder
      .filter(rule => rule.id !== ruleId)
      .map((rule, index) => ({ ...rule, priority: index + 1 })) // Recalculate priority
      .sort((a, b) => a.priority - b.priority); // Ensure correct order
    setRuleExecutionOrder(updatedRules);
  };

  const handleAddGroup = async () => {
    if (!newGroupData.name.trim()) return;

    try {
      const request: RuleGroupCreateRequest = {
        groupName: newGroupData.name,
        groupDesc: newGroupData.description.trim() || undefined,
        country: selectedCountry || undefined,
      };

      const createdGroup = await createRuleGroup(request);

      // Refresh the rule groups list to get the latest data
      await loadRuleGroups(false, '');

      // Set the newly created group as selected
      setSelectedGroup(createdGroup.id.toString());

      // Load rules for the newly created group
      loadRulesInGroup(createdGroup.groupCode);

      setShowAddGroupModal(false);
      setNewGroupData({
        name: '',
        description: '',
        icon: 'ri-folder-line',
        color: 'blue'
      });

      showSuccess(t('messages.groupCreated'), t('messages.groupCreatedSuccess', { name: createdGroup.groupName }));
    } catch (error) {
      console.error('Failed to create rule group:', error);
      const errorMessage = error instanceof Error ? error.message : t('messages.unknownError');
      showError(t('messages.createFailed'), errorMessage);
    }
  };

  // Handle save rule group
  const handleSaveRuleGroup = async () => {
    if (!currentGroup || !editingGroupData.name.trim()) {
      showError(t('messages.saveFailed'), t('messages.groupNameRequired'));
      return;
    }

    try {
      // Get rule codes from current execution order
      const ruleCodes = ruleExecutionOrder.map(rule => rule.ruleCode);

      const request: RuleGroupUpdateRequest = {
        groupName: editingGroupData.name.trim(),
        groupDesc: editingGroupData.description.trim() || undefined,
        ruleCodes: ruleCodes
      };

      await updateRuleGroup(currentGroup.id, request);

      // Refresh the rule groups list while preserving selection
      await loadRuleGroups(true, selectedGroup);

      // Find the updated group and reload its rules
      const updatedGroups = await fetchRuleGroupsByCompanyId(
        selectedCountry || 'CN',
        groupSearchValue || undefined,
        user?.orgId || ''
      );
      const updatedGroup = updatedGroups.find(g => g.id.toString() === selectedGroup);
      if (updatedGroup) {
        // Update editing data with latest group info
        setEditingGroupData({
          name: updatedGroup.groupName,
          description: updatedGroup.groupDesc || ''
        });
        // Reload rules for the current group to get the latest execution order
        await loadRulesInGroup(updatedGroup.groupCode);
      }

      showSuccess('Rule Group Updated', `Rule group "${editingGroupData.name}" has been updated successfully`);
    } catch (error) {
      console.error('Failed to update rule group:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError('Update Rule Group Failed', errorMessage);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
    <Header />

    <div className="flex flex-1 overflow-hidden">
    {/* Left Sidebar - Rule Groups */}
    <div className="w-1/5 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('title')}</h2>
            <div className="flex items-center space-x-2">
            <button
                onClick={() => setShowAddGroupModal(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                title="Add Group"
            >
                <i className="ri-add-line"></i>
            </button>
            <button
                onClick={() => loadRuleGroups(true, selectedGroup)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors cursor-pointer"
                title="Refresh"
            >
                <i className="ri-refresh-line"></i>
            </button>
            </div>
        </div>

        {/* Country Filter and Search Input in Two Rows */}
        <div className="space-y-4">
            {/* Country Filter - First Row */}
            <div>
            <CountryRegionSelector />
            </div>

            {/* Group Search Input - Second Row */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('searchGroups')}</label>
            <div className="relative">
                <input
                placeholder={t('searchGroupsPlaceholder')}
                value={groupSearchValue}
                onChange={(e) => setGroupSearchValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                    loadRuleGroups(true, selectedGroup);
                    }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-gray-400"></i>
                </div>
            </div>
            </div>
        </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {loading && (
            <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 text-sm">{t('loading')}</div>
            </div>
        )}

        {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="text-red-800 text-sm">{error}</div>
            <button
                onClick={() => loadRuleGroups(false, selectedGroup)}
                className="text-red-600 hover:text-red-800 text-xs mt-1 underline"
            >
                Retry
            </button>
            </div>
        )}

        {!loading && !error && ruleGroups.length === 0 && (
            <div className="text-center py-8">
            <div className="text-gray-500 text-sm">{t('noGroups')}</div>
            <button
                onClick={() => setShowAddGroupModal(true)}
                className="text-blue-600 hover:text-blue-800 text-sm mt-2 underline"
            >
                Create your first group
            </button>
            </div>
        )}

        <div className="space-y-2">
            {!loading && ruleGroups.map((group) => (
            <button
                key={group.id}
                onClick={() => handleGroupSelection(group.id.toString())}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left cursor-pointer transition-colors ${
                selectedGroup === group.id.toString()
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-100 border border-transparent'
                }`}
            >
                <div className="w-5 h-5 flex items-center justify-center">
                <i className={`ri-folder-line ${selectedGroup === group.id.toString() ? 'text-blue-600' : `text-${getStatusColor(group.status)}-500`}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${selectedGroup === group.id.toString() ? 'text-blue-600' : 'text-gray-900'}`}>
                    {group.groupName}
                </div>
                <div className="text-xs text-gray-500 truncate mt-1">{group.groupDesc || 'No description'}</div>
                </div>
                <div className="flex items-center">
                <span className="text-xs text-gray-500">{group.groupCode}</span>
                </div>
            </button>
            ))}
        </div>
        </div>
    </div>

    {/* Center - Rule Management */}
    <div className="w-3/5 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
            <div>
            <h2 className="text-xl font-semibold text-gray-900">{editingGroupData.name || 'Select a Rule Group'}</h2>
            <p className="text-gray-600 mt-1">{editingGroupData.description || 'No group selected'}</p>
            </div>
            <div className="flex items-center space-x-3">
            <button
                onClick={handleSaveRuleGroup}
                disabled={!currentGroup || !editingGroupData.name.trim() || ruleExecutionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                <i className="ri-save-line mr-2"></i>{t('save')}
            </button>
            </div>
        </div>
        <div className="flex items-center space-x-3">
            <div className="relative flex-1">
            <input
                placeholder={t('searchRulesPlaceholder')}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-gray-400"></i>
            </div>
            </div>
            <button
            onClick={handleManualSearch}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center"
            title="Search"
            >
            <i className="ri-search-line"></i>
            </button>
        </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Available Rules */}
            <div className="w-1/2 pt-4 px-4 pb-2 border-r border-gray-200 flex flex-col overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('availableRulesLibrary')}</h3>

            {availableRulesLoading && (
                <div className="flex items-center justify-center py-8">
                <div className="text-gray-500 text-sm">{t('loadingRules')}</div>
                </div>
            )}

            {availableRulesError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="text-red-800 text-sm">{availableRulesError}</div>
                <button
                    onClick={() => loadAvailableRules()}
                    className="text-red-600 hover:text-red-800 text-xs mt-1 underline"
                >
                    Retry
                </button>
                </div>
            )}

            {!availableRulesLoading && !availableRulesError && availableRules.length === 0 && (
                <div className="text-center py-8">
                <div className="text-gray-500 text-sm">{t('noRules')}</div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                {!availableRulesLoading && availableRules.map((rule) => (
                <div key={rule.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{rule.ruleName}</div>
                        <div className="text-xs text-gray-600 mt-1">{rule.description || 'No description'}</div>
                        <div className="flex items-center space-x-2 mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{getRuleTypeLabel(rule.ruleType)}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusDisplay(rule.status).style}`}>{getStatusDisplay(rule.status).label}</span>
                        <span className="text-xs text-gray-500">{t('priority')}: {rule.priority || 1}</span>
                        <span className="text-xs text-gray-500">{rule.ruleVersion}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => handleAddRuleToExecutionOrder(rule)}
                        disabled={ruleExecutionLoading || isRuleInExecutionOrder(rule.ruleCode)}
                        className={`w-8 h-8 flex items-center justify-center ml-2 cursor-pointer ${
                        ruleExecutionLoading || isRuleInExecutionOrder(rule.ruleCode)
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-400 hover:text-blue-600'
                        }`}
                        title={isRuleInExecutionOrder(rule.ruleCode) ? 'Rule already added' : 'Add to Rule Group'}
                    >
                        <i className="ri-add-line"></i>
                    </button>
                    </div>
                </div>
                ))}
            </div>

            {/* Pagination for Available Rules */}
            {!availableRulesLoading && availableRules.length > 0 && (
                <div className="mt-2 pt-2 flex-shrink-0">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(newPageSize) => {
                    setPageSize(newPageSize);
                    setCurrentPage(1);
                    }}
                    loading={availableRulesLoading}
                    pageSizeOptions={[10, 20, 50]}
                />
                </div>
            )}
            </div>

            {/* Rule Execution Order */}
            <div className="w-1/2 p-4 flex flex-col overflow-hidden">
            {/* Current Group Info - Editable */}
            {currentGroup && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t('currentRuleGroup')}</h4>
                <div className="space-y-2">
                    <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('groupName')}</label>
                    <input
                        type="text"
                        value={editingGroupData.name}
                        onChange={(e) => setEditingGroupData({...editingGroupData, name: e.target.value})}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('groupNamePlaceholder')}
                    />
                    </div>
                    <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('description')}</label>
                    <textarea
                        value={editingGroupData.description}
                        onChange={(e) => setEditingGroupData({...editingGroupData, description: e.target.value})}
                        rows={2}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder={t('descriptionPlaceholder')}
                    />
                    </div>
                </div>
                </div>
            )}

            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('ruleExecutionOrder')} ({ruleExecutionOrder.length})</h3>

            {ruleExecutionLoading && (
                <div className="flex items-center justify-center py-8">
                <div className="text-gray-500 text-sm">{t('loadingOrder')}</div>
                </div>
            )}

            {ruleExecutionError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="text-red-800 text-sm">{ruleExecutionError}</div>
                </div>
            )}

            {!ruleExecutionLoading && !ruleExecutionError && ruleExecutionOrder.length === 0 && (
                <div className="text-center py-8">
                <div className="text-gray-500 text-sm">{t('noExecutionOrder')}</div>
                <div className="text-gray-400 text-xs mt-1">{t('addRulesHint')}</div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                {!ruleExecutionLoading && ruleExecutionOrder
                .sort((a, b) => a.priority - b.priority)
                .map((rule, index) => (
                <div key={rule.id} className="p-3 border border-gray-200 rounded-lg bg-blue-50">
                    <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <div className="flex flex-col items-center">
                        <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {index + 1}
                        </span>
                        </div>
                        <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{rule.ruleName}</div>
                        <div className="text-xs text-gray-600 mt-1">{rule.description || 'No description'}</div>
                        <div className="flex items-center space-x-2 mt-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{getRuleTypeLabel(rule.ruleType.toString())}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusDisplay(rule.status).style}`}>{getStatusDisplay(rule.status).label}</span>
                            <span className="text-xs text-gray-500">{t('priority')}: {rule.priority}</span>
                        </div>
                        </div>
                    </div>
                    <button
                        onClick={() => handleRemoveRuleFromExecutionOrder(rule.id)}
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 cursor-pointer"
                        title="Remove Rule"
                    >
                        <i className="ri-close-line"></i>
                    </button>
                    </div>
                </div>
                ))}
            </div>
            </div>
        </div>
        </div>
    </div>

    {/* Right Sidebar - Organization Assignment */}
    <div className="w-1/5 bg-white flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900">{t('organizationAssignment')}</h3>
        <p className="text-sm text-gray-600 mt-1">{t('assignedToOrgs', { count: selectedOrgCount })}</p>
        </div>
        <div className="flex-1 p-4 overflow-y-auto min-h-0">
        <div className="space-y-2">
            {organizations.map((org) => (
            <div
                key={org.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                org.selected
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
            >
                <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    org.selected
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300'
                }`}>
                    {org.selected && <i className="ri-check-line text-white text-xs"></i>}
                </div>
                <div className="flex-1">
                    <div className={`text-sm font-medium ${org.selected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {org.name}
                    </div>
                </div>
                </div>
            </div>
            ))}
        </div>
        </div>
    </div>
    </div>

    {/* Add Group Modal */}
    {showAddGroupModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-96 max-w-md mx-4">
        <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('addNewGroup')}</h3>
        </div>
        <div className="p-6 space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('groupName')} <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                value={newGroupData.name}
                onChange={(e) => setNewGroupData({...newGroupData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('groupNamePlaceholder')}
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('description')}</label>
            <textarea
                value={newGroupData.description}
                onChange={(e) => setNewGroupData({...newGroupData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('descriptionPlaceholder')}
            />
            </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
            onClick={() => setShowAddGroupModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
            {t('cancel')}
            </button>
            <button
            onClick={handleAddGroup}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
            {t('addGroup')}
            </button>
        </div>
        </div>
    </div>
    )}
    </div>
  );
}