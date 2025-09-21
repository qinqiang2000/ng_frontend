'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
  MarkerType,
  MiniMap,
  useReactFlow,
  BezierEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import DocumentNode from './DocumentNode';
import InvoiceNode from './InvoiceNode';
import AttachmentNode from './AttachmentNode';
import Toolbar from './Toolbar';
import InfoPanel from './InfoPanel';
import FileUpload from './FileUpload';
import { fetchBillFiles, BillFile, uploadMultipartFile, deleteBillFile } from '@/client/services/invoiceRequestService';
import { useToast } from '@/client/hooks/useToast';
import Toast from '@/client/components/ui/Toast';
import { useAuditedRequestsTranslation } from '@/client/hooks/useTranslation';

interface ConnectionInfo {
  source: string;
  target: string;
  relation: string;
  confidence: number;
}


// 将nodeTypes和edgeTypes定义在组件外部，避免重复创建
const nodeTypes = {
  document: DocumentNode,
  invoice: InvoiceNode,
  attachment: AttachmentNode,
};

const edgeTypes = {
  bezier: BezierEdge,
};

const initialNodes: Node[] = [
  {
    id: 'primary-doc',
    type: 'document',
    position: { x: 100, y: 100 },
    data: {
      title: '费用报销申请单',
      type: '费用报销单',
      fields: [
        { label: '报销金额', value: '¥2,850.00', highlighted: false },
        { label: '费用用途', value: '北京出差住宿费', highlighted: false },
        { label: '申请日期', value: '2024-08-20', highlighted: false },
        { label: '申请人', value: '张三', highlighted: false },
        { label: '部门', value: '销售部', highlighted: false },
      ],
    },
  },
  {
    id: 'invoice-1',
    type: 'invoice',
    position: { x: 750, y: 50 },
    data: {
      title: '住宿发票',
      status: '已验证',
      invoiceNumber: 'INV-2024-001234',
      amount: '¥2,850.00',
      fields: [
        { label: '开票金额', value: '¥2,850.00', highlighted: false },
        { label: '税率', value: '13%', highlighted: false },
        { label: '开票日期', value: '2024-07-15', highlighted: false },
        { label: '开票方', value: '北京酒店管理有限公司', highlighted: false },
        { label: '税号', value: '91110000****', highlighted: false },
      ],
    },
  },
  {
    id: 'invoice-2',
    type: 'invoice',
    position: { x: 1100, y: 520 },
    data: {
      title: '餐饮发票',
      status: '待审核',
      invoiceNumber: 'INV-2024-001235',
      amount: '¥380.00',
      fields: [
        { label: '开票金额', value: '¥380.00', highlighted: false },
        { label: '税率', value: '6%', highlighted: false },
        { label: '开票日期', value: '2024-07-16', highlighted: false },
        { label: '开票方', value: '北京餐饮服务有限公司', highlighted: false },
      ],
    },
  },
  {
    id: 'attachment-1',
    type: 'attachment',
    position: { x: 100, y: 750 },
    data: {
      title: '酒店入住凭证',
      type: '酒店水单',
      fields: [
        { label: '入住日期', value: '2024-07-15', highlighted: false },
        { label: '退房日期', value: '2024-07-17', highlighted: false },
        { label: '房间类型', value: '标准单间', highlighted: false },
        { label: '入住人', value: '张三', highlighted: false },
      ],
    },
  },
  {
    id: 'attachment-2',
    type: 'attachment',
    position: { x: 750, y: 950 },
    data: {
      title: '交通费凭证',
      type: '物流单',
      fields: [
        { label: '出行日期', value: '2024-07-15', highlighted: false },
        { label: '路线', value: '上海 → 北京', highlighted: false },
        { label: '交通方式', value: '高铁', highlighted: false },
        { label: '票价', value: '¥553.50', highlighted: false },
      ],
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'primary-doc',
    target: 'invoice-1',
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'bezier',
    animated: false,
    style: { 
      stroke: '#3b82f6', 
      strokeWidth: 2,
    },
    markerStart: {
      type: MarkerType.ArrowClosed,
      color: '#3b82f6',
      width: 8,
      height: 8,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#3b82f6',
      width: 8,
      height: 8,
    },
    label: '金额匹配',
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#dbeafe', color: '#1e40af', stroke: '#3b82f6' },
    labelStyle: { fontSize: '12px', fontWeight: 500, fill: '#1e40af' },
    data: { relation: '金额匹配', confidence: 0.95 },
  },
  {
    id: 'e1-3',
    source: 'primary-doc',
    target: 'invoice-2',
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'bezier',
    animated: false,
    style: { 
      stroke: '#3b82f6', 
      strokeWidth: 2,
    },
    markerStart: {
      type: MarkerType.ArrowClosed,
      color: '#3b82f6',
      width: 8,
      height: 8,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#3b82f6',
      width: 8,
      height: 8,
    },
    label: '费用关联',
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#dbeafe', color: '#1e40af', stroke: '#3b82f6' },
    labelStyle: { fontSize: '12px', fontWeight: 500, fill: '#1e40af' },
    data: { relation: '费用关联', confidence: 0.85 },
  },
  {
    id: 'e1-4',
    source: 'primary-doc',
    target: 'attachment-1',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    type: 'bezier',
    animated: false,
    style: { 
      stroke: '#10b981', 
      strokeWidth: 2,
    },
    markerStart: {
      type: MarkerType.ArrowClosed,
      color: '#10b981',
      width: 8,
      height: 8,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#10b981',
      width: 8,
      height: 8,
    },
    label: '住宿凭证',
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#d1fae5', color: '#047857', stroke: '#10b981' },
    labelStyle: { fontSize: '12px', fontWeight: 500, fill: '#047857' },
    data: { relation: '住宿凭证', confidence: 0.92 },
  },
  {
    id: 'e1-5',
    source: 'primary-doc',
    target: 'attachment-2',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    type: 'bezier',
    animated: false,
    style: { 
      stroke: '#10b981', 
      strokeWidth: 2,
    },
    markerStart: {
      type: MarkerType.ArrowClosed,
      color: '#10b981',
      width: 8,
      height: 8,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#10b981',
      width: 8,
      height: 8,
    },
    label: '交通凭证',
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#d1fae5', color: '#047857', stroke: '#10b981' },
    labelStyle: { fontSize: '12px', fontWeight: 500, fill: '#047857' },
    data: { relation: '交通凭证', confidence: 0.88 },
  },
  {
    id: 'e2-3',
    source: 'invoice-1',
    target: 'attachment-1',
    sourceHandle: 'bottom',
    targetHandle: 'right',
    type: 'bezier',
    animated: false,
    style: { 
      stroke: '#f59e0b', 
      strokeWidth: 2,
    },
    markerStart: {
      type: MarkerType.ArrowClosed,
      color: '#f59e0b',
      width: 8,
      height: 8,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#f59e0b',
      width: 8,
      height: 8,
    },
    label: '发票验证',
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#fef3c7', color: '#b45309', stroke: '#f59e0b' },
    labelStyle: { fontSize: '12px', fontWeight: 500, fill: '#b45309' },
    data: { relation: '发票验证', confidence: 0.88 },
  },
];

// 预览模态框组件
const PreviewModal = ({ isOpen, onClose, title, type, filePath }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: string;
  filePath?: string;
}) => {
  const { t } = useAuditedRequestsTranslation();
  const [modalWidth, setModalWidth] = useState(60);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const newWidth = Math.min(Math.max((e.clientX / window.innerWidth) * 100, 20), 80);
    setModalWidth(newWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl flex flex-col h-4/5 relative"
        style={{ width: `${modalWidth}%` }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <i className="ri-file-text-line w-5 h-5 flex items-center justify-center text-blue-600"></i>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
          >
            <i className="ri-close-line w-5 h-5 flex items-center justify-center"></i>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 p-4 overflow-hidden">
          {filePath ? (
            <iframe
              src={filePath}
              className="w-full h-full border border-gray-200 rounded-lg"
              title={`Preview - ${title}`}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <i className="ri-file-text-line w-16 h-16 flex items-center justify-center mx-auto mb-4 text-gray-400"></i>
                <p className="text-lg font-medium">{t('components.canvas.filePreview')}</p>
                <p className="text-sm mt-2">{t('components.canvas.noFilePathAvailable')}</p>
              </div>
            </div>
          )}
        </div>

        {/* 右侧调整手柄 */}
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-ew-resize bg-transparent hover:bg-blue-500/20 transition-colors"
          onMouseDown={handleMouseDown}
        >
          <div className="w-1 h-full bg-blue-500/0 hover:bg-blue-500/50 transition-colors"></div>
        </div>
      </div>
    </div>
  );
};

interface DocumentCanvasProps {
  billId: number;
}

// Transform bill file data to ReactFlow nodes and edges
const transformBillFilesToNodes = (billFiles: BillFile[]): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  let primaryDoc: BillFile | null = null;
  const attachments: BillFile[] = [];
  
  // Separate primary document and attachments
  billFiles.forEach((file: BillFile) => {
    if (file.fileType === 1) {
      primaryDoc = file;
    } else {
      attachments.push(file);
    }
  });

  // Create primary document node
  if (primaryDoc !== null) {
    const primaryFile = primaryDoc as BillFile;
    const documentType = primaryFile.documentType || 'unknown';
    const fields = extractFieldsFromOcrResult(primaryFile, documentType);
    nodes.push({
      id: `file-${primaryFile.id}`,
      type: 'document',
      position: { x: 100, y: 300 },
      data: {
        title: primaryFile.fileName,
        type: primaryFile.fileFormat.toUpperCase(),
        fields,
        filePath: primaryFile.filePath,
        ocrStatus: primaryFile.ocrStatus,
        documentType: documentType,
      },
    });
  }

  // Create attachment nodes
  let invoiceYOffset = 50;
  let attachmentYOffset = 200;
  
  attachments.forEach((file, index) => {
    const documentType = file.documentType || 'unknown';
    const fields = extractFieldsFromOcrResult(file, documentType);
    
    let nodeType = 'attachment';
    let position = { x: 750 + (index * 300), y: attachmentYOffset };
    
    // Invoice files use different node type and position
    if (documentType === 'invoice') {
      nodeType = 'invoice';
      position = { x: 750 + (index * 300), y: invoiceYOffset };
      invoiceYOffset += 400;
    } else {
      attachmentYOffset += 400;
    }

    const nodeData: any = {
      title: file.fileName,
      type: file.fileFormat.toUpperCase(),
      fields,
      filePath: file.filePath,
      ocrStatus: file.ocrStatus,
      documentType: documentType,
    };

    // Add invoice-specific data
    if (nodeType === 'invoice') {
      nodeData.status = getOcrStatusText(file.ocrStatus);
      nodeData.invoiceNumber = extractInvoiceNumber(file.ocrResult);
      nodeData.amount = extractInvoiceAmount(file.ocrResult);
    }

    nodes.push({
      id: `file-${file.id}`,
      type: nodeType,
      position,
      data: nodeData,
    });

    // Create edge from primary doc to attachment
    if (primaryDoc !== null) {
      const primaryFile = primaryDoc as BillFile;
      edges.push({
        id: `edge-${primaryFile.id}-${file.id}`,
        source: `file-${primaryFile.id}`,
        target: `file-${file.id}`,
        sourceHandle: 'right',
        targetHandle: 'left',
        type: 'default',
        animated: false,
        style: { 
          stroke: documentType === 'invoice' ? '#3b82f6' : '#10b981', 
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: documentType === 'invoice' ? '#3b82f6' : '#10b981',
          width: 8,
          height: 8,
        },
        label: getRelationLabel(documentType),
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { 
          fill: documentType === 'invoice' ? '#dbeafe' : '#d1fae5', 
          color: documentType === 'invoice' ? '#1e40af' : '#047857', 
          stroke: documentType === 'invoice' ? '#3b82f6' : '#10b981' 
        },
        labelStyle: { 
          fontSize: '12px', 
          fontWeight: 500, 
          fill: documentType === 'invoice' ? '#1e40af' : '#047857' 
        },
      });
    }
  });

  return { nodes, edges };
};

// Extract fields from OCR result based on document type
const extractFieldsFromOcrResult = (file: BillFile, documentType: string): any[] => {
  if (file.ocrStatus !== 3) {
    return [{
      label: 'OCR Status',
      value: getOcrStatusText(file.ocrStatus),
      highlighted: false
    }];
  }

  try {
    const ocrData = JSON.parse(file.ocrResult);
    
    switch (documentType) {
      case 'contract':
        return [
          { label: 'Contract ID', value: ocrData.contractId || 'N/A', highlighted: false },
          { label: 'Sign Date', value: ocrData.signDate || 'N/A', highlighted: false },
          { label: 'Contract Amount', value: ocrData.contractAmount || 'N/A', highlighted: false },
          { label: 'Party A', value: ocrData.partyA || 'N/A', highlighted: false },
          { label: 'Party B', value: ocrData.partyB || 'N/A', highlighted: false },
        ];
        
      case 'deliveryNote':
        return [
          { label: 'Order Number', value: ocrData.orderInfo?.orderNumber || 'N/A', highlighted: false },
          { label: 'Year', value: ocrData.orderInfo?.year || 'N/A', highlighted: false },
          { label: 'Total Order Amount', value: ocrData.orderInfo?.totalOrderAmount || 'N/A', highlighted: false },
          { label: 'Receipt Number', value: ocrData.receiptInfo?.receiptNumber || 'N/A', highlighted: false },
          { label: 'Supplier Code', value: ocrData.receiptInfo?.supplierCode || 'N/A', highlighted: false },
          { label: 'Discount Rate', value: ocrData.receiptInfo?.discountRate || 'N/A', highlighted: false },
          { label: 'Remark', value: ocrData.receiptInfo?.remark || 'N/A', highlighted: false },
        ];
        
      case 'billOfMaterials':
        const materialCount = Array.isArray(ocrData.materialList) ? ocrData.materialList.length : 0;
        return [
          { label: 'Product Name', value: ocrData.productName || 'N/A', highlighted: false },
          { label: 'Create Date', value: ocrData.createDate || 'N/A', highlighted: false },
          { label: 'Effective Date', value: ocrData.effectiveDate || 'N/A', highlighted: false },
          { label: 'Material List', value: `${materialCount} items`, highlighted: false },
        ];
        
      case 'invoice':
        const taxRate = ocrData.items && ocrData.items[0] ? ocrData.items[0].taxRate : 'N/A';
        return [
          { label: 'Invoice Amount', value: ocrData.totalAmount || 'N/A', highlighted: false },
          { label: 'Tax Rate', value: taxRate, highlighted: false },
          { label: 'Invoice Date', value: ocrData.invoiceDate || 'N/A', highlighted: false },
          { label: 'Seller Name', value: ocrData.salerName || 'N/A', highlighted: false },
          { label: 'Seller Tax No', value: ocrData.salerTaxNo || 'N/A', highlighted: false },
        ];
        
      case 'quotation':
        const projectPeriod = ocrData.projectPeriod && ocrData.projectPeriod.start && ocrData.projectPeriod.end
          ? `${ocrData.projectPeriod.start} - ${ocrData.projectPeriod.end}`
          : 'N/A';
        return [
          { label: 'Title', value: ocrData.title || 'N/A', highlighted: false },
          { label: 'Quotation Date', value: ocrData.quotationDate || 'N/A', highlighted: false },
          { label: 'Project Period', value: projectPeriod, highlighted: false },
          { label: 'Customer', value: ocrData.custom || 'N/A', highlighted: false },
          { label: 'Customer Contact', value: ocrData.customContactName || 'N/A', highlighted: false },
          { label: 'Vendor', value: ocrData.vendor || 'N/A', highlighted: false },
        ];
        
      default:
        return [
          { label: 'File Name', value: file.fileName, highlighted: false },
          { label: 'File Type', value: file.fileFormat.toUpperCase(), highlighted: false },
          { label: 'Status', value: 'OCR Completed', highlighted: false },
        ];
    }
  } catch (error) {
    return [
      { label: 'OCR Error', value: 'Failed to parse OCR result', highlighted: false },
    ];
  }
};

