'use client';

import React from 'react';
import { AuditData } from '../types/audit.types';

interface AuditDetailsPanelProps {
  auditData: AuditData;
  selectedNodeId: string | null;
}

const AuditDetailsPanel: React.FC<AuditDetailsPanelProps> = ({ auditData, selectedNodeId }) => {

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return 'ri-check-line';
      case 'warning':
        return 'ri-alert-line';
      case 'failed':
        return 'ri-close-line';
      default:
        return 'ri-question-line';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };


  return (
    <div>
      <div className="space-y-4">
        {auditData.nodes.map((node) => (
          <div 
            key={node.id} 
            className={`border rounded-lg ${
              selectedNodeId === node.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white'
            }`}
          >
            {/* Node Header */}
            <div className="px-2 py-1.5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-xs text-gray-900 truncate">{node.name}</h3>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(node.validationStatus)}`}>
                  <i className={`${getStatusIcon(node.validationStatus)} mr-1 text-xs`}></i>
                  {node.validationStatus.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Validation List */}
            <div className="p-2 space-y-2">
              {node.validations.map((validation, index) => (
                <div 
                  key={index}
                  className="p-2 rounded border border-gray-100 bg-gray-50"
                >
                  {/* Rule Header */}
                  <div className="flex items-start justify-between mb-1">
                    <i className={`${getStatusIcon(validation.status)} text-xs flex-shrink-0 mt-1 ${
                      validation.status === 'passed' ? 'text-green-600' :
                      validation.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                    }`}></i>
                    <span className="text-xs font-mono bg-gray-200 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                      {validation.ruleId}
                    </span>
                  </div>

                  {/* Rule Description */}
                  <div className="mb-1">
                    <div className="font-medium text-xs text-gray-900 leading-tight">
                      {validation.description}
                    </div>
                  </div>

                  {/* Result Description */}
                  <div className="text-xs text-gray-600 leading-relaxed">
                    {validation.resultDescription}
                  </div>
                </div>
              ))}

              {/* Empty State for node */}
              {node.validations.length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  <p className="text-xs">No validation results</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty State for all */}
        {auditData.nodes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <i className="ri-file-search-line text-2xl mb-2"></i>
            <p className="text-sm">No audit data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditDetailsPanel;