# canvas-excel

基于Canvas开发的Excle技术预研

[在线预览](https://bojue.github.io/canvas-excel)


![demo](https://user-images.githubusercontent.com/14350577/156909030-4816fa59-b44d-48e4-9bc2-b0f5cacbded9.PNG)


## 运行

```javaScript
git clone https://github.com/bojue/canvas-excel.git

npm install 

npm run dev //本地运行
 
npm run build //构建生产包

```

### 浏览器打开

```javaScript
http://localhost:4000/
```
### Excel单元格对象定义

```javaScript
ExcelDataItem = [
    [
        'colums',    // 列数
        'rows',      // 行数,
    ],     
    'txt', // 内容类型 txt|img|...
    'value', // 内容
    {
        'text':{
            'color':'#000',
            'fontStyle': 'normal' || 'italic',
            'fontFamily':'微软雅黑',
            'fontSize':10,
            'fontWeight': 'normal' || 'bold',
            'lineHeight':10,
            'textAlign': 'center' || 'right' || 'center',
        },
        'line':{
            'textLine':'underline' || 'normal'
        },
        'rect': {
            'fillStyle':"#fff"
        }
    }
]
```

> 待优化方案

1. 工具栏文字输入节流优化/局部映射渲染
2. 二分法判断单元格区域选择坐标
3. 双缓存处理区域选择交互


### 实现功能

#### 工具栏

- 设置属性工具栏
- 当前选中单元格属性映射到属性单元格（字体大小，样式，颜色，背景）
- Excel下标工具栏拖拽改变大小
- 工具栏输入内容映射Exacel当前单元格

#### 单元格

- 单元格文字属性设置
- 单元格文字左右边界处理
- 单元格选取
- 单元格输入
- 单元格合并/取消合并

#### 区域选择

- 区域选择
- 区域内容设置
- 按行,列选择单元格
- 合并单元格交互

### 优化方法

- 局部渲染
- 节流
- 减少绘制
- 拆分计算
- 对象缓存

[优化方案简单记录](https://github.com/bojue/canvas-excel/issues/5)

## TODO

- 单元格文字上下边界处理
- 局部渲染进一步优化
- X,Y页面滚动
- 单元格输入框光标位置（重构出来的bug）

## Doing

- 重构-excel组件化（Donging）
- 重构-引入状态管理 


目前组件化根据excel的功能布局拆分，多层级需要引入状态管理的内容


