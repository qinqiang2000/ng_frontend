export interface ValidationResult {
  ruleId: string;
  description: string;
  status: 'passed' | 'failed' | 'warning';
  resultDescription: string;
}

export interface AuditNode {
  id: string;
  type: 'invoice' | 'attachment' | 'contract' | 'receipt';
  name: string;
  previewUrl: string;
  validationStatus: 'passed' | 'failed' | 'warning';
  validations: ValidationResult[];
  position: {
    x: number;
    y: number;
  };
}

export interface AuditEdge {
  id: string;
  from: string;
  to: string;
  type: 'requires' | 'supports' | 'validates' | 'references';
  label: string;
}

export interface AuditData {
  nodes: AuditNode[];
  edges: AuditEdge[];
}

export interface NodeInteractionState {
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
}