// Helper functions

const getOcrStatusText = (status: number): string => {
  switch (status) {
    case 1: return 'Pending';
    case 2: return 'Processing';
    case 3: return 'Completed';
    case 4: return 'Failed';
    default: return 'Unknown';
  }
};

const extractInvoiceNumber = (ocrResult: string): string => {
  try {
    const ocrData = JSON.parse(ocrResult);
    return ocrData.invoiceNumber || ocrData.invoiceNo || 'N/A';
  } catch {
    return 'N/A';
  }
};

const extractInvoiceAmount = (ocrResult: string): string => {
  try {
    const ocrData = JSON.parse(ocrResult);
    return ocrData.totalAmount || 'N/A';
  } catch {
    return 'N/A';
  }
};

const getRelationLabel = (documentType: string): string => {
  switch (documentType) {
    case 'invoice': return 'Invoice Relation';
    case 'contract': return 'Contract Relation';
    case 'deliveryNote': return 'Delivery Relation';
    case 'billOfMaterials': return 'BOM Relation';
    case 'quotation': return 'Quotation Relation';
    default: return 'Document Relation';
  }
};

export default function DocumentCanvas({ billId }: DocumentCanvasProps) {
  const { t } = useAuditedRequestsTranslation();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showRelations, setShowRelations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    title: string;
    type: string;
    filePath?: string;
  }>({ isOpen: false, title: '', type: '' });
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, setSelectedNodeForDelete] = useState<Node | null>(null);
  const { toasts, success, error, warning, removeToast } = useToast();

  // 使用useMemo缓存nodeTypes和edgeTypes，避免重复创建警告
  const memoizedNodeTypes = useMemo(() => ({
    document: DocumentNode,
    invoice: InvoiceNode,
    attachment: AttachmentNode,
  }), []);
  
  const memoizedEdgeTypes = useMemo(() => ({
    bezier: BezierEdge,
  }), []);

  // Load bill files data
  const loadBillFiles = useCallback(async (resetView = false, forceRefresh = false) => {
    if (!billId || billId <= 0) {
      setLoadError('Invalid bill ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    
    // 重置选中状态和关联显示
    setSelectedField(null);
    setShowRelations(false);

    try {
      // 使用forceRefresh参数强制重新调用API
      const billFiles = await fetchBillFiles(billId, forceRefresh);
      const { nodes: newNodes, edges: newEdges } = transformBillFilesToNodes(billFiles);
      setNodes(newNodes);
      setEdges(newEdges);
      
      // 如果需要重置视图且有ReactFlow实例
      if (resetView && reactFlowInstance) {
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
        }, 100);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bill files';
      setLoadError(errorMessage);
      console.error('Error loading bill files:', err);
    } finally {
      setLoading(false);
    }
  }, [billId, setNodes, setEdges, reactFlowInstance]);

  useEffect(() => {
    let isCancelled = false;
    
    const loadInitialData = async () => {
      if (!billId || billId <= 0) {
        if (!isCancelled) {
          setLoadError('Invalid bill ID');
          setLoading(false);
        }
        return;
      }

      if (!isCancelled) {
        setLoading(true);
        setLoadError(null);
        setSelectedField(null);
        setShowRelations(false);
      }

      try {
        // 初始加载不使用强制刷新，使用缓存
        const billFiles = await fetchBillFiles(billId, false);
        
        if (!isCancelled) {
          const { nodes: newNodes, edges: newEdges } = transformBillFilesToNodes(billFiles);
          setNodes(newNodes);
          setEdges(newEdges);
        }
      } catch (err) {
        if (!isCancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load bill files';
          setLoadError(errorMessage);
          console.error('Error loading bill files:', err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isCancelled = true;
    };
  }, [billId, setNodes, setEdges]);

  const handleRefresh = async () => {
    await loadBillFiles(true, true); // 刷新时重置视图并强制重新调用API
  };

  // Handle file deletion with confirmation
  const handleDeleteFile = async (node: Node) => {
    // Only allow deletion of attachment and invoice nodes
    if (node.type !== 'attachment' && node.type !== 'invoice') {
      error(t('components.canvas.deleteFailed'), t('components.canvas.onlyAttachmentCanDelete'));
      return;
    }

    // Extract file ID from node ID (format: file-{fileId})
    const fileIdMatch = node.id.match(/^file-(\d+)$/);
    if (!fileIdMatch) {
      error(t('components.canvas.deleteFailed'), t('components.canvas.invalidFileId'));
      return;
    }

    const fileId = parseInt(fileIdMatch[1], 10);
    if (isNaN(fileId)) {
      error(t('components.canvas.deleteFailed'), t('components.canvas.invalidFileIdFormat'));
      return;
    }

    // Show confirmation dialog
    const confirmDelete = window.confirm(
      t('components.canvas.confirmDelete', { type: node.type, title: node.data.title })
    );
    
    if (!confirmDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteBillFile(fileId);
      success(t('components.canvas.deleteSuccessful'), result || t('components.canvas.fileDeletedSuccessfully'));
      // Refresh dependency graph after successful deletion
      await loadBillFiles(true, true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      error(t('components.canvas.deleteFailed'), errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (files: File[]) => {
    if (!billId || billId <= 0) {
      error(t('components.canvas.uploadFailed'), t('components.canvas.invalidBillId'));
      return;
    }

    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    const uploadPromises = files.map(async (file) => {
      try {
        console.log('Starting upload for file:', file.name);
        const result = await uploadMultipartFile(billId, file);
        console.log('Upload successful for file:', file.name, 'Result:', result);
        return { success: true, fileName: file.name };
      } catch (err) {
        console.error('Upload failed for file:', file.name, 'Error:', err);
        return { 
          success: false, 
          fileName: file.name, 
          error: err instanceof Error ? err.message : '上传失败' 
        };
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.length - successCount;
      
      if (failedCount === 0) {
        success(t('components.canvas.uploadSuccessful'), t('components.canvas.successfullyUploaded', { count: successCount }));
        // Trigger refresh after successful upload
        await loadBillFiles(true, true);
      } else if (successCount > 0) {
        const failedFiles = results.filter(r => !r.success);
        const failedFileNames = failedFiles.map(f => f.fileName).join(', ');
        warning(t('components.canvas.partialUploadSuccess'), t('components.canvas.uploadPartialResult', { successCount, failedCount, failedFiles: failedFileNames }));
        // Still refresh to show successfully uploaded files
        await loadBillFiles(true, true);
      } else {
        const firstError = results.find(r => !r.success)?.error || '上传失败';
        error(t('components.canvas.uploadFailed'), firstError);
      }
    } catch (err) {
      error(t('components.canvas.uploadFailed'), err instanceof Error ? err.message : t('components.canvas.unknownError'));
    } finally {
      setIsUploading(false);
    }
  };

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleFieldClick = (nodeId: string, fieldIndex: number) => {
    const fieldId = `${nodeId}-${fieldIndex}`;

    if (selectedField === fieldId) {
      // 取消选择
      setSelectedField(null);
      setShowRelations(false);
      // 重置所有节点的高亮状态
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            fields: node.data.fields?.map((field: any) => ({ ...field, highlighted: false })) || [],
          },
        }))
      );
    } else {
      // 选择新字段
      setSelectedField(fieldId);
      setShowRelations(true);

      // 高亮相关字段
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            fields: node.data.fields?.map((field: any, index: number) => {
              const currentFieldId = `${node.id}-${index}`;
              return {
                ...field,
                highlighted: shouldHighlightField(fieldId, currentFieldId),
              };
            }) || [],
          },
        }))
      );

      // 更新边的动画状态
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          animated: shouldAnimateEdge(fieldId, edge),
          style: {
            ...edge.style,
            strokeWidth: shouldAnimateEdge(fieldId, edge) ? 3 : 2,
          },
        }))
      );
    }
  };

  const handlePreviewClick = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setPreviewModal({
        isOpen: true,
        title: node.data.title,
        type: node.data.type || node.data.status || 'Document',
        filePath: node.data.filePath,
      });
    }
  };


  const shouldHighlightField = (selectedFieldId: string, currentFieldId: string) => {
    // 实现字段关联逻辑
    if (selectedFieldId === currentFieldId) return true;

    // 金额关联
    if (selectedFieldId.includes('primary-doc-0') && currentFieldId.includes('invoice') && currentFieldId.endsWith('-0')) {
      return true;
    }

    // 日期关联
    if (selectedFieldId.includes('invoice-1-2') && currentFieldId.includes('attachment-1-0')) {
      return true;
    }

    // 申请人关联
    if (selectedFieldId.includes('primary-doc-3') && currentFieldId.includes('attachment-1-3')) {
      return true;
    }

    return false;
  };

  const shouldAnimateEdge = (selectedFieldId: string, edge: Edge) => {
    // 根据选中字段决定哪些边应该动画
    if (selectedFieldId.includes('primary-doc-0')) {
      // 金额字段相关的边
      return edge.data?.relation === '金额匹配' || edge.data?.relation === '费用关联';
    }
    if (selectedFieldId.includes('invoice-1-2')) {
      // 发票日期相关的边
      return edge.data?.relation === '发票验证';
    }
    if (selectedFieldId.includes('primary-doc-3')) {
      // 申请人相关的边
      return edge.data?.relation === '住宿凭证' || edge.data?.relation === '交通凭证';
    }
    return false;
  };

  // 更新节点数据，添加预览和删除回调
  const enhancedNodes = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onFieldClick: (fieldIndex: number) => handleFieldClick(node.id, fieldIndex),
      onPreviewClick: () => handlePreviewClick(node.id),
      onDeleteClick: (node.type === 'attachment' || node.type === 'invoice') ? () => handleDeleteFile(node) : undefined,
      isDeleting: isDeleting,
    },
  }));

  // Render the main canvas content based on state
  const renderCanvasContent = () => {
    // Loading state
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 text-lg">{t('components.canvas.loadingBillFiles')}</span>
          </div>
        </div>
      );
    }

    // Error state
    if (loadError) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <i className="ri-error-warning-line text-4xl text-red-500 mb-4"></i>
              <h3 className="text-lg font-semibold text-red-900 mb-2">{t('components.canvas.failedToLoadFiles')}</h3>
              <p className="text-red-700 mb-4">{loadError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <i className="ri-refresh-line mr-2"></i>
                {t('components.canvas.retry')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Empty state
    if (nodes.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md">
              <i className="ri-folder-open-line text-6xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('components.canvas.noFilesFound')}</h3>
              <p className="text-gray-600">{t('components.canvas.noFilesForId', { billId })}</p>
            </div>
          </div>
        </div>
      );
    }

    // Normal state with ReactFlow
    return (
      <div className="flex-1 relative">
        <ReactFlow
          nodes={enhancedNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          nodeTypes={memoizedNodeTypes}
          edgeTypes={memoizedEdgeTypes}
          className="bg-gray-50"
          fitView
        >
          <Background color="#e5e7eb" size={1} />
          <Controls 
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
            showInteractive={false}
          />
          <MiniMap 
            className="bg-white border border-gray-200 rounded-lg"
            nodeColor="#3b82f6"
            maskColor="rgba(0, 0, 0, 0.1)"
          />

          {/* 顶部面板 */}
          <Panel position="top-left" className="m-2" style={{ margin: 0 }}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 w-44">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-gray-900">{t('components.fileDependencies.title')}</h2>
              </div>
              <div className="origin-center flex justify-center">
                <div className="relative">
                  <FileUpload onFileUpload={handleFileUpload} />
                  {isUploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-xs text-gray-600">{t('components.fileDependencies.uploading')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Panel>

          {/* 连线提示 */}
          {showRelations && (
            <Panel position="top-center" className="m-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <i className="ri-link-m w-4 h-4 flex items-center justify-center"></i>
                  <span className="text-sm font-medium">
                    {t('components.canvas.highlightedRelatedFields')}
                  </span>
                </div>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex bg-gray-50 relative">
      {/* 工具栏 */}
      <Toolbar />

      {/* 主画布区域 - 根据状态渲染不同内容 */}
      {renderCanvasContent()}

      {/* 右侧信息面板 - 始终显示 */}
      <InfoPanel
        selectedField={selectedField}
        onFieldClick={handleFieldClick}
        billId={billId.toString()}
        onRefresh={handleRefresh}
      />

      {/* 预览模态框 */}
      <PreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, title: '', type: '' })}
        title={previewModal.title}
        type={previewModal.type}
        filePath={previewModal.filePath}
      />

      {/* 自定义样式 */}
      <style jsx global>{`
        .react-flow__edge-path {
          stroke-linecap: round;
        }

        .react-flow__connectionline {
          stroke: #3b82f6;
          stroke-width: 2px;
        }

        .react-flow__edge .react-flow__edge-path {
          stroke-dasharray: none;
        }

        .react-flow__marker {
          fill: currentColor;
        }

        .react-flow__attribution {
          display: none !important;
        }

      `}</style>

      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}

