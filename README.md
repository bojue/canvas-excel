# canvas-excel

基于Canvas开发的Excle技术预研

## DEMO

[在线预览](https://bojue.github.io/canvas-excel)

## 截图

![DEMO](https://github.com/bojue/canvas-excel/raw/master/src/assets/demo.PNG)

## 实现功能

- Excel数据结构定义(OK)
- Excel下标工具栏拖拽改变大小(OK)
- 单元格文字属性设置(OK)
- 单元格文字左右边界处理(OK)
- 单元格选取(OK)
- 单元格输入(OK)
- 单元格输入内容存储(OK)
- 区域选择(OK)
- 区域内容设置(OK)
- 合并单元格交互(OK)
- 工具栏输入内容映射Exacel当前单元格(OK)

## TODO

- 单元格文字上下边界处理
- 合并单元(仅完成交互,待完成状态存储，渲染，优化)
- 局部渲染进一步优化
- X,Y页面滚动

## 优化

- Canvas线条1px绘制模糊问题
- 高清屏幕画质模糊问题（Mac）
- 局部渲染/部分渲染
- 节流控制页面绘制
- 工具栏拖拽仅拖拽（dragend）结束绘制
- 缓存单元格左侧位置信息，减少计算过程
- 区域属性设置优化，当区域内所有对象的该属性未发生变化，则触发绘制（字段：hasChangeState）
- 初始化工具栏状态减少计算（字体粗细，字体样式，颜色没有通过遍历区域获取，仅根据右上角单元格属性初始化）

[具体优化Issues](https://github.com/bojue/canvas-excel/issues/1)


