# 打印网页图片

`printData` 待打印图片地址数组，默认[]，传入数据触发打印。  
`printEnd` 打印结束后的回调，必须回调清空printData，否则一直弹出打印。  

## 更新日志
- 2021-05-10  
 1. 去除打印页面的页眉页脚。
- 2021-05-11  
 1. 处理多张图片打印,自动旋转横向图片。
- 2021-09-02
 1. 修复 `Object.assign`动态修改`readonly`的`transform`属性报错，导致页面无限循环渲染的问题。
 
## 安装
```bash
    # 安装到dependencies
    npm install @piaozone.com/print-image --registry=http://172.18.1.117:7001 -S
```

## 更新
```
    npm update @piaozone.com/print-image --registry=http://172.18.1.117:7001 -S
```