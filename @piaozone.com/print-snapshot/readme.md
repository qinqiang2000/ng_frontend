# 打印网页图片

`printData` 待打印图片地址数组，默认[]，传入数据触发打印。
`printEnd` 打印结束后的回调，必须回调清空printData，否则一直弹出打印。

## 更新日志
- 2025-03-10
 1. 去除打印页面的页眉页脚。
 2. 处理多张图片打印,自动旋转横向图片。
## 安装
```bash
    # 安装到dependencies
    npm install @piaozone.com/print-snapshot- --registry=http://172.18.1.117:7001 -S
```

## 更新
```
    npm update @piaozone.com/print-snapshot --registry=http://172.18.1.117:7001 -S
```