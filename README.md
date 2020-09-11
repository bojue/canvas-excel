# canvas-excel

基于Canvas开发的Excle技术预研

## DEMO

[在线预览](https://bojue.github.io/canvas-excel)

## 运行

```
git clone https://github.com/bojue/canvas-excel.git

npm install 

npm run dev //本地运行
 
npm run build //构建生产包

```

## 截图

![DEMO](https://github.com/bojue/canvas-excel/raw/master/src/assets/demo.PNG)

## 实现功能

#### 工具栏

- 设置属性工具栏
- 当前选中单元格属性映射到属性单元格（字体大小，样式，颜色，背景）
- Excel下标工具栏拖拽改变大小
- 工具栏输入内容映射Exacel当前单元格

##### 单元格

- 单元格文字属性设置
- 单元格文字左右边界处理
- 单元格选取
- 单元格输入

#### 区域选择

- 区域选择
- 区域内容设置
- 按行,列选择单元格
- 合并单元格交互

## 优化方法

- 局部渲染
- 节流
- 减少绘制
- 拆分计算
- 对象缓存

[优化方案简单记录](https://github.com/bojue/canvas-excel/issues/5)

## TODO

- 单元格文字上下边界处理
- 合并单元(仅完成交互,待完成状态存储，渲染，优化)
- 局部渲染进一步优化
- X,Y页面滚动
- 单元格输入框光标位置（重构出来的bug）




