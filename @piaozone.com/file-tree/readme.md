# 拖动树组件

```js

import Review from '@piaozone.com/file-tree';
export default function Test() {
    const data = [
	{
		"id": 1580323742276386816,
		"uid": "115ddebc77ee4718893a89a4a0961eff",
		"title": "001记账凭证2023-03",
		"type": 1,
        "typeName": "凭证",
		"children": [
			{
				"id": 1580323742276386816,
				"uid": "fcefb4ba86e544e9ab6750f46851a704",
				"title": "KDC-202321-2395KDC-202321-2395",
				"type": 3,
                "typeName": "发票",
				"children": [
					{
						"id": 1580323742276386816,
						"uid": "5d465596913041599af6c708ee62f7cc",
						"title": "23900781882883",
                        "typeName": "其他",
						"type": 99
					}
				]
			},
			{
				"id": 1580323742276386816,
				"uid": "ce644eb3a4a3403bb71ba27632b94be4",
				"title": "KDC-202321-2395",
                "typeName": "发票",
				"type": 13
			},
			{
				"id": 1580323742276386816,
				"uid": "a47f71a9629448edb25676bfd655c437",
				"title": "23900781882883",
                "typeName": "其他",
				"type": 99
			}
		]
	}
]

    const [treeData, setTreeData] = useState(data);
    const [selectedUid, setSelectedUid] = useState('');
    const [collapseUids, setCollapseUids] = useState([]);

    const getselectedUid = (uid) => {
        setSelectedUid(uid);
    };

    const getCollapseUids = (uids) => {
        setCollapseUids(uids);
    };

    const getNewTreeData = (tree) => {
        setTreeData(tree);
    };

    return (
        <FileTree
            treeData={treeData}
            getNewTreeData={getNewTreeData}
            selectedUid={selectedUid}
            getselectedUid={getselectedUid}
            collapseUids={collapseUids}
            getCollapseUids={getCollapseUids}
            draggable={true}
            treeHeight={900}
            treeWidth={225}
        />
    )
};

FileTree.propTypes = {
    treeData: PropTypes.array, // 数据源
    getNewTreeData: PropTypes.func, // 回调函数，改变treeData
    selectedUid: PropTypes.string, // 当前选中值的uid
    getselectedUid: PropTypes.func, // 获取选中的值的uid
    collapseUids: PropTypes.array, // 默认收起的uid
    getCollapseUids: PropTypes.func, // 收起树的回调
    draggable: PropTypes.bool, // 是否可以拖动
    treeHeight: PropTypes.number, // 树的高度
    treeWidth: PropTypes.number // 树的宽度
}

IconTree.propTypes = {
    treeData: PropTypes.array, // 数据源
    selectedId: PropTypes.string, // 当前选中值的uid
    getSelectedId: PropTypes.func, // 获取选中的值的uid
    collapseIds: PropTypes.array, // 默认收起的uid
    getCollapseIds: PropTypes.func, // 收起树的回调
    treeHeight: PropTypes.number, // 树的高度
    treeWidth: PropTypes.number // 树的宽度
}

```

