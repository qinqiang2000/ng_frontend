import React, { useState } from 'react';
import { FileTree, IconTree} from '../src/index';
import data from './data1.json';

export default function Test() {
    const [treeData, setTreeData] = useState(data);
    const [selectedUid, setSelectedUid] = useState('1580323742276386816');
    const [collapseUids, setCollapseUids] = useState([]);
    const [selectedId, setSelectedId] = useState('1580323742276386816');
    const [collapseIds, setCollapseIds] = useState([]);

    const getselectedUid = (uid) => {
        setSelectedUid(uid);
    };

    const getSelectedId = (uid) => {
        setSelectedId(uid);
    };

    const getCollapseUids = (uids) => {
        setCollapseUids(uids);
    };

    const getCollapseIds = (uids) => {
        setCollapseIds(uids);
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
            selectedId={selectedId}
            getSelectedId={getSelectedId}
            collapseIds={collapseIds}
            getCollapseIds={getCollapseIds}
            draggable={true}
            treeHeight={900}
            treeWidth={225}
        />
    )
};
