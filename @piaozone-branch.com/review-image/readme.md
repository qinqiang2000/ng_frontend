# 预览文件组件

```js

import ReviewImage from '@piaozone.com/review-image';
    const [visible, setVisible] = useState(true);

    const changeVisible = (value) => {
        setVisible(value);
    };

    const modeConfig = [
        {
            name: '封面', // 小标题
            key: 'cover', // 对应字段名
            sign: 'cover' // 标识
        },
        {
            name: '发票',
            key: 'invoice',
            sign: 'invoice'
        },
        {
            name: '附件',
            key: 'attachment',
            sign: 'attachment'
        }
    ];

    const modeKey = ['img', 'list', 'match'];

    const dataList = [
        {
            fscanBillNos, // 编号
            invoiceCount, // 发票数量
            attachmentCount, // 附件数量
            cover: [], // 封面列表
            attachment: [], // 附件列表
            invoice: [
                {
                    originalFileName: '', // 文件名称
                    rotationAngle: '', // 旋转角度
                    snapshotUrl: '', // 快照
                    invoiceFileType: 1, // 1 纸票 2电票 3其他
                    attachSerialNoList: [], // 关联附件
                    inputInvoices: [], // 混贴裁剪坐标数据
                    serialNo: '', // 文件唯一值
                    signType: 'invoice', // 文件种类 cover封面 invoice发票 attachment附件
                    extName: 'jpg', // 文件类型
                    ...需要展示的文件信息
                }
            ] 
        }
    ];

    const rotationAngleSet = (angle, page) => {
        console.log(angle, page);
    };

    const handleSelectedInfo = (info) => {
        console.log(info, 'info');
    };

    const showOriginFile = (selected) => {
        console.log(selected, 'selected');
    };

    <ReviewImage
        modeConfig={modeConfig}  // 树形结构的配置：name标题，key dataList取值字段，sign cover封面 invoice发票 attachment附件
        dataList={[dataList]}  // 数据源 每个文件带上signType类型，唯一值 serialNo
        modeKey={modeKey}  // 左侧展示的模式：img图片，list列表，match匹配模式
        visible={visible}  // 是否展示右侧文件信息栏
        changeVisible={changeVisible}  // 控制visible的值
        otherHeight={0}  // 页面已占据的高度
        setPageRotate={rotationAngleSet}  // 保存旋转角度
        handleSelectedInfo={handleSelectedInfo}  // 获取当前选中的文件信息
        showOriginFile={showOriginFile}  // 查看原文件的回调函数
        defaultModeKey='img' // 左侧模式默认值
        showCutImage={true} // 是否展示混贴图片
    />

```

