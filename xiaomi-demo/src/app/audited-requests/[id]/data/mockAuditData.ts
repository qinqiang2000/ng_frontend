import { AuditData } from '../types/audit.types';

export const mockAuditData: AuditData = {
  nodes: [
    {
      id: 'RECEIPT001',
      type: 'receipt',
      name: '收货单 #RCP-2024-001234',
      previewUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzQzODVmNCIvPjx0ZXh0IHg9IjUwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+收货单</text><text x="50" y="65" font-family="Arial" font-size="8" fill="white" text-anchor="middle">结构化数据</text></svg>',
      validationStatus: 'warning',
      position: { x: 400, y: 100 },
      validations: [
        {
          ruleId: 'VAL-001',
          description: '收货单基本信息完整性检查',
          status: 'passed',
          resultDescription: '收货单包含所有必填字段：收货日期、供应商信息、收货数量、折扣后收货含税总金额等'
        },
        {
          ruleId: 'VAL-002',
          description: '收货单服务完成日期区间验证',
          status: 'passed',
          resultDescription: '服务完成日期区间为2024-01-15至2024-03-15，时间跨度合理'
        },
        {
          ruleId: 'VAL-003',
          description: '收货单备注摘要关键字提取',
          status: 'passed',
          resultDescription: '成功提取关键字：品牌推广、数字营销、线上投放'
        }
      ]
    },
    {
      id: 'ORDER001',
      type: 'contract',
      name: '订单 #ORD-2024-5678',
      previewUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzEwYjk4MSIvPjx0ZXh0IHg9IjUwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+订单</text><text x="50" y="65" font-family="Arial" font-size="8" fill="white" text-anchor="middle">结构化数据</text></svg>',
      validationStatus: 'passed',
      position: { x: 150, y: 250 },
      validations: [
        {
          ruleId: 'VAL-004',
          description: '订单信息完整性检查',
          status: 'passed',
          resultDescription: '订单包含完整的供应商信息、服务内容、金额明细和交付时间要求'
        },
        {
          ruleId: 'VAL-005',
          description: '订单与收货单关联验证',
          status: 'passed',
          resultDescription: '订单号与收货单中的订单引用完全匹配'
        }
      ]
    },
    {
      id: 'QUOTE001',
      type: 'attachment',
      name: '报价单 #QT-2024-789',
      previewUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y1OWU0MiIvPjx0ZXh0IHg9IjUwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+报价单</text><text x="50" y="65" font-family="Arial" font-size="8" fill="white" text-anchor="middle">附件/图片</text></svg>',
      validationStatus: 'failed',
      position: { x: 100, y: 400 },
      validations: [
        {
          ruleId: 'VAL-006',
          description: '报价单甲方公司名称检查',
          status: 'passed',
          resultDescription: '报价单甲方确认为：环胜电子商务(上海)有限公司，信息准确'
        },
        {
          ruleId: 'VAL-007',
          description: '报价单乙方合同专用章验证',
          status: 'failed',
          resultDescription: '报价单缺少乙方合同专用章(红章)，需要补盖公章后重新提交'
        },
        {
          ruleId: 'VAL-008',
          description: '报价单费用总计与收货单金额一致性',
          status: 'passed',
          resultDescription: '报价单"费用总计"¥285,600与收货单"折扣后收货含税总金额"¥285,600完全一致'
        },
        {
          ruleId: 'VAL-009',
          description: '报价单项目抬头与收货单备注关键字匹配',
          status: 'passed',
          resultDescription: '报价单项目抬头"品牌推广服务"与收货单备注关键字"品牌推广、数字营销"匹配度高'
        },
        {
          ruleId: 'VAL-010',
          description: '报价单项目周期与收货单服务完成日期匹配',
          status: 'passed',
          resultDescription: '报价单项目周期2024-01-10至2024-03-20与收货单服务完成日期2024-01-15至2024-03-15存在合理重叠'
        },
        {
          ruleId: 'VAL-013',
          description: '报价单品项名称与推文物料一致性验证',
          status: 'passed',
          resultDescription: '报价单中的品项名称"微博推广、微信朋友圈投放、小红书种草营销、抖音短视频制作"在推文物料中均找到对应条目'
        }
      ]
    },
    {
      id: 'MATERIAL001',
      type: 'attachment',
      name: '推文物料 #MAT-2024-456',
      previewUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzg5MzNmZiIvPjx0ZXh0IHg9IjUwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI>推文物料</text><text x="50" y="65" font-family="Arial" font-size="8" fill="white" text-anchor="middle">附件/图片</text></svg>',
      validationStatus: 'passed',
      position: { x: 650, y: 400 },
      validations: [
        {
          ruleId: 'VAL-011',
          description: '推文物料内容完整性检查',
          status: 'passed',
          resultDescription: '推文物料包含完整的品项清单：微博推广、微信朋友圈投放、小红书种草营销、抖音短视频制作'
        },
        {
          ruleId: 'VAL-012',
          description: '推文物料品质标准验证',
          status: 'passed',
          resultDescription: '所有推文物料符合品牌调性，图片清晰度达到发布标准，文案内容经过审核'
        }
      ]
    }
  ],
  edges: [
    {
      id: 'edge1',
      from: 'ORDER001',
      to: 'RECEIPT001',
      type: 'supports',
      label: '订单支持收货'
    },
    {
      id: 'edge2',
      from: 'QUOTE001',
      to: 'RECEIPT001',
      type: 'validates',
      label: '金额验证'
    },
    {
      id: 'edge3',
      from: 'QUOTE001',
      to: 'ORDER001',
      type: 'references',
      label: '项目抬头匹配'
    },
    {
      id: 'edge4',
      from: 'MATERIAL001',
      to: 'QUOTE001',
      type: 'supports',
      label: '品项名称验证'
    },
    {
      id: 'edge5',
      from: 'QUOTE001',
      to: 'RECEIPT001',
      type: 'validates',
      label: '服务周期匹配'
    }
  ]
};