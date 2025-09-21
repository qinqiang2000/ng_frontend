# 预览文件组件

```js

import Review from '@piaozone.com/draggable-tree';
export default function Test() {

    const treeData = [
        {
            title: 'TSBX-220923-1934', // 封面是封面编号，文件是类型+序号，如影像1
            id: '', // 唯一值
            beforeId: '', // 重新上传/替扫/补扫会导致id变化，这个值用于替换selectId
            imgUrl: '', // 图片地址
            compressUrl: '', // 缩略图地址，后端压缩后的图片地址
            docUrl: '', // 非图片类型文件的文件地址
            status: 1, // 上传状态 上传中1、解析中2、上传失败3、解析失败4、解析成功5、单据重复6、业务单据不存在7、未识别出二维码8、影像异常9、其他状态10、弱预警12、轻度警告21、重度警告22
            statusDes: '', // 上传状态对应文字
            fullStatusDes: '', // 完整的错误提示
            extName: 'jpg', // 文件类型，jpg，pdf，xls
            // type: 1, // 文件种类，纸票1，电票2
            fileType: 'invoice', // 文件分类invoice,attach,cover
            angle: 90, // 封面旋转角度
            displayFlag: 'showOther', // showOther 展示非图片类型的文件
            isMatch: '匹配成功',
            itemType: 'file', // 节点类型 coverNo封面 title标题 file文件
            billStatus: 1, // 单据状态 1待匹配 2新影响 3补扫 4重扫
            iconList: [''], // 发票标签静态资源列表
            attachTypeName: '', // 附件类型名字
            children: [ // 子集
                {
                    title: 'TSBX-220923-1934',
                    id: '',
                    imgUrl: '',
                    status: 1,
                    extName: 'jpg',
                }
            ]
        }
    ];

    // val: 新的treeData
    // type: changeOrder改变顺序；changeTitle改变单据编号；changeAngle改变旋转角度
    const getNewTreeData = (val, type) => {
        console.log(val, type, 'newTreeData')
    }
 
    const handleClick = (info) => {
        console.log(info, 'info')
    }

    const getCheckedId = (ids) => {
        console.log(ids, 'ids')
    }

    const handleSelectId = (id) => {
        console.log(id, 'selectedId')
    }

    const explainList = [
        '1、封面只能替换不能删除',
        '2、只有授权的用户才能操作影像删除',
        '3、签收匹配成功的发票不允许替换、删除',
        '4、补改上传的文件只做识别不做签收匹配'
    ]

    return (
        <Review
            treeData={treeData} // 数据源树
            getNewTreeData={getNewTreeData} // 树状结构改变的后回调
            getCheckedId={getCheckedId} // 获取已勾选的id
            handleSelectId={handleSelectId} // 获取选中的id
            handleClick={handleClick} // 状态后面按钮点击的回调
            tips='测试123' // 提示文字内容
            treeHeight={1000} // 内容的高度
            otherWidth={130} // 其他内容的宽度
            isShowExplain={true}
            explainList={explainList}
            isShowExplainText={false}
            draggable={true}
            isEdit={true}
            explainHeight={100}
            isDelete={false}
            nextShowId=''
        />
    )
}

Review.propTypes = {
    treeData: PropTypes.array, // 数据源
    getNewTreeData: PropTypes.func, // 回调函数，改变treeData
    getCheckedId: PropTypes.func, // 获取勾选上的ids
    handleClick: PropTypes.func, // 状态触发事件
    handleSelectId: PropTypes.func, // 获取选中的值的id
    tips: PropTypes.string, // 提示文字内容
    treeHeight: PropTypes.number, // 内容的高度
    otherWidth: PropTypes.number, // 其他内容的宽度
    isShowExplain: PropTypes.bool, // 是否展示说明文字
    isShowExplainText: PropTypes.bool, // 是否展示说明俩字
    explainList: PropTypes.array, // 说明文字
    draggable: PropTypes.bool, // 是否可以拖动
    isEdit: ProTypes.bool, // 是否可以编辑封面编号
    explainHeight: ProTypes.number, // 说明框的高度
    isDelete: PropTypes.bool, // 当前是否是根据删除更新treeData
    nextShowId: PropTypes.string // 删除勾选节点包括选中节点，删除成功后，显示下一个节点
};

```

