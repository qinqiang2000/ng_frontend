import React, { useEffect, useState } from 'react';
import Review from '../src/index';
import data from './data.json';

export default function Test() {
    const [treeData, setTreeData] = useState(data);
    const [checkedId, setCheckedId] = useState([]);
    const [id, setId] = useState('test01');

    const getNewTreeData = (val, type) => {
        console.log(val, type, 'newTreeData')
        setTreeData(val);
    }

    // useEffect(() => {
    //   setTimeout(() => {
    //     setTreeData(data1);
    //   }, 6000);
    // }, []);

    const handleClick = (info) => {
        console.log(info, 'info')
    }

    const getCheckedId = (ids) => {
        console.log(ids, 'ids')
        setCheckedId(ids);
    }

    const handleSelectId = (id) => {
        console.log(id, 'selectedId')
        setId(id);
    }
    const onAddLabel = (id) => {
        console.log('id----------->>>', id);
    }

    const explainList = [
        '测试'
    ]
    const addIndexToChildren = (element, index) => {
        if (element.children) {
          element.children.forEach(child => {
            if (child.imgUrl || child.docUrl) {
              child.index = index; // 给含有imgUrl的元素添加索引
              index++; // 索引自增
            }
            // 如果当前child还有子元素，递归调用
            if (child.children) {
              index = addIndexToChildren(child, index);
            }
          });
        }
        return index;
    };
    // 从1开始为每个含有imgUrl的元素添加索引
    let currentIndex = 1;
    addIndexToChildren(treeData[0], currentIndex);
    console.log('DraggableTree-------', treeData);
    return (
        <Review
            treeData={treeData}
            getNewTreeData={getNewTreeData}
            getCheckedId={getCheckedId}
            handleSelectId={handleSelectId}
            handleClick={handleClick}
            tips='123'
            treeHeight={900}
            otherWidth={130}
            isShowExplain={true}
            explainList={explainList}
            isShowExplainText={false}
            draggable={true}
            isEdit={true}
            explainHeight={29}
            insertNo={true}
            isDelete={false}
            nextShowId=''
            isShowJump={true}
            onAddLabel={onAddLabel}
        />
    )
};
