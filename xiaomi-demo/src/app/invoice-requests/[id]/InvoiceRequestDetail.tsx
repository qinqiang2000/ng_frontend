
'use client';

import Header from '@/client/components/Header';
import StatusBadge from '@/client/components/ui/StatusBadge';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { fetchInvoiceRequestById, InvoiceRequestDetail as InvoiceRequestDetailType, fetchRuleLogDetails, RuleLogGroupedResponseDto, RuleLogDetailDto, formatDisplayTime } from '@/client/services/invoiceRequestService';
import { useToast } from '@/client/components/ui/ToastContainer';
import { getAssetPath } from '@/client/lib/paths';
import { useInvoiceRequestsTranslation } from '@/client/hooks/useTranslation';

interface InvoiceRequestDetailProps {
  requestId: string;
}

export default function InvoiceRequestDetail({ requestId }: InvoiceRequestDetailProps) {
  const { t } = useInvoiceRequestsTranslation();
  const { showError } = useToast();
  const [activeTab, setActiveTab] = useState('fields');
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [ruleLogLoading, setRuleLogLoading] = useState(true);
  const [ruleLogError, setRuleLogError] = useState<string | null>(null);
  const [invoiceDetail, setInvoiceDetail] = useState<InvoiceRequestDetailType | null>(null);
  const [ruleLogData, setRuleLogData] = useState<RuleLogGroupedResponseDto | null>(null);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [fieldFilter, setFieldFilter] = useState<'all' | 'original' | 'enriched' | 'passed' | 'failed' | 'tax'>('all');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Load invoice detail
  const loadInvoiceDetail = useCallback(async (abortSignal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const detail = await fetchInvoiceRequestById(requestId);

      if (abortSignal?.aborted) return;

      setInvoiceDetail(detail);

      // Parse extField and update expandedSections based on actual data
      if (detail.extField) {
        try {
          const parsedExtField = JSON.parse(detail.extField);
          const sections = Object.keys(parsedExtField).filter(key =>
            !['ProfileID', 'UBLVersionID', 'CustomizationID'].includes(key)
          );
          const newExpandedSections: {[key: string]: boolean} = {};
          sections.forEach((section, index) => {
            // Only expand the first section, collapse all others
            newExpandedSections[section] = index === 0;
          });
          setExpandedSections(newExpandedSections);
        } catch (err) {
          console.error('Error parsing extField:', err);
        }
      }

      return detail;
    } catch (err) {
      if (!abortSignal?.aborted) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load invoice detail';
        setError(errorMessage);
        showError('Loading Error', errorMessage);
      }
    } finally {
      if (!abortSignal?.aborted) {
        setLoading(false);
      }
    }
  }, [requestId, showError]);

  // Load rule log data
  const loadRuleLogData = useCallback(async (invoiceRequestId: string, abortSignal?: AbortSignal) => {
    try {
      setRuleLogLoading(true);
      setRuleLogError(null);

      const ruleLog = await fetchRuleLogDetails(invoiceRequestId);

      if (abortSignal?.aborted) return;

      setRuleLogData(ruleLog);
    } catch (err) {
      if (!abortSignal?.aborted) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load rule log data';
        setRuleLogError(errorMessage);
        showError('Rule Log Error', errorMessage);
      }
    } finally {
      if (!abortSignal?.aborted) {
        setRuleLogLoading(false);
      }
    }
  }, [showError]);

  // Fetch invoice detail and rule log data on component mount
  useEffect(() => {
    const abortController = new AbortController();

    const loadData = async () => {
      // First load invoice detail
      const detail = await loadInvoiceDetail(abortController.signal);

      // Then load rule log data if invoice detail was successful
      if (detail && !abortController.signal.aborted) {
        await loadRuleLogData(detail.requestId, abortController.signal);
      }
    };

    loadData();

    // Cleanup function to abort pending requests
    return () => {
      abortController.abort();
    };
  }, [requestId, loadInvoiceDetail, loadRuleLogData]);

  // Retry loading rule log data
  const retryRuleLogData = useCallback(() => {
    if (invoiceDetail) {
      loadRuleLogData(invoiceDetail.requestId);
    }
  }, [invoiceDetail, loadRuleLogData]);

  // Recursively flatten an object to get all primitive values with their paths
  const flattenObject = (obj: any, prefix: string = ''): {name: string, label: string, value: string, type: string}[] => {
    const result: {name: string, label: string, value: string, type: string}[] = [];

    if (obj === null || obj === undefined) {
      return [{
        name: prefix,
        label: prefix,
        value: String(obj),
        type: 'primitive'
      }];
    }

    if (typeof obj !== 'object') {
      // Primitive value
      return [{
        name: prefix,
        label: prefix,
        value: String(obj),
        type: 'primitive'
      }];
    }

    if (Array.isArray(obj)) {
      // Handle arrays - flatten each item
      obj.forEach((item, index) => {
        const itemPrefix = prefix ? `${prefix}[${index}]` : `[${index}]`;
        result.push(...flattenObject(item, itemPrefix));
      });
    } else {
      // Handle objects - flatten each property
      Object.entries(obj).forEach(([key, value]) => {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        result.push(...flattenObject(value, newPrefix));
      });
    }

    return result;
  };

  // Parse extField JSON and transform to two-level field structure
  const parseExtFieldData = () => {
    if (!invoiceDetail?.extField) return {};

    try {
      const parsedData = JSON.parse(invoiceDetail.extField);

      const filteredData = Object.fromEntries(
        Object.entries(parsedData).filter(([key]) =>
          !['ProfileID', 'UBLVersionID', 'CustomizationID'].includes(key)
        )
      );

      const result: {[key: string]: any} = {};

      Object.entries(filteredData).forEach(([sectionKey, sectionValue]) => {
        // Use the recursive flattening function
        const fields = flattenObject(sectionValue, sectionKey);

        // Filter out the top-level section key itself if it's an object/array container
        const filteredFields = fields.filter(field => field.name !== sectionKey || typeof sectionValue !== 'object');

        // Create relative field paths by removing the section key prefix
        const relativeFields = filteredFields.map(field => ({
          ...field,
          label: field.name.startsWith(sectionKey + '.')
            ? field.name.substring(sectionKey.length + 1)
            : field.label
        }));

        result[sectionKey] = {
          title: sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          icon: getSectionIcon(sectionKey),
          color: getSectionColor(sectionKey),
          fields: relativeFields
        };
      });

      return result;
    } catch (err) {
      console.error('Error parsing extField:', err);
      return {};
    }
  };

  // Get icon for section based on section name
  const getSectionIcon = (sectionKey: string): string => {
    const iconMap: {[key: string]: string} = {
      'AccountingSupplierParty': 'ri-user-line',
      'AccountingCustomerParty': 'ri-building-line',
      'TaxTotal': 'ri-calculator-line',
      'InvoiceLines': 'ri-list-check-line',
      'InvoiceLine': 'ri-shopping-cart-line',
      'LegalMonetaryTotal': 'ri-money-dollar-circle-line',
      'PaymentMeans': 'ri-bank-card-line',
      'PaymentTerms': 'ri-calendar-line',
      'OrderReference': 'ri-file-text-line',
      'InvoicePeriod': 'ri-calendar-2-line',
      'AdditionalDocumentReferences': 'ri-attachment-line',
      'DocumentCurrencyCode': 'ri-money-euro-circle-line',
      'IssueDate': 'ri-calendar-event-line',
      'DueDate': 'ri-calendar-check-line',
      'Note': 'ri-sticky-note-line',
      'ID': 'ri-hashtag',
      'BuyerReference': 'ri-user-settings-line',
      'AllowanceCharge': 'ri-percent-line',
      'TaxSubtotals': 'ri-pie-chart-line',
      'TaxCategory': 'ri-price-tag-3-line',
      'TaxScheme': 'ri-government-line',
      'Item': 'ri-product-hunt-line',
      'Price': 'ri-price-tag-line',
      'Quantity': 'ri-calculator-fill',
      'Amount': 'ri-coin-line',
      'Party': 'ri-team-line',
      'Address': 'ri-map-pin-line',
      'Contact': 'ri-contacts-line',
      'PayeeFinancialAccount': 'ri-bank-line',
      'FinancialInstitution': 'ri-building-2-line'
    };

    // Fallback logic for more specific matching
    if (iconMap[sectionKey]) {
      return iconMap[sectionKey];
    }

    // Match by keywords in the section name
    const lowerKey = sectionKey.toLowerCase();
    if (lowerKey.includes('tax')) return 'ri-calculator-line';
    if (lowerKey.includes('payment')) return 'ri-bank-card-line';
    if (lowerKey.includes('amount') || lowerKey.includes('total')) return 'ri-money-dollar-circle-line';
    if (lowerKey.includes('date')) return 'ri-calendar-line';
    if (lowerKey.includes('party') || lowerKey.includes('supplier') || lowerKey.includes('customer')) return 'ri-user-line';
    if (lowerKey.includes('line') || lowerKey.includes('item')) return 'ri-list-check-line';
    if (lowerKey.includes('reference') || lowerKey.includes('id')) return 'ri-hashtag';
    if (lowerKey.includes('currency') || lowerKey.includes('code')) return 'ri-money-euro-circle-line';
    if (lowerKey.includes('address')) return 'ri-map-pin-line';
    if (lowerKey.includes('contact')) return 'ri-contacts-line';
    if (lowerKey.includes('note') || lowerKey.includes('description')) return 'ri-sticky-note-line';

    return 'ri-file-list-line';
  };

  // Get color for section based on section name
  const getSectionColor = (sectionKey: string): string => {
    const colorMap: {[key: string]: string} = {
      'AccountingSupplierParty': 'blue',
      'AccountingCustomerParty': 'green',
      'TaxTotal': 'red',
      'InvoiceLines': 'orange',
      'InvoiceLine': 'orange',
      'LegalMonetaryTotal': 'purple',
      'PaymentMeans': 'indigo',
      'PaymentTerms': 'pink',
      'OrderReference': 'gray',
      'InvoicePeriod': 'yellow',
      'AdditionalDocumentReferences': 'teal',
      'DocumentCurrencyCode': 'emerald',
      'IssueDate': 'cyan',
      'DueDate': 'lime',
      'Note': 'amber',
      'ID': 'slate',
      'BuyerReference': 'sky',
      'AllowanceCharge': 'rose',
      'TaxSubtotals': 'red',
      'TaxCategory': 'orange',
      'TaxScheme': 'red',
      'Item': 'violet',
      'Price': 'fuchsia',
      'Quantity': 'blue',
      'Amount': 'green',
      'Party': 'blue',
      'Address': 'teal',
      'Contact': 'cyan',
      'PayeeFinancialAccount': 'indigo',
      'FinancialInstitution': 'purple'
    };

    // Fallback logic for more specific matching
    if (colorMap[sectionKey]) {
      return colorMap[sectionKey];
    }

    // Match by keywords in the section name for color assignment
    const lowerKey = sectionKey.toLowerCase();
    if (lowerKey.includes('tax')) return 'red';
    if (lowerKey.includes('payment')) return 'indigo';
    if (lowerKey.includes('amount') || lowerKey.includes('total') || lowerKey.includes('price')) return 'green';
    if (lowerKey.includes('date')) return 'cyan';
    if (lowerKey.includes('party') || lowerKey.includes('supplier') || lowerKey.includes('customer')) return 'blue';
    if (lowerKey.includes('line') || lowerKey.includes('item')) return 'orange';
    if (lowerKey.includes('reference') || lowerKey.includes('id')) return 'gray';
    if (lowerKey.includes('currency') || lowerKey.includes('code')) return 'emerald';
    if (lowerKey.includes('address')) return 'teal';
    if (lowerKey.includes('contact')) return 'cyan';
    if (lowerKey.includes('note') || lowerKey.includes('description')) return 'amber';
    if (lowerKey.includes('allowance') || lowerKey.includes('charge')) return 'rose';
    if (lowerKey.includes('quantity')) return 'blue';

    return 'gray';
  };

  // Status mapping for display
  const getStatusLabel = (statusCode: number): string => {
    const statusMap: Record<number, string> = {
      1: t('statusLabels.draft'),
      2: t('statusLabels.enriching'),
      3: t('statusLabels.validated'),
      4: t('statusLabels.validFailed'),
      5: t('statusLabels.pending'),
      6: t('statusLabels.invoiceIssueing'),
      7: t('statusLabels.partInvoiced'),
      8: t('statusLabels.fullyInvoiced'),
      9: t('statusLabels.debitApply'),
      10: t('statusLabels.reIssued')
    };
    return statusMap[statusCode] || t('messages.unknownCompany');
  };

  // Enrich fields with rule log status based on fieldPath matching
  const enrichFieldsWithRuleLogStatus = useCallback((
    fieldDetails: {[key: string]: any},
    ruleLogData: RuleLogGroupedResponseDto
  ): {[key: string]: any} => {
    const enrichedDetails = JSON.parse(JSON.stringify(fieldDetails)); // Deep copy

    // Create a lookup map for rule logs by fieldPath (without "invoice." prefix)
    const ruleLogMap: {[key: string]: {ruleType: number, executionResult: number}[]} = {};

    // Process validation rules (ruleType=1)
    if (ruleLogData.groupedByRuleType['1']) {
      ruleLogData.groupedByRuleType['1'].forEach(log => {
        const fieldPath = log.fieldPath.replace(/^Invoice\./, '');
        // Store as array to handle multiple rules for same field path
        if (!ruleLogMap[fieldPath]) {
          ruleLogMap[fieldPath] = [];
        }
        ruleLogMap[fieldPath].push({ ruleType: log.ruleType, executionResult: log.executionResult });
      });
    }

    // Process completion rules (ruleType=2)
    if (ruleLogData.groupedByRuleType['2']) {
      ruleLogData.groupedByRuleType['2'].forEach(log => {
        const fieldPath = log.fieldPath.replace(/^Invoice\./, '');
        // Store as array to handle multiple rules for same field path
        if (!ruleLogMap[fieldPath]) {
          ruleLogMap[fieldPath] = [];
        }
        ruleLogMap[fieldPath].push({ ruleType: log.ruleType, executionResult: log.executionResult });
      });
    }


    // Normalize field path for better matching
    const normalizeFieldPath = (path: string): string => {
      return path.replace(/^Invoice\./i, '').toLowerCase();
    };

    // Create normalized lookup for case-insensitive matching
    const normalizedRuleLogMap: {[key: string]: {ruleType: number, executionResult: number, originalPath: string}[]} = {};
    Object.entries(ruleLogMap).forEach(([path, ruleArray]) => {
      const normalized = normalizeFieldPath(path);
      if (!normalizedRuleLogMap[normalized]) {
        normalizedRuleLogMap[normalized] = [];
      }
      ruleArray.forEach((rule: {ruleType: number, executionResult: number}) => {
        normalizedRuleLogMap[normalized].push({ ...rule, originalPath: path });
      });
    });


    // Match fields with rule logs and set validation status
    Object.keys(enrichedDetails).forEach(sectionKey => {
      const section = enrichedDetails[sectionKey];
      if (section.fields) {
        section.fields = section.fields.map((field: any) => {
          // Try multiple field path matching strategies to find ALL matching rules
          const fieldName = field.name;
          const matchingRules: any[] = [];

          // Collect all matching rules for this field
          Object.entries(ruleLogMap).forEach(([rulePath, ruleInfoArray]) => {
            let pathMatches = false;

            // Direct match
            if (fieldName === rulePath) {
              pathMatches = true;
            }
            // Try removing section prefix
            else if (fieldName.replace(/^[^.]+\./, '') === rulePath) {
              pathMatches = true;
            }
            // Try different section prefix combinations
            else if (fieldName.includes('.')) {
              const fieldParts = fieldName.split('.');
              for (let i = 0; i < fieldParts.length; i++) {
                const testPath = fieldParts.slice(i).join('.');
                if (testPath === rulePath) {
                  pathMatches = true;
                  break;
                }
              }
            }

            // If path matches, add all rules for this path
            if (pathMatches) {
              matchingRules.push(...ruleInfoArray);
            }
          });

          // Also try normalized matching
          const normalizedFieldName = normalizeFieldPath(fieldName);
          Object.entries(normalizedRuleLogMap).forEach(([normalizedPath, ruleInfoArray]) => {
            if (normalizedFieldName === normalizedPath) {
              ruleInfoArray.forEach(ruleInfo => {
                // Check if we already have this rule (avoid duplicates)
                const alreadyExists = matchingRules.some(existing =>
                  existing.ruleType === ruleInfo.ruleType &&
                  existing.executionResult === ruleInfo.executionResult &&
                  existing.originalPath === ruleInfo.originalPath
                );
                if (!alreadyExists) {
                  matchingRules.push(ruleInfo);
                }
              });
            }
          });

          // Determine field validation status based on ALL matching rules
          if (matchingRules.length > 0) {

            let hasEnriched = false;
            let hasPassed = false;
            let hasFailed = false;

            matchingRules.forEach((rule: {ruleType: number, executionResult: number, originalPath?: string}) => {
              if (rule.executionResult === 1) {
                if (rule.ruleType === 1) {
                  hasPassed = true;
                } else if (rule.ruleType === 2) {
                  hasEnriched = true;
                }
              } else {
                hasFailed = true;
              }
            });

            // Priority: failed > passed > enriched > pending
            if (hasFailed) {
              field.validation = 'failed';
            } else if (hasPassed) {
              field.validation = 'passed';
            } else if (hasEnriched) {
              field.validation = 'enriched';
            } else {
              field.validation = 'pending';
            }

            // Store all matching rules for debugging
            field.matchingRules = matchingRules;
          } else {
            // No matching rule found, use default
            field.validation = 'pending';
          }

          return field;
        });
      }
    });

    return enrichedDetails;
  }, []);

  // Filter fields based on current filter selection
  const getFilteredFieldDetails = useCallback((
    fieldDetails: {[key: string]: any},
    filter: string
  ): {[key: string]: any} => {
    if (filter === 'all') {
      return fieldDetails;
    }

    const filteredDetails: {[key: string]: any} = {};

    Object.entries(fieldDetails).forEach(([sectionKey, section]) => {
      if (section.fields) {
        let filteredFields = [...section.fields];

        switch (filter) {
          case 'original':
            filteredFields = filteredFields.filter(field => {
              // Fields that don't have any enrichment rules
              return !field.matchingRules || !field.matchingRules.some((rule: {ruleType: number, executionResult: number}) =>
                rule.ruleType === 2 && rule.executionResult === 1
              );
            });
            break;
          case 'enriched':
            filteredFields = filteredFields.filter(field => {
              // Fields that have successful enrichment rules
              return field.matchingRules && field.matchingRules.some((rule: {ruleType: number, executionResult: number}) =>
                rule.ruleType === 2 && rule.executionResult === 1
              );
            });
            break;
          case 'passed':
            filteredFields = filteredFields.filter(field => {
              // Fields that have successful validation rules
              return field.matchingRules && field.matchingRules.some((rule: RuleLogDetailDto) =>
                rule.ruleType === 1 && rule.executionResult === 1
              );
            });
            break;
          case 'failed':
            filteredFields = filteredFields.filter(field => {
              // Fields that have failed rules (any type)
              return field.matchingRules && field.matchingRules.some((rule: RuleLogDetailDto) =>
                rule.executionResult !== 1
              );
            });
            break;
          case 'tax':
            filteredFields = filteredFields.filter(field => {
              const fieldName = field.name.toLowerCase();
              const fieldLabel = field.label.toLowerCase();
              return fieldName.includes('tax') || fieldLabel.includes('tax') ||
                     fieldName.includes('vat') || fieldLabel.includes('vat') ||
                     sectionKey.toLowerCase().includes('tax');
            });
            break;
          default:
            break;
        }

        // Only include section if it has filtered fields
        if (filteredFields.length > 0) {
          filteredDetails[sectionKey] = {
            ...section,
            fields: filteredFields
          };
        }
      }
    });

    return filteredDetails;
  }, []);

  // Get processed field details from extField
  const baseFieldDetails = parseExtFieldData();

  // Enrich fields with rule log status using useMemo
  const enrichedFieldDetails = useMemo(() => {
    if (!ruleLogData) return baseFieldDetails;
    return enrichFieldsWithRuleLogStatus(baseFieldDetails, ruleLogData);
  }, [baseFieldDetails, ruleLogData, enrichFieldsWithRuleLogStatus]);

  // Apply field filter using useMemo
  const fieldDetails = useMemo(() => {
    return getFilteredFieldDetails(enrichedFieldDetails, fieldFilter);
  }, [enrichedFieldDetails, fieldFilter, getFilteredFieldDetails]);

  // Calculate rule-based statistics using useMemo
  const ruleStatistics = useMemo(() => {
    if (!ruleLogData) {
      return {
        enrichedFields: 0,
        complianceVerified: 0,
        complianceErrors: 0,
        taxFields: 0
      };
    }

    // Count actual fields that match each validation status from enriched field details
    // Use Sets to ensure each field is counted only once
    const enrichedFieldPaths = new Set<string>();
    const passedFieldPaths = new Set<string>();
    const failedFieldPaths = new Set<string>();
    let taxFields = 0;

    Object.values(enrichedFieldDetails).forEach((section: any) => {
      if (section.fields) {
        section.fields.forEach((field: any) => {

          // Count based on actual matching rules, ensuring each field is counted only once per rule type
          if (field.matchingRules && field.matchingRules.length > 0) {
            field.matchingRules.forEach((rule: any) => {
              if (rule.executionResult === 1) {
                if (rule.ruleType === 1) {
                  // Validation rule success
                  passedFieldPaths.add(field.name);
                } else if (rule.ruleType === 2) {
                  // Completion rule success
                  enrichedFieldPaths.add(field.name);
                }
              } else {
                // Rule execution failed
                if (rule.ruleType === 1 || rule.ruleType === 2) {
                  failedFieldPaths.add(field.name);
                }
              }
            });
          }

          // Count tax-related fields
          const fieldName = field.name.toLowerCase();
          const fieldLabel = field.label.toLowerCase();
          const sectionKey = section.title.toLowerCase();
          if (fieldName.includes('tax') || fieldLabel.includes('tax') ||
              fieldName.includes('vat') || fieldLabel.includes('vat') ||
              sectionKey.includes('tax')) {
            taxFields++;
          }
        });
      }
    });

    const enrichedFields = enrichedFieldPaths.size;
    const complianceVerified = passedFieldPaths.size;
    const complianceErrors = failedFieldPaths.size;



    return {
      enrichedFields,
      complianceVerified,
      complianceErrors,
      taxFields
    };
  }, [enrichedFieldDetails]);

  // Get request detail info
  const requestDetail = invoiceDetail ? {
    id: String(invoiceDetail.id),
    status: getStatusLabel(invoiceDetail.status),
    submittedAt: formatDisplayTime(invoiceDetail.createTime),
    completedAt: formatDisplayTime(invoiceDetail.updateTime),
    totalFields: Object.values(enrichedFieldDetails).reduce((sum, section) => sum + section.fields.length, 0),
    originalFields: Object.values(enrichedFieldDetails).reduce((sum, section) => sum + section.fields.length, 0) - ruleStatistics.enrichedFields,
    enrichedFields: ruleStatistics.enrichedFields,
    complianceVerified: ruleStatistics.complianceVerified,
    complianceErrors: ruleStatistics.complianceErrors,
    taxFields: ruleStatistics.taxFields,
    validationWarnings: 0
  } : null;


  const getValidationBadges = (field: any) => {
    // Field type badge (first row)
    const getFieldTypeBadge = () => {
      if (field.validation === 'enriched') {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <i className="ri-magic-line mr-1"></i>
            {t('detail.fieldLabels.enrichedField')}
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <i className="ri-database-line mr-1"></i>
            {t('detail.fieldLabels.originalField')}
          </span>
        );
      }
    };

    // Validation status badge (second row)
    const getValidationStatusBadge = () => {
      switch (field.validation) {
        case 'passed':
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              <i className="ri-check-line mr-1"></i>
              {t('detail.fieldLabels.validationPassed')}
            </span>
          );
        case 'warning':
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
              <i className="ri-alert-line mr-1"></i>
              {t('detail.fieldLabels.warning')}
            </span>
          );
        case 'failed':
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
              <i className="ri-close-line mr-1"></i>
              {t('detail.fieldLabels.validationFailed')}
            </span>
          );
        default:
          return null; // No validation status badge for enriched-only or pending fields
      }
    };

    return (
      <div className="flex flex-col space-y-1">
        {getFieldTypeBadge()}
        {getValidationStatusBadge()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
    <Header />

    <main className="px-6 py-8">
    {/* Loading State */}
    {loading && (
        <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">{t('messages.loadingRequests')}</span>
        </div>
        </div>
    )}

    {/* Error State */}
    {/* Content - show when not loading and invoice detail loaded */}
    {!loading && invoiceDetail && (
        <>
        {/* Header */}
        <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
            <Link href="/invoice-requests" className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer">
                <i className="ri-arrow-left-line text-gray-600"></i>
            </Link>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('detail.title')}</h1>
            </div>
            </div>

            {/* Status Overview */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                {requestDetail?.status && <StatusBadge status={requestDetail.status} type="invoice" />}
                <div className="text-sm text-gray-600">
                    {t('detail.submitted', { time: requestDetail?.submittedAt || '' })}
                </div>
                <div className="text-sm text-gray-600">
                    {t('detail.completed', { time: requestDetail?.completedAt || '' })}
                </div>
                </div>
                <div className="flex items-center space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer">
                    <i className="ri-download-line mr-2"></i>
                    {t('detail.exportReport')}
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
                    <i className="ri-refresh-line mr-2"></i>
                    {t('detail.reValidate')}
                </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <button
                onClick={() => setFieldFilter('all')}
                className={`text-center p-3 rounded-lg border transition-colors cursor-pointer ${
                    fieldFilter === 'all'
                    ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                >
                <div className="text-2xl font-bold text-gray-900">{requestDetail?.totalFields}</div>
                <div className="text-sm text-gray-600">{t('validation.totalFields')}</div>
                </button>
                <button
                onClick={() => setFieldFilter('original')}
                className={`text-center p-3 rounded-lg border transition-colors cursor-pointer ${
                    fieldFilter === 'original'
                    ? 'bg-gray-50 border-gray-300 ring-2 ring-gray-500'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                >
                <div className="text-2xl font-bold text-gray-600">{requestDetail?.originalFields}</div>
                <div className="text-sm text-gray-600">{t('validation.originalFields')}</div>
                </button>
                <button
                onClick={() => setFieldFilter('enriched')}
                className={`text-center p-3 rounded-lg border transition-colors cursor-pointer ${
                    fieldFilter === 'enriched'
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                >
                <div className="text-2xl font-bold text-blue-600">{requestDetail?.enrichedFields}</div>
                <div className="text-sm text-gray-600">{t('validation.enrichedFields')}</div>
                </button>
                <button
                onClick={() => setFieldFilter('passed')}
                className={`text-center p-3 rounded-lg border transition-colors cursor-pointer ${
                    fieldFilter === 'passed'
                    ? 'bg-green-50 border-green-300 ring-2 ring-green-500'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                >
                <div className="text-2xl font-bold text-green-600">{requestDetail?.complianceVerified}</div>
                <div className="text-sm text-gray-600">{t('validation.validationPassed')}</div>
                </button>
                <button
                onClick={() => setFieldFilter('failed')}
                className={`text-center p-3 rounded-lg border transition-colors cursor-pointer ${
                    fieldFilter === 'failed'
                    ? 'bg-red-50 border-red-300 ring-2 ring-red-500'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                >
                <div className="text-2xl font-bold text-red-600">{requestDetail?.complianceErrors}</div>
                <div className="text-sm text-gray-600">{t('validation.validationFailed')}</div>
                </button>
                <button
                onClick={() => setFieldFilter('tax')}
                className={`text-center p-3 rounded-lg border transition-colors cursor-pointer ${
                    fieldFilter === 'tax'
                    ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                >
                <div className="text-2xl font-bold text-purple-600">{requestDetail?.taxFields}</div>
                <div className="text-sm text-gray-600">{t('validation.taxDetermined')}</div>
                </button>
            </div>
            </div>
        </div>
        </>
    )}

    {/* Tabs - only show when data is loaded */}
    {!loading && requestDetail && (
        <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
            <button
                onClick={() => setActiveTab('fields')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                activeTab === 'fields'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <i className="ri-list-check-line mr-2"></i>
                {t('detail.tabs.fieldBreakdown')}
            </button>
            <button
                onClick={() => setActiveTab('engines')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                activeTab === 'engines'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <i className="ri-settings-3-line mr-2"></i>
                {t('detail.tabs.engineExecution')}
            </button>
            <button
                onClick={() => setActiveTab('validation')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                activeTab === 'validation'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <i className="ri-shield-check-line mr-2"></i>
                {t('detail.tabs.validationResults')}
            </button>
            </nav>
        </div>

        {/* Fields Detail Tab */}
        {activeTab === 'fields' && (
            <div className="p-6">
            {/* Filter Status Display */}
            {fieldFilter !== 'all' && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                    <i className="ri-filter-line text-blue-600"></i>
                    <div>
                        <h4 className="text-sm font-medium text-blue-900">
                        {t('detail.fieldFilter.filteredView', {
                            filterType: fieldFilter === 'original' ? t('detail.fieldTypes.originalFields') :
                            fieldFilter === 'enriched' ? t('detail.fieldTypes.enrichedFields') :
                            fieldFilter === 'passed' ? t('detail.fieldTypes.validationPassed') :
                            fieldFilter === 'failed' ? t('detail.fieldTypes.validationFailed') :
                            fieldFilter === 'tax' ? t('detail.fieldTypes.taxRelatedFields') : ''
                        })}
                        </h4>
                        <p className="text-sm text-blue-700">
                        {t('detail.fieldFilter.showingFields', {
                            count: Object.values(fieldDetails).reduce((sum, section) => sum + section.fields.length, 0)
                        })}
                        {(fieldFilter as string) !== 'all' && t('detail.fieldFilter.matchingCriteria')}
                        </p>
                    </div>
                    </div>
                    <button
                    onClick={() => setFieldFilter('all')}
                    className="px-3 py-1 text-xs bg-white border border-blue-300 rounded text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                    {t('detail.fieldFilter.clearFilter')}
                    </button>
                </div>
                </div>
            )}

            <div className="space-y-6">
                {Object.keys(fieldDetails).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <i className="ri-filter-off-line text-4xl mb-4"></i>
                    <p className="text-lg font-medium mb-2">
                    {fieldFilter === 'all' ? t('detail.fieldFilter.noFieldData') : t('detail.fieldFilter.noFieldsMatch')}
                    </p>
                    {fieldFilter !== 'all' && (
                    <button
                        onClick={() => setFieldFilter('all')}
                        className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    >
                        {t('detail.fieldFilter.viewAllFields')}
                    </button>
                    )}
                </div>
                ) : (
                Object.entries(fieldDetails).map(([sectionKey, section]) => (
                    <div key={sectionKey} className="border border-gray-200 rounded-lg">
                    <button
                        onClick={() => toggleSection(sectionKey)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 cursor-pointer"
                    >
                        <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-${section.color}-100`}>
                            <i className={`${section.icon} text-${section.color}-600`}></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                            <p className="text-sm text-gray-600">{t('detail.fieldLabels.dataFields', { count: section.fields.length })}</p>
                        </div>
                        </div>
                        <i className={`${expandedSections[sectionKey] ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-gray-400`}></i>
                    </button>

                    {expandedSections[sectionKey] && (
                        <div className="border-t border-gray-200">
                        <div className="p-4 space-y-4">
                            {section.fields.map((field: any, index: number) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="text-gray-900">{field.label}</h4>
                                    {field.required && (
                                        <span className="text-red-500 text-sm">*</span>
                                    )}
                                    </div>
                                    <p className="text-sm text-gray-600 font-mono bg-white px-2 py-1 rounded border">
                                    {field.value || t('detail.fieldLabels.empty')}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                    {getValidationBadges(field)}
                                </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center space-x-4">
                                    <span>{t('detail.fieldLabels.fieldIdentifier', { identifier: field.name })}</span>
                                </div>
                                </div>
                            </div>
                            ))}
                        </div>
                        </div>
                    )}
                    </div>
                ))
                )}
            </div>
            </div>
        )}

        {/* Engine Execution Tab */}
        {activeTab === 'engines' && (
            <div className="p-6">
            {/* Rule Log Error State */}
            {ruleLogError && (
                <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                    <div className="flex items-start">
                        <i className="ri-error-warning-line text-red-500 mr-3 mt-0.5"></i>
                        <div>
                        <h3 className="text-sm font-medium text-red-800">{t('detail.engines.failedToLoadRuleExecutionData')}</h3>
                        <p className="mt-1 text-sm text-red-700">{ruleLogError}</p>
                        </div>
                    </div>
                    <button
                        onClick={retryRuleLogData}
                        disabled={ruleLogLoading}
                        className="ml-4 inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {ruleLogLoading ? (
                        <>
                            <i className="ri-loader-2-line animate-spin mr-1"></i>
                            {t('detail.engines.retrying')}
                        </>
                        ) : (
                        <>
                            <i className="ri-refresh-line mr-1"></i>
                            Retry
                        </>
                        )}
                    </button>
                    </div>
                </div>
                </div>
            )}

            {/* Loading State */}
            {ruleLogLoading && !ruleLogData && (
                <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                    <i className="ri-loader-2-line animate-spin text-blue-500 mr-3"></i>
                    <span className="text-blue-700">{t('detail.engines.loadingRuleExecutionData')}</span>
                    </div>
                </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">{t('detail.engines.executionFlow')}</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white">
                        <i className="ri-check-line"></i>
                    </div>
                    <div className="flex-1">
                        <div className="font-medium text-gray-900">{t('detail.engines.invoiceEnrichment')}</div>
                        <div className="text-sm text-gray-600">
                        {t('detail.engines.executedEngines', { count: ruleLogData?.groupedByRuleType['2']?.length || 0, fields: requestDetail?.enrichedFields })}
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">{t('detail.engines.executionDuration', { duration: '234' })}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white">
                        <i className="ri-check-line"></i>
                    </div>
                    <div className="flex-1">
                        <div className="font-medium text-gray-900">{t('detail.engines.invoiceValidation')}</div>
                        <div className="text-sm text-gray-600">
                        {t('detail.engines.validatedFields', { count: ruleLogData?.groupedByRuleType['1']?.length || 0, fields: (requestDetail?.complianceVerified || 0) + (requestDetail?.complianceErrors || 0) })}
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">{t('detail.engines.executionDuration', { duration: '89' })}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white">
                        <i className="ri-check-line"></i>
                    </div>
                    <div className="flex-1">
                        <div className="font-medium text-gray-900">{t('detail.engines.taxRulesEngine')}</div>
                        <div className="text-sm text-gray-600">{t('detail.engines.taxDetermination')}</div>
                    </div>
                    <div className="text-xs text-gray-500">{t('detail.engines.executionDuration', { duration: '156' })}</div>
                    </div>
                </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">{t('detail.engines.enrichmentEngineDetails')}</h4>
                    <div className="space-y-2 text-sm">
                    {ruleLogData?.groupedByRuleType['2']?.map((rule) => {
                        return (
                        <div key={rule.id} className="flex justify-between">
                            <span>
                            {rule.ruleId ? (
                                <a
                                href={getAssetPath(`/invoice-rules/${rule.ruleId}?country=${rule.country || 'CN'}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                >
                                {rule.ruleName || rule.ruleCode}
                                </a>
                            ) : (
                                <span className="text-gray-900" title={`Debug: ruleId=${rule.ruleId}, keys=${Object.keys(rule).join(',')}`}>
                                {rule.ruleName || rule.ruleCode} [No ruleId]
                                </span>
                            )}
                            </span>
                            <span className={rule.executionResult === 1 ? "text-green-600" : "text-red-600"}>
                            {rule.executionResult === 1 ? t('detail.engines.success') : t('detail.engines.failed')}
                            </span>
                        </div>
                        );
                    }) || (
                        <div className="text-gray-500 text-center py-2">
                        No enrichment rules executed
                        </div>
                    )}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">{t('detail.engines.validationEngineDetails')}</h4>
                    <div className="space-y-2 text-sm">
                    {ruleLogData?.groupedByRuleType['1']?.map((rule) => {
                        return (
                        <div key={rule.id} className="flex justify-between">
                            <span>
                            {rule.ruleId ? (
                                <a
                                href={getAssetPath(`/invoice-rules/${rule.ruleId}?country=${rule.country || 'CN'}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                >
                                {rule.ruleName || rule.ruleCode}
                                </a>
                            ) : (
                                <span className="text-gray-900" title={`Debug: ruleId=${rule.ruleId}, keys=${Object.keys(rule).join(',')}`}>
                                {rule.ruleName || rule.ruleCode} [No ruleId]
                                </span>
                            )}
                            </span>
                            <span className={rule.executionResult === 1 ? "text-green-600" : "text-red-600"}>
                            {rule.executionResult === 1 ? t('detail.engines.success') : t('detail.engines.failed')}
                            </span>
                        </div>
                        );
                    }) || (
                        <div className="text-gray-500 text-center py-2">
                        No validation rules executed
                        </div>
                    )}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">{t('detail.engines.taxEngineDetails')}</h4>
                    <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>EU-TAX-DETERMINE-001</span>
                        <span className="text-green-600">Success (tax classification)</span>
                    </div>
                    <div className="flex justify-between">
                        <span>EU-VAT-RATE-002</span>
                        <span className="text-green-600">Success (statutory rate)</span>
                    </div>
                    <div className="flex justify-between">
                        <span>EU-VAT-CLASSIFY-001</span>
                        <span className="text-green-600">Success (tax categorization)</span>
                    </div>
                    </div>
                </div>
                </div>

            </div>
            </div>
        )}

        {activeTab === 'validation' && (
            <div className="p-6">
            {/* Rule Log Error State */}
            {ruleLogError && (
                <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                    <div className="flex items-start">
                        <i className="ri-error-warning-line text-red-500 mr-3 mt-0.5"></i>
                        <div>
                        <h3 className="text-sm font-medium text-red-800">{t('detail.validation.failedToLoadValidationData')}</h3>
                        <p className="mt-1 text-sm text-red-700">{ruleLogError}</p>
                        </div>
                    </div>
                    <button
                        onClick={retryRuleLogData}
                        disabled={ruleLogLoading}
                        className="ml-4 inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {ruleLogLoading ? (
                        <>
                            <i className="ri-loader-2-line animate-spin mr-1"></i>
                            {t('detail.engines.retrying')}
                        </>
                        ) : (
                        <>
                            <i className="ri-refresh-line mr-1"></i>
                            Retry
                        </>
                        )}
                    </button>
                    </div>
                </div>
                </div>
            )}

            {/* Loading State */}
            {ruleLogLoading && !ruleLogData && (
                <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                    <i className="ri-loader-2-line animate-spin text-blue-500 mr-3"></i>
                    <span className="text-blue-700">{t('detail.validation.loadingValidationData')}</span>
                    </div>
                </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white">
                    <i className="ri-check-double-line"></i>
                    </div>
                    <div>
                    <h3 className="text-lg font-semibold text-green-900">{t('detail.validation.overallAssessment')}</h3>
                    <p className="text-green-700">
                        {t('detail.validation.rulesExecuted', { count: ruleLogData?.groupedByRuleType['1']?.length || 0, passed: requestDetail?.complianceVerified, failed: requestDetail?.complianceErrors })}
                    </p>
                    </div>
                </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-3">
                    <i className="ri-check-line mr-2"></i>
                    {t('detail.validation.validationPassed', { count: requestDetail?.complianceVerified })}
                    </h4>
                    <div className="space-y-2 text-sm">
                    {ruleLogData?.groupedByRuleType['1']?.filter((rule: RuleLogDetailDto) => rule.executionResult === 1).map((rule: RuleLogDetailDto) => (
                        <div key={rule.id} className="text-gray-600">• {rule.ruleName || rule.ruleCode}</div>
                    )) || <div className="text-gray-500">{t('detail.validation.noSuccessfulValidations')}</div>}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-3">
                    <i className="ri-close-line mr-2"></i>
{t('detail.validation.validationFailures', { count: requestDetail?.complianceErrors })}
                    </h4>
                    <div className="space-y-2 text-sm">
                    {ruleLogData?.groupedByRuleType['1']?.filter((rule: RuleLogDetailDto) => rule.executionResult === 2).map((rule: RuleLogDetailDto) => (
                        <div key={rule.id} className="p-2 bg-red-50 rounded border border-red-200">
                        <div className="font-medium text-red-800">{rule.ruleName || rule.ruleCode}</div>
                        <div className="text-red-700">{rule.errorMessage || 'Validation failed'}</div>
                        </div>
                    )) || (
                        <div className="flex items-center justify-center py-8 text-gray-400">
                        <i className="ri-check-double-line mr-2"></i>
                        No validation failures
                        </div>
                    )}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-3">
                    <i className="ri-alert-line mr-2"></i>
{t('detail.validation.advisoryWarnings', { count: '0' })}
                    </h4>
                    <div className="text-sm text-gray-600">
                    <div className="flex items-center justify-center py-8 text-gray-400">
                        <i className="ri-check-double-line mr-2"></i>
                        {t('detail.validation.noAdvisoryWarnings')}
                    </div>
                    </div>
                </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{t('detail.validation.complianceEngineLog')}</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-medium text-gray-900">{t('detail.validation.validationEngine')}</th>
                        <th className="text-left py-2 font-medium text-gray-900">{t('detail.validation.validatedFields')}</th>
                        <th className="text-left py-2 font-medium text-gray-900">{t('detail.validation.executionResult')}</th>
                        <th className="text-left py-2 font-medium text-gray-900">{t('detail.validation.executionTime')}</th>
                        <th className="text-left py-2 font-medium text-gray-900">{t('detail.validation.complianceNotes')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ruleLogData?.groupedByRuleType['1']?.map((rule) => {
                        // Debug: 打印表格中的rule对象
                        console.log('Table Rule Debug:', {
                            id: rule.id,
                            ruleId: rule.ruleId,
                            ruleCode: rule.ruleCode,
                            country: rule.country,
                            allKeys: Object.keys(rule)
                        });
                        return (
                            <tr key={rule.id} className="border-b border-gray-100">
                            <td className="py-2">
                                {rule.ruleId ? (
                                <a
                                    href={getAssetPath(`/invoice-rules/${rule.ruleId}?country=${rule.country || 'CN'}`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                >
                                    {rule.ruleCode}
                                </a>
                                ) : (
                                <span className="text-gray-900" title={`Debug: ruleId=${rule.ruleId}, keys=${Object.keys(rule).join(',')}`}>
                                    {rule.ruleCode} [No ruleId]
                                </span>
                                )}
                            </td>
                            <td className="py-2">{rule.fieldPath}</td>
                            <td className="py-2">
                            <span className={rule.executionResult === 1 ? "text-green-600" : "text-red-600"}>
                                {rule.executionResult === 1 ? t('detail.validation.compliant') : t('detail.engines.failed')}
                            </span>
                            </td>
                            <td className="py-2">{rule.executionTime}ms</td>
                            <td className="py-2">{rule.errorMessage || rule.description || t('detail.validation.validationCompleted')}</td>
                        </tr>
                        );
                        }) || (
                        <tr>
                            <td colSpan={5} className="py-4 text-center text-gray-500">
                            No validation rules executed
                            </td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
            </div>
        )}
        </div>
    )}
    </main>
    </div>
  );
}
