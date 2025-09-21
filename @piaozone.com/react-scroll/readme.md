# 滚动组件

## Login
```
$ cnpm login --registry=http://172.18.1.117:7001 --scope=@piaozone.com  --always-auth
```

## 安装
```
$ npm install @piaozone.com/react-scroll --registry=http://172.18.1.117:7001
//或者
$ cnpm install @piaozone.com/react-scroll --registry=http://172.18.1.117:7001
```


## 

```js
import Scroll from '@piaozone.com/react-scroll';

<Scroll
    height={510}
    ref="listScroll"
    showHBar={true}
    content={this.createInvoiceList()}
/>

// height 必须有一个固定值
// ref 可以使用 this.refs.listScroll获得Scroll引用，然后可以调用对应的方法，
// 组件方法freshHeight可以刷新内容高度变化
// showHBar 是否始终显示滚动条,false时只有鼠标放到滚动区域时有滚动条时才显示
// content 为滚动区域的内容

```

## License

MIT
