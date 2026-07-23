import * as React from 'react';
import "./../style/sheet-setting.scss";
import "./../style/sheet-editor-bar.scss";
import "./../style/sheet-content.scss";
import * as REQ_IMG from './../resources/import-for-imgs';
import { excelObjectModel } from "../models/excel-object";
import { excelStateModel } from '../models/excel-state';
import { excelItemModel } from '../models/excel-item';
import { excelDataModel } from '../models/excel-data';

//service
import { drawMergeText, drawText} from '../service/excel-draw-text';
import { initExcelCanvas } from '../service/excel-draw-canvas-init';
import { saveToLocal, loadFromLocal, exportToFile, importFromFile, exportToCSV } from '../service/excel-persistence';
import { HistoryManager } from '../service/excel-history';
import { copyRegion, pasteToRegion, getClipboard } from '../service/excel-clipboard';
import { insertRow, deleteRow, insertColumn, deleteColumn } from '../service/excel-rowcol';
import { clampScroll, normalizeViewport, toLogicalX, toLogicalY, getFrozenX, getFrozenY } from '../service/excel-viewport';

//data
import { txtCols, rectFillStylesCols, txtSizes} from '../models/excle-setting-data';
import SheetEditorBarComponent from './sheet-edior-bar/sheet-editor-bar';
import SheetSettingAreaComponent from './sheet-setting-area/sheet-function-area';


declare global { interface Window { 
    webkitDevicePixelRatio:any,
    mozDevicePixelRatio:any
}}

export interface Txt {
    v:string;
    x:number;
    y:number;
}

class Excel extends React.Component<any, any>  {
    excelRef:any;
    clientRect:DOMRect;
    excelData:any; // excel数据源
    excelObject:any; // excel设置设置信息
    currentLabelDOMRef:any;
    inputRef:any;
    editorRef:any;
    importInputRef:any;
    history:HistoryManager;
    cutSourceRange:any; // 剪切时记录的源区域，粘贴后清空
    txtSizes:any[];
    dpr:number;
    viewHeight:number; // 视口高度(自适应)
    
    constructor(props:any) {
        super(props);
        this.initData();
    }

    initData() {
        this.excelRef = React.createRef();
        this.editorRef = React.createRef();
        this.currentLabelDOMRef = React.createRef();
        this.inputRef = React.createRef();
        this.importInputRef = React.createRef();
        this.history = new HistoryManager(50);
        this.state = excelStateModel;
        this.excelObject = excelObjectModel;
        this.excelObject.viewport = normalizeViewport(this.excelObject.viewport);
        // 归一化视口(兼容旧存档无 viewport 字段)
        this.excelObject.viewport = normalizeViewport(this.excelObject.viewport);
        this.excelData = excelDataModel;
        this.txtSizes = txtSizes;
    }
    
    componentDidMount() {
        this.calculateViewHeight();
        this.initCanvasDOM();
        this.getExcelCanvas();
        this.drawBorder();
        this.addLister();
        this.initExcelContent();
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    calculateViewHeight = () => {
        // 计算视口高度：窗口高度 - 顶部工具栏(编辑栏约53px) - 留白
        const toolbarHeight = 53; // 编辑栏高度
        const margin = 20; // 底部留白
        this.viewHeight = Math.max(300, window.innerHeight - toolbarHeight - margin);
    }

    handleResize = () => {
        this.calculateViewHeight();
        this.updateCanvasSize();
        this.reDrawCanvas();
        this.reDrawSelectArea();
    }

    updateCanvasSize() {
        let ctx = this.context;
        let dpr = this.dpr;
        let w = 1400;
        let h = this.viewHeight;
        this.excelRef.width = Math.round(w * dpr);
        this.excelRef.height = Math.round(h * dpr);
        this.excelRef.style.width = w + 'px';
        this.excelRef.style.height = h + 'px';
        ctx.scale(dpr, dpr);
        this.getExcelCanvas();
    }

    initCanvasDOM() {
        let ctx = this.context
        let dpr = window.devicePixelRatio || window.webkitDevicePixelRatio || window.mozDevicePixelRatio || 1;
        this.dpr = dpr;
        let w = 1400;
        let h = this.viewHeight;
        this.excelRef.width = Math.round(w * dpr);
        this.excelRef.height = Math.round(h * dpr);
        this.excelRef.style.width = w + 'px';
        this.excelRef.style.height = h + 'px';
        ctx.scale(dpr, dpr);
    }

    getExcelCanvas() {
        this.clientRect = this.excelRef.getBoundingClientRect();
    }

    drawBorder() {
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let startLeft = def.columTitleDefWidth;
        const ctx = this.context;
        ctx.beginPath();
        // 绘制矩形
        ctx.fillStyle = "#E6e6e6";
        ctx.fillRect(0.5, 0.5, def.columTitleDefWidth + 0.5, def.rowTitleHeight  + 0.5);
        
        // 绘制三角形
        ctx.strokeStyle = "#b2b2b2";
        ctx.beginPath();
        ctx.moveTo(11 ,23 );
        ctx.lineTo(27 , 23 )
        ctx.lineTo(27 , 7 );
        ctx.lineTo(11 , 23 );
        ctx.fillStyle = "#b4b4b4";
        ctx.fill();
   
        // 绘制边框
        ctx.beginPath();
        ctx.moveTo(def.columTitleDefWidth  + 0.5, 0  );
        ctx.lineTo(def.columTitleDefWidth  + 0.5, def.rowTitleHeight  );
        ctx.beginPath();
        ctx.moveTo(def.columTitleDefWidth  + 0.5, 0  );
        ctx.lineTo(def.columTitleDefWidth  + 0.5, def.rowTitleHeight  );
        ctx.strokeStyle = '#bcbcbc';
        ctx.stroke();

        // 绘制上侧统计列工具栏
        for(let i=0;i<setting.column.length;i++) {
            let colLeft = startLeft + 0.5;
            let rowTop = 0.5;

            //绘制边框
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#b2b2b2";
            ctx.rect(colLeft, rowTop - 0.5, setting.column[i] , def.rowTitleHeight );
            
            //绘制矩形
            ctx.fillStyle = "#E6e6e6";
            ctx.fillRect(colLeft + 0.5, rowTop, setting.column[i] ,  def.rowTitleHeight ) ;
            
            //绘制文本
            ctx.fillStyle = '#000';
            let size = 10 ;
            ctx.font = 'lighter '+size+'pt  微软雅黑';
            ctx.textAlign = "center";
            ctx.textBaseline = 'bottom';
            ctx.fillText(String.fromCharCode((65 + i)),  startLeft  + setting.column[i] /2 , def.rowTitleHeight - 3.5 );

            //绘制右边框
            ctx.beginPath();
            ctx.moveTo(colLeft +setting.column[i] , 0  );
            ctx.lineTo(colLeft +setting.column[i] ,  def.rowTitleHeight );
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#b9b9b9';
            ctx.stroke();
            startLeft += setting.column[i];
            if( i === setting.column.length -1 || startLeft > 1400) {
                this.excelObject.info.width = startLeft ;
            }
            if(startLeft > 1400) {
                break;
            }
        }

     
        for(let c = 0;startLeft>=0;c++) {
            let w =  setting.column[c];
            startLeft -= w;
            this.excelObject.setting_custome.columnLefts[c] = c === 0 ? w +  def.columTitleDefWidth: this.excelObject.setting_custome.columnLefts[c-1] + w ;   
            if(startLeft < 0) {
                this.excelObject.setting_custome.columnLefts.length = c + 1;
            }       
        }
        // 获取Excel高度
        let startHeight = def.rowTitleHeight;
        let _h = startHeight + 0.5;

        // 绘制左侧统计行工具栏
        for(let i=0;i<setting.row.length;i++) {
            let colLeft = 0.5;
            let rowTop = startHeight  + 0.5;

            // 绘制矩形
            ctx.fillStyle = "#E6e6e6";
            ctx.fillRect(colLeft, rowTop,  def.columTitleDefWidth, setting.row[i]);

            // 绘制文字
            let size = 10 ;
            ctx.fillStyle = '#000';
            ctx.font = 'lighter '+size+'pt  微软雅黑';
            ctx.textAlign = "center";
            let val =  1+i;
            ctx.textBaseline = 'bottom';

            // 绘制底部边框
            ctx.beginPath();
            ctx.moveTo(0, rowTop  );
            ctx.lineTo( def.columTitleDefWidth, rowTop);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#bcbcbc';
            ctx.textBaseline = "middle";
            ctx.fillText(val++, def.columTitleDefWidth /2, rowTop + setting.row[i]  / 2);
            ctx.stroke();
            startHeight += setting.row[i];
            if( i === setting.row.length -1 || startHeight > this.viewHeight) {
                this.excelObject.info.height = startHeight ;
            }

            if(startHeight > this.viewHeight) {
                break;
            }
        }
        for(let r = 0;startHeight>=0;r++) {
            let h =  setting.row[r];
            startHeight -= h;
            this.excelObject.setting_custome.rowTops[r] = r === 0 ? 
            h +  def.rowTitleHeight : 
                this.excelObject.setting_custome.rowTops[r-1] + h ;   
            if(startHeight < 0) {
                this.excelObject.setting_custome.rowTops.length = r + 1;
            }       
        }
        ctx.stroke();
    }

    
    initExcelContent() {
        initExcelCanvas(this.context, this.excelObject, this.excelData, excelItemModel, this.viewHeight);
    }

    updateExcelCanvas() {
        const ctx = this.context;
        ctx.beginPath();
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let rows = setting.row;
        let colums = setting.column;
        let lefs = setting.columnLefts;
        let tops = setting.rowTops;
        let rLen = rows.length;
        let cLen = colums.length;
        let currentTop = def.rowTitleHeight;
        let currentLeft = def.columTitleDefWidth;
        let str = "";
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#ccc";
        for(let row = 0;row <rLen && currentTop <= this.viewHeight;row++) {
            let height = rows[row];
            currentLeft = def.columTitleDefWidth;
            for(let col=0;col < cLen && currentLeft <= 1400;col++) {
                let width = colums[col];
                let item = this.excelData[row] && this.excelData[row][col];
                if(!item) {
                    continue;
                };
                let w_count = item[0][0];
                let h_count = item[0][1];
                if(w_count === 0 || h_count === 0) {
                    continue;
                }
                let w = width;
                let h = height;
                str = item[2];
                currentLeft = lefs[col] - colums[col];
                if(w_count> 1 || h_count > 1) { 
                    w =  lefs[col + w_count] - lefs[col];
                    h = 0;
                    for(let c=0; c < h_count;c++) {
                        h += rows[c+ row] ;
                    }
                    ctx.rect(currentLeft +0.5 , currentTop  + 0.5, w, h);
                    ctx.fillStyle = this.excelData[row][col][3]['rect']['fillStyle']
                    ctx.fillRect(currentLeft , currentTop, w, h);
                    if(str !== '' && str !== null) {
                        drawText(ctx, item, col, row, str, currentLeft, currentTop, h, w);
                    }
                    currentLeft += w;
                    
                } else if(w_count === 1 && h_count === 1){
                    ctx.rect(currentLeft  +0.5 , currentTop  + 0.5, w, h);
                    ctx.fillStyle = this.excelData[row][col][3]['rect']['fillStyle']
                    ctx.fillRect(currentLeft , currentTop, w, h);
                    if(str !== '' && str !== null) {
                        drawText(ctx, item, col, row, str, currentLeft, currentTop, h, w);
                    }
                }
            }
            currentTop += height;
        }
        ctx.restore();
        ctx.stroke();
    }

    getCurrentLeft(col:number) {
        let setting = this.excelObject.setting_custome;
        let colums = setting.columnLefts;
        let val = colums[col];
        return val;

    }

    addLister() {
        window.addEventListener('resize', ()=> {
            this.getExcelCanvas();
        })
        // 键盘快捷键：撤销/重做/复制/剪切/粘贴/删除/导航
        document.addEventListener('keydown', (e:KeyboardEvent) => {
            const editing = this.state.editor_display === 'block';
            const key = e.key.toLowerCase();
            const mod = e.ctrlKey || e.metaKey;

            // 编辑单元格中：仅处理 Enter 提交、Esc 取消，其余交给浏览器
            if(editing) {
                if(key === 'enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.commitEditAndMove('down');
                } else if(key === 'escape') {
                    e.preventDefault();
                    this.cancelEdit();
                } else if(key === 'tab') {
                    e.preventDefault();
                    this.commitEditAndMove(e.shiftKey ? 'left' : 'right');
                }
                return;
            }

            // ---- 非编辑状态 ----

            // 方向键导航（支持 Shift 扩展选区）
            if(['arrowup','arrowdown','arrowleft','arrowright'].indexOf(key) > -1) {
                e.preventDefault();
                const dirMap:any = { arrowup:'up', arrowdown:'down', arrowleft:'left', arrowright:'right' };
                this.moveSelection(dirMap[key], e.shiftKey);
                return;
            }

            // Enter 进入编辑；Tab 横向移动
            if(!mod && key === 'enter') {
                e.preventDefault();
                this.enterEditCurrentCell();
                return;
            }
            if(!mod && key === 'tab') {
                e.preventDefault();
                this.moveSelection(e.shiftKey ? 'left' : 'right');
                return;
            }

            // Delete / Backspace 清空选区内容
            if(!mod && (key === 'delete' || key === 'backspace')) {
                e.preventDefault();
                this.clearSelection();
                return;
            }

            if(!mod) return;

            if(key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            } else if((key === 'z' && e.shiftKey) || key === 'y') {
                e.preventDefault();
                this.redo();
            } else if(key === 'c') {
                e.preventDefault();
                this.copy();
            } else if(key === 'x') {
                e.preventDefault();
                this.cut();
            } else if(key === 'v') {
                e.preventDefault();
                this.paste();
            }
        })
        document.addEventListener("mousemove", (e:MouseEvent)=>{
            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            let tit_h = this.excelObject.setting_def.rowTitleHeight;
            let tit_w = this.excelObject.setting_def.columTitleDefWidth;
            if((_eX < 0 ||  _eY < 0 ) &&  e.buttons === 0 ) {
                this.setState({
                    change_size_current_index:-1
                })
            }
        })
        const ctx = this.excelRef;
        ctx.addEventListener('dblclick', (e:MouseEvent)=> {
            let def = this.excelObject.setting_def;
            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            if(def.columTitleDefWidth <= _eX && _eX <= 1400 && 0<= _eY && _eY <def.rowTitleHeight || 
            0 <= _eX && _eX < def.columTitleDefWidth && def.rowTitleHeight < _eY && _eY <= this.viewHeight ) {
                return;
            }
            this.updateEditorDOM(_eX, _eY);
            this.initSelection();
            this.editorRef.current.setAttribute("contenteditable", "true");
            this.editorRef.current.focus();
        }); 
        ctx.addEventListener('click', (e:MouseEvent)=> {
            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            this.updateSelectArea(_eX, _eY);
        }); 
        ctx.addEventListener('mousemove', (e:MouseEvent)=> {
            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            let tit_h = this.excelObject.setting_def.rowTitleHeight;
            let tit_w = this.excelObject.setting_def.columTitleDefWidth;
            let change_type = 'init';
            if(tit_h < _eY && tit_w >= _eX) {
                change_type = 'h';
            }else if(tit_w < _eX && tit_h >= _eY) {
                change_type = 'w';
            }else if(tit_h < _eY && tit_w < _eX ){
                change_type = 'sel_area';
                this.setState({
                    change_size_current_index:-1,
                })
            }
   
            if(e.buttons === 1 && change_type === 'sel_area') {
                this.setState({
                    mouse_state:'m_move',
                    mouse_event_type: change_type,
                })
                this.updateChangeSizeButton(_eX, _eY, e);
            }else if(['w', 'h'].indexOf(change_type) > -1){
                this.setState({
                    mouse_state:'m_move',
                    mouse_event_type: change_type
                })
                this.changeSizeByDrag(_eX, _eY);
            }
        }); 
        ctx.addEventListener('mousedown', (e:MouseEvent)=> {
            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            this.setState({
                regional_sel_x:_eX ,
                regional_sel_y:_eY ,
                regional_sel_state: 1,
                mouse_state:'m_down'
            })
        }); 
        ctx.addEventListener('mouseup', (e:MouseEvent)=> {
            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            this.setState({
                mouse_state:'m_up',
                mouse_event_type:'init',
                change_size_current_index:-1,
            })
        });
        // 右键上下文菜单
        ctx.addEventListener('contextmenu', (e:MouseEvent)=> {
            e.preventDefault();
            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            this.openContextMenu(_eX, _eY);
        });
        // 点击任意处关闭菜单
        document.addEventListener('mousedown', (e:MouseEvent)=> {
            if(this.state.context_menu_display === 'block') {
                let target = e.target as HTMLElement;
                if(!target.closest || !target.closest('.context-menu')) {
                    this.closeContextMenu();
                }
            }
        });
        // 滚轮滚动
        ctx.addEventListener('wheel', (e:WheelEvent)=> {
            e.preventDefault();
            let vp = this.excelObject.viewport;
            let def = this.excelObject.setting_def;
            let setting = this.excelObject.setting_custome;
            // shift+滚轮 或 deltaX 为横向滚动
            if(e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                vp.scrollLeft = (vp.scrollLeft || 0) + (e.deltaX || e.deltaY);
            } else {
                vp.scrollTop = (vp.scrollTop || 0) + e.deltaY;
            }
            clampScroll(vp, setting, def);
            // 滚动时收起编辑框(MVP)
            if(this.state.editor_display !== 'none') {
                this.setState({ editor_display: 'none' });
        // 滚轮滚动
        ctx.addEventListener('wheel', (e:WheelEvent)=> {
            e.preventDefault();
            let vp = this.excelObject.viewport;
            let def = this.excelObject.setting_def;
            let setting = this.excelObject.setting_custome;
            if(e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                vp.scrollLeft = (vp.scrollLeft || 0) + (e.deltaX || e.deltaY);
            } else {
                vp.scrollTop = (vp.scrollTop || 0) + e.deltaY;
            }
            clampScroll(vp, setting, def);
            if(this.state.editor_display !== 'none') {
                this.setState({ editor_display: 'none' });
            }
            this.reDrawCanvas();
            this.reDrawSelectArea();
        });
            }
            this.reDrawCanvas();
            this.reDrawSelectArea();
        });
    }

    // 将画布坐标命中到行列下标
    hitTestCell(_eX:number, _eY:number):{row:number, col:number} | null {
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        if(_eX < def.columTitleDefWidth || _eY < def.rowTitleHeight) return null;
        let colums = setting.column;
        let rows = setting.row;
        let col = -1, row = -1;
        let cl = def.columTitleDefWidth;
        for(let c=0;c<colums.length;c++) {
            if(_eX >= cl && _eX < cl + colums[c]) { col = c; break; }
            cl += colums[c];
        }
        let ct = def.rowTitleHeight;
        for(let r=0;r<rows.length;r++) {
            if(_eY >= ct && _eY < ct + rows[r]) { row = r; break; }
            ct += rows[r];
        }
        if(row === -1 || col === -1) return null;
        return { row, col };
    }

    openContextMenu(_eX:number, _eY:number) {
        let hit = this.hitTestCell(_eX, _eY);
        if(!hit) { this.closeContextMenu(); return; }
        // 若右键位置不在当前选区内，则把选区移到该单元格
        const range = this.getSelectionRange();
        const inSel = range && hit.row >= range.rowStart && hit.row <= range.rowEnd
            && hit.col >= range.colStart && hit.col <= range.colEnd;
        if(!inSel) {
            this.setSelectionCell(hit.row, hit.col);
        }
        this.setState({
            context_menu_display:'block',
            context_menu_left:_eX,
            context_menu_top:_eY,
            context_menu_row:hit.row,
            context_menu_col:hit.col,
        });
    }

    closeContextMenu = () => {
        if(this.state.context_menu_display !== 'none') {
            this.setState({ context_menu_display:'none' });
        }
    }

    dragChangeSize(e:any) {
        if(e.buttons !== 1 && e.type !== 'dragend') {
            return;
        }
        let m_type =  e.type !== 'dragend' ?
            e.type !== 'dragstart' ?'m_drag' :'m_dragstart':'m_dragend'
        let _eX = e.clientX - this.clientRect.x;
        let _eY = e.clientY - this.clientRect.y;
        if(this.state.change_size_l === _eX && this.state.change_size_t === _eY) {
            return;
        }
        if(['drag','dragstart','dragend'].indexOf(e.type) > -1) {
            let dragIcon = document.createElement('img');
            let url = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            dragIcon.src = url;
            dragIcon.width = 0;
            dragIcon.height = 0;
            e.dataTransfer &&  e.dataTransfer.setDragImage(dragIcon,0, 0);
        }
        this.setState({
            mouse_state:m_type
        })
        if(e.type === 'dragend') {
            this.reDrawByDragEnd(_eX, _eY);
        }else {
            let [x, y] = this.state.change_size_by_drag_throttling_params;
            if(x === _eX && y === _eY) {
                return;
            }else {
                this.setState({
                    change_size_by_drag_throttling_params: [_eX, _eY]
                })
                this.changeSizeByDrag(_eX, _eY);
            }
        
        }
    }

    changeSizeByDrag(_eX:number, _eY:number){
        let current_index = ['m_drag', 'm_dragend'].indexOf(this.state.mouse_state) > -1 && 
                            this.state.change_size_current_index > -1 ?  this.state.change_size_current_index : null;
        let change_type = this.state.mouse_event_type;
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let index = -1;
        if(change_type === 'w') {
            index = current_index || this.excelObject.setting_custome.columnLefts.indexOf(_eX - ( this.dpr === 1 ? 0: 0.5)) ;
        }else if(change_type === 'h') {
            index = current_index || this.excelObject.setting_custome.rowTops.indexOf(_eY - ( this.dpr === 1 ? 0 : 0))
        }
        if(index > -1) {
            if(change_type === 'w') {
                let _left = this.excelObject.setting_custome.columnLefts[this.state.change_size_current_index -1] || this.excelObject.setting_def.columTitleDefWidth;
                let _width = Math.max(_eX - _left, 2);
                setting.column[this.state.change_size_current_index]  = parseInt(Math.max(_eX - _left, 2) + '')
                this.setState({
                    change_size_w:1,
                    change_size_h:this.viewHeight,
                    change_size_l:_eX,
                    change_size_top:0,
                    change_size_title_l:-2,
                    change_size_title_t: 0,
                    change_size_title_w: 4,
                    change_size_title_h: def.rowTitleHeight,
                    change_size_current_index:index,
                    currentLabel_val:_width,
                    currentLabel_top:  (-22 ) + 'px',
                    currentLabel_left: _eX + 'px',
                    change_size_left:_eX,
                    change_size_display:'block',
                    changeSizeState:'change_size_w',
                })
            }else {
                let _top = this.excelObject.setting_custome.rowTops[this.state.change_size_current_index -1] || this.excelObject.setting_def.rowTitleHeight ;
                let _height = Math.max(_eY - _top, 2);
                this.setState({
                    change_size_h: 1,
                    change_size_w: 1400,
                    change_size_l: _eX,
                    change_size_title_l:0,
                    change_size_title_t: -2 ,
                    change_size_title_w: this.excelObject.setting_def.columTitleDefWidth,
                    change_size_title_h:  4,
                    change_size_current_index:index,
                    currentLabel_val:_height,
                    currentLabel_top:_top ,
                    currentLabel_left: this.excelObject.setting_def.columTitleDefWidth,
                    change_size_top: _eY,
                    change_size_left:0,
                    change_size_display:'block',
                    changeSizeState:'change_size_h',
                })
      
            }
        }
    }

    reDrawByDragEnd(_eX:number, _eY:number) {
        let def = this.excelObject.setting_def;
        let change_type = this.state.mouse_event_type;
        let setting = this.excelObject.setting_custome;
        if(change_type === 'w') { 
            let _left = setting.columnLefts[this.state.change_size_current_index -1] || this.excelObject.setting_def.columTitleDefWidth;
            setting.column[this.state.change_size_current_index]  = parseInt(Math.max(_eX - _left, 2)+"")
            this.setState({
                change_size_w:1,
                change_size_h:500,
                change_size_top:0,
                change_size_title_l:-2 ,
                change_size_title_t: 0,
                change_size_title_w: 4,
                change_size_title_h: def.rowTitleHeight,
                mouse_state:'m_up'
            })
        }else {
            this.setState({
                change_size_top: _eY,
                change_size_h: 1,
                change_size_w: 1400,
                change_size_l:_eX,
                change_size_title_l:0,
                change_size_title_t: -2 ,
                change_size_title_w: def.columTitleDefWidth,
                change_size_title_h:  4,
                mouse_state:'m_up',
            })
            let _top = setting.rowTops[this.state.change_size_current_index -1] || this.excelObject.setting_def.rowTitleHeight
            setting.row[this.state.change_size_current_index]  = Math.max(_eY - _top,2);
        }
        this.reDrawCanvas();
        this.reDrawSelectArea();
        if(this.state.editor_display === 'block') {
            // this.updateEditorDOM(_eX, _eY, 'changeSize');
        } 
    }

    initSelection() {
        this.setState({
            regional_sel_state: 0,
            regional_sel_by_click_state:0,
            regional_sel_l:0,
            regional_sel_t:0,
            regional_sel_w:0,
            regional_sel_h:0, 
            regional_cantch_before:[0,0]
        })
    }
    // 区域选择
    regionalSelection(left:number, top:number){
        this.updateSelectArea(left, top);
    }

    initChangeSizeState() {
        this.setState({
            change_size_display:'none'
        })
    }

    clearFullRect() {
        this.context.clearRect(0, 0,this.excelObject.info.scalingRatio * 1400, this.excelObject.info.scalingRatio* this.viewHeight );
    }

    reDrawCanvas() {
        this.initChangeSizeState();
        this.clearFullRect();
        this.drawBorder();
        // 双缓存优化
        this.updateExcelCanvas();
    }

    reDragSelAreaByTitle(ind?:number, w?:number) {
        let index = ind === 0 ? 0 : ind || this.state.sel_area_by_title_index;
        let width = w || this.state.sel_area_by_title_width;
        this.setState({
            editor_display:'none',
        })
        let ctx = this.context;
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let left = setting.columnLefts[index-1] || def.columTitleDefWidth;
        let top = setting.rowTops[index -1] || def.rowTitleHeight;
        ctx.fillStyle = '#ccc';
        ctx.font = 'bold '+(11)+'pt  微软雅黑';
        ctx.textAlign = "center";
        ctx.textBaseline = 'bottom';
        if(this.state.regional_sel_by_title_state === 'x') {
            ctx.fillRect(
                left  + 0.5, 
                 1, 
                ( width- 0.5) ,
                (def.rowTitleHeight- 0.5) );
            ctx.fillStyle = '#000';
            ctx.fillText(String.fromCharCode((65 + index)),  left + setting.column[index] /2 , def.rowTitleHeight  - 3.5 );
        }else if(this.state.regional_sel_by_title_state === 'y') {
            ctx.fillRect(
                0, 
                top +0.5, 
                (def.columTitleDefWidth- 0.5) ,
                (setting.rowTops[index] - top - 0.5) );
            ctx.fillStyle = '#000';
            ctx.textBaseline = "middle";
            let val = index+1;
            ctx.fillText(val, def.columTitleDefWidth /2,top + setting.row[index]  /2);
        }
        ctx.stroke();

    }
    // 更新区域选择
    updateSelectArea(left:number, top:number){
        const ctx = this.context;
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let rows = setting.row;
        let colums = setting.column;
        let rLen = rows.length;
        let cLen = colums.length;
        let currentLeft = def.columTitleDefWidth;
        let currentTop = def.rowTitleHeight;
        // 如果当前选中区域输入状态，区域则不可以选中
        if(this.state.regional_sel_state === 0) {
            return;
        }
        if(def.columTitleDefWidth <= left && left <= 1400 && 0<= top && top <def.rowTitleHeight ) {
            let _cl = def.columTitleDefWidth;
            for(let col=0;col< cLen;col++) {
                let _w = colums[col];
                if(_cl <= left && left <= _cl + _w) {
                    if(this.state.regional_sel_by_title_state !== 'x' || this.state.regional_sel_by_title_index !== col) {
                        this.setState({
                            regional_sel_by_title_state: 'x',
                            regional_sel_by_title_index: col,
                            regional_sel_by_title_width: _w
                        });
                        let _colList = this.excelData && this.excelData;
                        let len = _colList && Array.isArray(_colList) && _colList.length;
                        if(!!len) {
                            this.setState({
                                regional_sel_begin:[0, col],
                                regional_sel_start:[0,col],
                                regional_sel_end:[len-1, col],
                            })
                            this.reDrawCanvas();
                            this.reDrawSelectAreaByTitle();
                            this.reDragSelAreaByTitle(col, _w);
                        }
                    }
                    break;
                }
                _cl += _w;
            
            }
        }else if(0 <= left && left < def.columTitleDefWidth && def.rowTitleHeight < top && top <= this.viewHeight){
            let _cr = def.rowTitleHeight;
            for(let row =0;row< rLen;row++) {
                let _h = rows[row];
                if(_cr <= top && top <= _cr + _h) {
                    this.setState({
                        regional_sel_by_title_state: 'y',
                        regional_sel_by_title_index: row,
                        regional_sel_by_title_width: _h
                    })
                    let len = this.excelData && Array.isArray(this.excelData) && this.excelData[0] && this.excelData[0].length;
                    if(!!len) {
                        this.setState({
                            regional_sel_begin:[row, 0],
                            regional_sel_start:[row,0],
                            regional_sel_end:[row,len-1],
                        })
                        this.reDrawCanvas();
                        this.reDrawSelectArea();
                        this.reDragSelAreaByTitle(row, _h);
                    }
                    break;
                }
                _cr += _h;
            
            }
        }else if(def.columTitleDefWidth<= left && left <= 1400 && def.rowTitleHeight < top && top <= this.viewHeight){
            for(let col=0;col< rLen;col++) {
                let height = rows[col] ;
                currentTop = col > 0 ? setting.rowTops[col -1] : def.rowTitleHeight;
                for(let row = 0;row < cLen;row++) {
                    let width = colums[row]  ;
                    currentLeft = row > 0 ? setting.columnLefts[row -1] : def.columTitleDefWidth;
                    if(currentTop < top && (currentTop + height) >= top && currentLeft < left && (currentLeft + width) >= left) {
                        // 缓存焦点优化绘制
                        if(this.state.regional_sel_state === 2 && this.state.regional_cantch_before[0] === currentLeft && this.state.regional_cantch_before[1] === currentTop) {
                            return;
                        }else if(this.state.regional_sel_state === 2) {
                            this.setState({
                                regional_cantch_before:[currentLeft, currentTop]
                            })
                        }
                        if(this.state.regional_sel_state === 1) {
                            this.setState({
                                // 输入框状态复位
                                editor_width:0,
                                editor_height:0,
                                editor_top:0,
                                editor_left:0,
                                editor_text:"",
                                editor_display:'none',
                                // 选中区域定位
                                regional_sel_start:[col, row],
                                regional_sel_end:[col, row],
                                regional_sel_begin:[col, row],
                                regional_sel_l:currentLeft,
                                regional_sel_t:currentTop,
                                regional_sel_state:2,
                                regional_sel_by_click_state:1,
                                regional_cantch_before:[currentLeft, currentTop],
                            })
                        }else {
                            this.setState({
                                regional_sel_end:[col,row],
                                regional_sel_by_title_state: null,
                                regional_sel_by_title_index: null,
                                regional_sel_by_title_width: null
                            });
                        }
                        //绘制矩形
                        this.reDrawCanvas();
                        //绘制选中区域
                        this.reDrawSelectArea();
                    }else {
               
                    }
                }


            }

            for(let row = 0;row < cLen;row++) {
                currentTop = def.rowTitleHeight;
                let width = colums[row]  ;
                for(let col=0;col< rLen;col++) {
                    let height = rows[col] ;
                    currentTop = col > 0 ? setting.rowTops[col -1] : def.rowTitleHeight;
                    currentLeft = row > 0 ? setting.columnLefts[row -1] : def.columTitleDefWidth;
                    if(currentTop < top && (currentTop + height) >= top && currentLeft < left && (currentLeft + width) >= left) {
                        // 缓存焦点优化绘制
                        if(this.state.regional_sel_state === 2 && this.state.regional_cantch_before[0] === currentLeft && this.state.regional_cantch_before[1] === currentTop) {
                            return;
                        }else if(this.state.regional_sel_state === 2) {
                            this.setState({
                                regional_cantch_before:[currentLeft, currentTop]
                            })
                        }
                        if(this.state.regional_sel_state === 1) {
                            this.setState({
                                // 输入框状态复位
                                editor_width:0,
                                editor_height:0,
                                editor_top:0,
                                editor_left:0,
                                editor_text:"",
                                editor_display:'none',
                                // 选中区域定位
                                regional_sel_start:[col, row],
                                regional_sel_end:[col, row],
                                regional_sel_l:currentLeft,
                                regional_sel_t:currentTop,
                                regional_sel_state:2,
                                regional_sel_by_click_state:1,
                                regional_cantch_before:[currentLeft, currentTop],
                            })
                        }else {
                            this.setState({
                                regional_sel_end:[col,row],
                                regional_sel_by_title_state: null,
                                regional_sel_by_title_index: null,
                                regional_sel_by_title_width: null
                            });

                        }
                        //绘制矩形
                        this.reDrawCanvas();
                        //绘制选中区域
                        this.reDrawSelectArea();
                    }else {
               
                    }
                }
            } 
        }
    }

    // 重新绘制区域选择
    reDrawSelectAreaByTitle() {
        const ctx = this.context;
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;

        let _start = this.state.regional_sel_start;
        let _end = this.state.regional_sel_end;  
        ctx.beginPath();
       
        // 鼠标选中从右向左选中
        let col_start = Math.min(_start[1],_end[1]);
        let col_end = Math.max(_start[1], _end[1]);
        let _l= col_start > 0 ? setting.columnLefts[col_start -1] :  def.columTitleDefWidth;
        let _w = (setting.columnLefts.length === (col_end + 1) ) ? 
        col_start === 0 ?
        setting.columnLefts[ setting.columnLefts.length-1] -  def.columTitleDefWidth :
        setting.columnLefts[ setting.columnLefts.length -1] - setting.columnLefts[col_start -1 ] :
        setting.columnLefts[Math.min(col_end, setting.columnLefts.length -1)] - (col_start > 0 ? setting.columnLefts[col_start-1] : def.columTitleDefWidth);

        // 鼠标选中从下向上选中
        let row_start = Math.min(_start[0], _end[0]);
        let row_end = Math.max(_start[0], _end[0]);
        let _t=  row_start > 0 ? setting.rowTops[row_start -1] : def.rowTitleHeight;
        let _h = (setting.rowTops.length === (row_end + 1) ) ? 
            row_start === 0 ?
            setting.rowTops[ setting.rowTops.length-1] -  def.rowTitleHeight :
            setting.rowTops[ setting.rowTops.length -1] - setting.rowTops[row_start  -1] :
            setting.rowTops[Math.min(row_end, setting.rowTops.length-1)] - (row_start > 0 ? setting.rowTops[row_start-1] : def.rowTitleHeight);
        if(col_start === -1 || row_start === -1) return;
        ctx.lineWidth = 2 ;
        ctx.strokeStyle = 'rgba(0, 102, 0, 0.8)';
        ctx.fillStyle =  'rgba(0, 102, 0, 0.02)';
        ctx.fillRect(_l , _t , _w , _h );
        this.setState({
            regional_sel:[_l,_t,_w,_h]
        });
    
        let currentItem =  this.excelData[row_start][col_start];
        if(!currentItem || row_end === -1 || row_start === -1) {
            return
        }
        if(col_start > -1 && row_start > -1) {
            let {
                color,
                fontStyle,
                fontWeight,
                fontSize,
                fontFamily
            } = currentItem[3]['text'];
            this.setState({
                editor_coordinate_x:col_start,
                editor_coordinate_y:row_start,
                editor_coordinate_val:currentItem[2],
                extended_attribute_font_color:color,
                extended_attribute_font_weight:fontWeight,
                extended_attribute_font_style:fontStyle,
                extended_attribute_font_size:fontSize,
                extended_attribute_font_family:fontFamily
            })
        } 
        let merge_col = col_start;
        let merge_row = row_start ;

        ctx.rect(_l , _t , _w , _h );
        ctx.fillStyle = 'rgba(0, 102, 0, 0.04)';
        ctx.fillRect(_l , _t , _w , _h );

        // 选中区域的起始网格
        ctx.fillStyle = '#fff';
        ctx.fillRect(
            _l   + 0.5, 
            _t  + 0.5, 
            (setting.columnLefts[merge_col] - _l - 0.5) ,
            (setting.rowTops[merge_row] - _t - 0.5) );

        // 绘制左上角起始单元格内容
        drawMergeText(ctx, this.excelData[row_start][col_start], merge_row, merge_col, _l + 0.5, _t + 0.5, setting);
        ctx.stroke();
        // this.inputRef.value = this.excelData[row_start][ col_start][2];
    } 

    // 重新绘制区域选择
    reDrawSelectArea(state?:string | 'merge') {
        const ctx = this.context;
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;

        let _start = this.state.regional_sel_start;
        let _end = this.state.regional_sel_end;  
        let _begin = this.state.regional_sel_begin;
    
        ctx.beginPath();
        // 鼠标选中从下向上选中
        let row_start = Math.min(_start[0], _end[0]);
        let row_end = Math.max(_start[0], _end[0]);
        // 鼠标选中从右向左选中
        let col_start = Math.min(_start[1],_end[1]);
        let col_end = Math.max(_start[1], _end[1]);

        // 当前开始触发对象
        if(col_start === -1 || row_end === -1) {
            return;
        }
        let currItem = this.excelData[row_start][col_start];
        let currIndexs = currItem[0];
    
        // 点击选择合并区域列处理
        if(col_start === col_end) {
            col_end = col_start + currIndexs[0] -1;
        }
        // 点击选择合并区域行处理
        if(row_start === row_end) {
            row_end = row_start + currIndexs[1] -1;
        }
        // 容错处理
        if(!currItem) return ;

        // 当前结束对象
        let currEndItem = this.excelData[row_end][col_end];

        let currEndIndexs = currEndItem[0];
        if(currEndIndexs[0] > 1) {
            row_end = row_end + currEndIndexs[0] -1;
            currEndItem = this.excelData[row_end][col_end];

            currEndIndexs = currEndItem[0];
        }
        if(currEndIndexs[1] > 1) {
            col_end = col_end + currEndIndexs[1] -1;
            currEndItem = this.excelData[row_end][col_end];
            currEndIndexs = currEndItem[0];
        }

        // 区域选择合并单元格计算优化
        let itemTL = currItem; // 左上角单元格
        let itemRB = currEndItem; // 右下角单元格
        let itemTR = this.excelData[row_start][col_end]; // 右上角单元格
        let itemLB = this.excelData[row_end][col_start] // 左下角单元格
        console.log('\nregional_sel_begin' ,this.state.regional_sel_begin)
        // 计算左上角
        if(!itemTL[0][0]) {
            let len = this.excelObject.config.merge.length;
            for(let i=0;i<len;i++) {
                let item = this.excelObject.config.merge[i];
                let _t = item[0];
                let _h = item[1] 
                let _l = item[2];
                let _w = item[3];
                
                // 左上角单元格
                if(row_start >= _t && row_start <= _t + _h && col_start >= _l && col_start <= _l + _w) {
                    row_start = _t;
                    col_start = _l;
                } 
            }
            this.setState({
                regional_sel_start: [row_start, col_start]
            })
        } 
        // 计算右下角
        if( !itemRB[0][0]) {
            let len = this.excelObject.config.merge.length;
            for(let i=0;i<len;i++) {
                let item = this.excelObject.config.merge[i];
                let _t = item[0];
                let _h = item[1] 
                let _l = item[2];
                let _w = item[3];
                
                // 右下角单元格
                if(row_end >= _t && row_end <= _t + _h && col_end >= _l && col_end <= _l + _w) {
                    row_end = _t + _h;
                    col_end = _l + _w;
                } 
            }
            this.setState({
                regional_sel_start: [row_end, col_end]
            })
        }
        // 计算右上角
        if(!itemTR[0][0]) {
            let len = this.excelObject.config.merge.length;
            for(let i=0;i<len;i++) {
                let item = this.excelObject.config.merge[i];
                let _t = item[0];
                let _h = item[1] 
                let _l = item[2];
                let _w = item[3];
                if(row_start >= _t && row_start <= _t + _h && _l <= col_end && _l + _w >= col_end) {
                    col_end = _l + _w;
                }
                if(row_start >= _t && row_start <= _t + _h && _l >= col_start && _l + _w >= col_end){
                    row_start = _t;
                }
            }
            this.setState({
                regional_sel_start: [row_start, col_start],
                regional_sel_end: [row_end, col_end]
            })
        }

        if(!itemLB[0][0]) {
            let len = this.excelObject.config.merge.length;
            for(let i=0;i<len;i++) {
                let item = this.excelObject.config.merge[i];
                let _t = item[0];
                let _h = item[1] 
                let _l = item[2];
                let _w = item[3];
                if(row_end >= _t && row_end <= _t + _h && _l <= col_start && _l + _w >= col_start) {
                    col_start = _l;
                    row_end = _t +_h;
                }
            }
            this.setState({
                regional_sel_start: [row_start, col_start],
                regional_sel_end: [row_end, col_end]
            })
        }

        if(state === 'merge') {
            let mergeObj = [row_start, row_end - row_start, col_start, col_end - col_start];
            this.excelObject.config.merge.push(mergeObj);
        }

        let _l= col_start > 0 ? setting.columnLefts[col_start -1] :  def.columTitleDefWidth;
        let _w = (setting.columnLefts.length === (col_end + 1) ) ? 
        col_start === 0 ?
        setting.columnLefts[ setting.columnLefts.length-1] -  def.columTitleDefWidth :
        setting.columnLefts[ setting.columnLefts.length -1] - setting.columnLefts[col_start -1 ] :
        setting.columnLefts[Math.min(col_end, setting.columnLefts.length -1)] - (col_start > 0 ? setting.columnLefts[col_start-1] : def.columTitleDefWidth);

        let _t=  row_start > 0 ? setting.rowTops[row_start -1] : def.rowTitleHeight;
        let _h = (setting.rowTops.length === (row_end + 1) ) ? 
            row_start === 0 ?
            setting.rowTops[ setting.rowTops.length-1] -  def.rowTitleHeight :
            setting.rowTops[ setting.rowTops.length -1] - setting.rowTops[row_start  -1] :
            setting.rowTops[Math.min(row_end, setting.rowTops.length-1)] - (row_start > 0 ? setting.rowTops[row_start-1] : def.rowTitleHeight);
        if(col_start === -1 || row_start === -1) return;
        ctx.lineWidth = 2 ;
        ctx.strokeStyle = 'rgba(0, 102, 0, 0.8)';
        ctx.fillStyle =  'rgba(0, 102, 0, 0.02)';
        if(state === 'merge') {
            ctx.fillStyle = '#fff';
            ctx.clearRect(_l , _t , _w , _h );
        }
        ctx.fillRect(_l , _t , _w , _h );
        this.setState({
            regional_sel:[_l,_t,_w,_h]
        });
        let currentItem =  this.excelData[row_start][col_start];
        if(col_start > -1 && row_start > -1) {
            let {
                color,
                fontStyle,
                fontWeight,
                fontSize,
                fontFamily
            } = currentItem[3]['text'];
            this.setState({
                editor_coordinate_x:col_start,
                editor_coordinate_y:row_start,
                editor_coordinate_val:currentItem[2],
                extended_attribute_font_color:color,
                extended_attribute_font_weight:fontWeight,
                extended_attribute_font_style:fontStyle,
                extended_attribute_font_size:fontSize,
                extended_attribute_font_family:fontFamily
            })
        } 
        let merge_col = state === 'merge' ? col_end :col_start;
        let merge_row = state === 'merge' ? row_end : row_start;

        ctx.rect(_l , _t , _w , _h );
        ctx.fillStyle =  'rgba(0, 102, 0, 0.04)';
        ctx.fillRect(_l , _t , _w , _h );

        // 选中区域的起始网格
        ctx.fillStyle = '#fff';

        // 计算左上角单元格大小，涉及到合并单元格的情况
        let coordinate = this.excelData[row_start ][col_start][0];
        let _x = coordinate[0] -1;
        let _y = coordinate[1] -1;

        ctx.fillRect(
            _l   + 0.5, 
            _t  + 0.5, 
            (setting.columnLefts[merge_col +  _x ] - _l - 0.5) ,
            (setting.rowTops[merge_row + _y] - _t - 0.5));
        if(state === 'merge') {
            if( this.excelData &&  this.excelData[row_start] &&  this.excelData[row_start][col_start]) {
                // this.excelData[row_start ][col_start][2] = this.inputRef.value || "";
            }
        }
        // 绘制左上角起始单元格内容
        if( this.excelData[row_start][col_start] &&  this.excelData[row_start][col_start][2]) {
            drawMergeText(ctx, this.excelData[row_start][col_start], merge_row + _y, merge_col + _x, _l + 0.5, _t + 0.5, setting);
        } 

        // this.inputRef.value = this.excelData[row_start][ col_start][2];
        if(state === 'merge') {
            this.excelData[row_start][col_start][0] = [col_end - col_start +1 , row_end - row_start + 1];
            this.updateSelAreaItemsByMerge(
                col_start,
                row_start,
                col_end,
                row_end
            );
        }
        ctx.stroke();
    } 

    updateSelAreaItemsByMerge(c_s:number, r_s:number, c_e:number, r_e: number) {
        let datas = this.excelData;
        for(let j=r_s;j<=r_e;j++) {
            for(let i=c_s;i<=c_e;i++) {
                let item = datas[j][i];
                if(i === c_s && j === r_s) {
                    continue;
                }else if(item && item[0]) {
                    [
                        item[0][0],
                        item[0][1],
                        item[2]
                    ] = [ 
                        0, 
                        0, 
                        ""
                    ]
                }
            }
        }
    }

    updateChangeSizeButton(left:number, top:number, event:MouseEvent) {
        //当前选中下标
        let currentIndex = this.state.change_size_current_index;
        // 初始化计算数据
        let info = this.excelObject.info;
        let infoTop = info.top ;
        let infoLeft = info.left ;

        if( left > infoLeft && top > infoTop && event.buttons === 1) {
            this.regionalSelection(left,top);
            return;
        }
        if(!(left > infoLeft && top <= infoTop ||  top > infoTop && left <= infoLeft)) {
            this.initChangeSizeState();
            return;
        }
        let _left = this.excelObject.setting_custome.columnLefts[currentIndex-1] || 
                    this.excelObject.setting_def.columTitleDefWidth ;
        let _width = Math.max(left- _left, 2);
        let _top = this.excelObject.setting_custome.rowTops[ currentIndex -1] || 
                   this.excelObject.setting_def.rowTitleHeight;
        let _height  = Math.max(top - _top, 2);
        let def = this.excelObject.setting_def;
        if(top > info.top && left <= info.left){
            // 设置横向
            if(event.buttons === 1 && currentIndex > -1) {
                this.setState({
                    changeSizeState:'change_size_h',
                    change_size_h: 1,
                    change_size_w: Math.min(this.excelObject.info.width  ,  1400),
                    currentLabel_val:_height,
                    currentLabel_top:  _top,
                    currentLabel_left: this.excelObject.setting_def.columTitleDefWidth,
                    change_size_top:top,
                    change_size_left:0,
                    change_size_display:'block'
            
                })
            }else {
                let index = this.excelObject.setting_custome.rowTops.indexOf(top) 
                if(index > -1) {
                    this.setState({
                        change_size_current_index:index,
                        changeSizeState:'change_size_h',
                        change_size_h: 1,
                        change_size_w:Math.min(this.excelObject.setting_def.columTitleDefWidth,  1400),
                        currentLabel_val:_height,
                        currentLabel_top:  _top,
                        currentLabel_left: this.excelObject.setting_def.columTitleDefWidth,
                        change_size_top:top ,
                        change_size_left:0,
                        change_size_display:'block'
                    })
                }
            } 
        }else  {
            
            // 设置纵向
            if(event.buttons === 1 && currentIndex > -1) {
                this.setState({
                    changeSizeState:'change_size_w',
                    change_size_h: Math.min(this.excelObject.info.height , this.viewHeight),
                    change_size_w:1,
                    change_size_title_l: -2 ,
                    change_size_title_t:0,
                    change_size_title_w:4 ,
                    change_size_title_h: def.rowTitleHeight,
                    currentLabel_val:_width,
                    currentLabel_top:  (-22) + 'px',
                    currentLabel_left: left + 'px',
                    change_size_top:0,
                    change_size_left:left +'px',
                    change_size_display:'block'
                })
            }else {
                let index = this.excelObject.setting_custome.columnLefts.indexOf(left) 
                if(index > -1) {
                    this.setState({
                        changeSizeState:'change_size_w',
                        change_size_h: Math.min(this.excelObject.info.top , this.viewHeight),
                        change_size_w:1,
                        change_size_top:0,
                        change_size_title_l:-2,
                        change_size_title_t: 0,
                        change_size_title_w: 4,
                        change_size_title_h: def.rowTitleHeight,
                        change_size_current_index:index,
                        currentLabel_val:_width,
                        currentLabel_top:  (-22) + 'px',
                        currentLabel_left: left,
                        change_size_left:left +'px',
                        change_size_display:'block'
                    })
                }
            } 
        }
    }
    
    updateEditorDOM(left:number,top:number, state ?:string) {
        let info = this.excelObject.info;
        let width = Math.min(info.width, 1400);
        let height = Math.min(info.height, this.viewHeight);
        if(!(left > 0 && left < width && top > 0 &&top < height)) {
            console.info("请点击Excel区域");
            return;
        }
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let cols = setting.columnLefts;
        let rows = setting.rowTops;
        let _l = def.columTitleDefWidth;
        let _t = def.rowTitleHeight;
        let _w = 0;
        let _h = 0;  

        let item = this.excelData[this.state.editor_coordinate_y][this.state.editor_coordinate_x];
        if(!item) return;
        let x =  item[0][0];
        let y = item[0][1];
        _w = cols[this.state.editor_coordinate_x + x] - cols[this.state.editor_coordinate_x];
        _l = this.state.editor_coordinate_x > 0 ?
            cols[this.state.editor_coordinate_x-1] :  
            def.columTitleDefWidth;
        _h = rows[this.state.editor_coordinate_y + y] - rows[this.state.editor_coordinate_y];
        _t = this.state.editor_coordinate_y > 0 ?
            rows[this.state.editor_coordinate_y-1]:
            def.rowTitleHeight;
        this.setState({
            editor_text:"",
            editor_display:'block',
            editor_width:_w,
            editor_height:_h ,
            editor_top:_t ,
            editor_left:_l,
        })


        // this.updateExcelCanvas();
    }
    upateTxtByEdited(dom:any) {
        let style = dom.style;
        let text = dom.innerText;
        let left = parseFloat(style.left);
        let top = parseFloat(style.top);
        const ctx = this.context;
        ctx.fontWeight = '10pt';
        ctx.fillStyle  = '#333';
        ctx.textAlign = "start";
        ctx.textBaseline = "bottom";
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#ccc";
        ctx.rect(left+ 0.5, top+ 0.5, this.excelObject.setting_def.width, this.excelObject.setting_def.height);
        ctx.fillStyle = "#fff";
        ctx.fillRect(left, top, this.excelObject.setting_def.width, this.excelObject.setting_def.height);
        let _x =  left + 5;
        let _y = top +  this.excelObject.setting_def.height -5;
        ctx.fillText(text, _x, _y);
        ctx.stroke();
        dom.innerText = "";
    }

    // 保存到本地存储
    saveData = () => {
        const ok = saveToLocal(this.excelData, this.excelObject);
        console.info(ok ? '已保存到本地' : '保存失败');
    }

    // 从本地存储加载
    loadData = () => {
        const ok = loadFromLocal(this.excelData, this.excelObject);
        if(ok) {
            this.reDrawCanvas();
            this.forceUpdate();
            console.info('已从本地加载');
        } else {
            console.info('没有可加载的本地数据');
        }
    }

    // 导出为 JSON 文件
    exportJSON = () => {
        exportToFile(this.excelData, this.excelObject);
    }

    // 导出为 CSV 文件
    exportCSV = () => {
        exportToCSV(this.excelData);
    }

    // 触发文件选择进行导入
    triggerImport = () => {
        if(this.importInputRef && this.importInputRef.current) {
            this.importInputRef.current.click();
        }
    }

    // 处理文件导入
    handleImportFile = (e:any) => {
        const file = e.target.files && e.target.files[0];
        if(!file) return;
        importFromFile(file, this.excelData, this.excelObject)
            .then((ok) => {
                if(ok) {
                    this.reDrawCanvas();
                    this.forceUpdate();
                    console.info('导入成功');
                } else {
                    console.info('导入失败：文件格式不正确');
                }
            })
            .catch((err) => {
                console.error('导入出错:', err);
            });
        // 重置 input，允许再次导入同一文件
        e.target.value = '';
    }

    // 在修改前记录当前状态（快照）
    recordHistory = () => {
        this.history.record(this.excelData, this.excelObject.config.merge);
    }

    // 应用一个历史快照到当前数据（原地替换，保持引用）
    applyHistorySnapshot = (snapshot:any) => {
        this.excelData.length = 0;
        snapshot.excelData.forEach((row:any) => this.excelData.push(row));
        this.excelObject.config.merge = snapshot.merge;
        this.reDrawCanvas();
        this.reDrawSelectArea();
        this.forceUpdate();
    }

    undo = () => {
        const snapshot = this.history.undo(this.excelData, this.excelObject.config.merge);
        if(snapshot) {
            this.applyHistorySnapshot(snapshot);
        } else {
            console.info('没有可撤销的操作');
        }
    }

    redo = () => {
        const snapshot = this.history.redo(this.excelData, this.excelObject.config.merge);
        if(snapshot) {
            this.applyHistorySnapshot(snapshot);
        } else {
            console.info('没有可重做的操作');
        }
    }

    // 获取当前选区的行列范围（闭区间）
    getSelectionRange = () => {
        let _start = this.state.regional_sel_start;
        let _end = this.state.regional_sel_end;
        if(!_start || !_end || _start[0] === -1 || _start[1] === -1) return null;
        return {
            rowStart: Math.min(_start[0], _end[0]),
            rowEnd: Math.max(_start[0], _end[0]),
            colStart: Math.min(_start[1], _end[1]),
            colEnd: Math.max(_start[1], _end[1]),
        };
    }

    copy = () => {
        const range = this.getSelectionRange();
        if(!range) { console.info('请先选择区域'); return; }
        copyRegion(this.excelData, range.rowStart, range.rowEnd, range.colStart, range.colEnd, false);
        console.info('已复制');
    }

    cut = () => {
        const range = this.getSelectionRange();
        if(!range) { console.info('请先选择区域'); return; }
        copyRegion(this.excelData, range.rowStart, range.rowEnd, range.colStart, range.colEnd, true);
        this.cutSourceRange = range;
        console.info('已剪切');
    }

    paste = () => {
        const clip = getClipboard();
        if(!clip) { console.info('剪贴板为空'); return; }
        const range = this.getSelectionRange();
        if(!range) { console.info('请先选择粘贴位置'); return; }

        this.recordHistory();

        // 以选区左上角为粘贴起点
        const result = pasteToRegion(this.excelData, range.rowStart, range.colStart, true);

        // 剪切模式：清空源区域内容
        if(clip.isCut) {
            this.clearClipboardSource();
        }

        this.reDrawCanvas();
        this.reDrawSelectArea();
        this.forceUpdate();

        if(result) {
            console.info(`已粘贴 ${result.rows}×${result.cols}`);
        }
    }

    // 剪切后清空源区域
    clearClipboardSource = () => {
        const r = this.cutSourceRange;
        if(!r) return;
        for(let j=r.rowStart; j<=r.rowEnd; j++) {
            for(let i=r.colStart; i<=r.colEnd; i++) {
                const item = this.excelData[j] && this.excelData[j][i];
                if(item) {
                    item[2] = '';
                }
            }
        }
        this.cutSourceRange = null;
    }

    // 键盘方向导航：移动或扩展选区
    // dir: 'up' | 'down' | 'left' | 'right'；extend: 是否按住 Shift 扩展选区
    moveSelection = (dir:string, extend:boolean = false) => {
        let start = this.state.regional_sel_start;
        let end = this.state.regional_sel_end;
        if(!start || start[0] === -1 || start[1] === -1) {
            // 无选区时，从左上角开始
            this.setSelectionCell(0, 0);
            return;
        }

        let rowMax = (this.excelObject.setting_custome.row.length || 1) - 1;
        let colMax = (this.excelObject.setting_custome.column.length || 1) - 1;

        // 扩展模式移动 end，否则移动整个选区（start=end）
        let anchor = extend ? end : start;
        let row = anchor[0];
        let col = anchor[1];

        switch(dir) {
            case 'up':    row = Math.max(0, row - 1); break;
            case 'down':  row = Math.min(rowMax, row + 1); break;
            case 'left':  col = Math.max(0, col - 1); break;
            case 'right': col = Math.min(colMax, col + 1); break;
        }

        if(extend) {
            this.setState({ regional_sel_end:[row, col] });
            this.reDrawCanvas();
            this.reDrawSelectArea();
        } else {
            this.setSelectionCell(row, col);
        }
    }

    // 将选区设为单个单元格并重绘
    setSelectionCell = (row:number, col:number) => {
        this.setState({
            regional_sel_state: 2,
            regional_sel_start:[row, col],
            regional_sel_end:[row, col],
            regional_sel_begin:[row, col],
            editor_display:'none',
        }, () => {
            this.reDrawCanvas();
            this.reDrawSelectArea();
        });
    }

    // 提交当前编辑内容并移动到相邻单元格
    commitEditAndMove = (dir:string) => {
        // 提交编辑（复用 blur 逻辑）
        if(this.editorRef.current) {
            this.updateInputVal();
        }
        this.setState({ editor_display:'none' }, () => {
            this.reDrawCanvas();
            this.moveSelection(dir);
        });
    }

    // 取消编辑，不保存
    cancelEdit = () => {
        this.setState({ editor_display:'none' }, () => {
            this.reDrawCanvas();
            this.reDrawSelectArea();
        });
    }

    // 进入编辑当前选中的单元格
    enterEditCurrentCell = () => {
        let start = this.state.regional_sel_start;
        if(!start || start[0] === -1) return;
        this.setState({
            editor_coordinate_x: start[1],
            editor_coordinate_y: start[0],
        }, () => {
            this.updateEditorDOM2(start[1], start[0]);
            if(this.editorRef.current) {
                this.editorRef.current.setAttribute("contenteditable", "true");
                this.editorRef.current.focus();
            }
        });
    }

    // 按单元格坐标定位并显示编辑器（键盘 Enter 触发）
    updateEditorDOM2 = (col:number, row:number) => {
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let cols = setting.columnLefts;
        let rows = setting.rowTops;
        let item = this.excelData[row] && this.excelData[row][col];
        if(!item) return;
        let x = item[0][0] || 1;
        let y = item[0][1] || 1;
        let _w = cols[col + x] - cols[col];
        let _l = col > 0 ? cols[col-1] : def.columTitleDefWidth;
        let _h = rows[row + y] - rows[row];
        let _t = row > 0 ? rows[row-1] : def.rowTitleHeight;
        this.setState({
            editor_display:'block',
            editor_width:_w,
            editor_height:_h,
            editor_top:_t,
            editor_left:_l,
        });
    }

    // 清空当前选区内容（Delete 键）
    clearSelection = () => {
        const range = this.getSelectionRange();
        if(!range) return;
        this.recordHistory();
        for(let j=range.rowStart; j<=range.rowEnd; j++) {
            for(let i=range.colStart; i<=range.colEnd; i++) {
                const item = this.excelData[j] && this.excelData[j][i];
                if(item) {
                    item[2] = '';
                }
            }
        }
        this.reDrawCanvas();
        this.reDrawSelectArea();
        this.forceUpdate();
    }

    // ---- 右键菜单：插入/删除 行列 ----
    // 菜单命中的目标行列（右键位置），无则回退到选区起点
    getContextTarget = () => {
        let row = this.state.context_menu_row;
        let col = this.state.context_menu_col;
        if(row < 0 || col < 0) {
            const range = this.getSelectionRange();
            if(range) { row = range.rowStart; col = range.colStart; }
        }
        return { row, col };
    }

    ctxInsertRow = (offset:number) => {
        const { row } = this.getContextTarget();
        if(row < 0) return;
        this.recordHistory();
        insertRow(this.excelData, this.excelObject, row + offset, excelItemModel);
        this.afterStructureChange();
    }

    ctxDeleteRow = () => {
        const { row } = this.getContextTarget();
        if(row < 0) return;
        this.recordHistory();
        deleteRow(this.excelData, this.excelObject, row, excelItemModel);
        this.afterStructureChange();
    }

    ctxInsertColumn = (offset:number) => {
        const { col } = this.getContextTarget();
        if(col < 0) return;
        this.recordHistory();
        insertColumn(this.excelData, this.excelObject, col + offset, excelItemModel);
        this.afterStructureChange();
    }

    ctxDeleteColumn = () => {
        const { col } = this.getContextTarget();
        if(col < 0) return;
        this.recordHistory();
        deleteColumn(this.excelData, this.excelObject, col, excelItemModel);
        this.afterStructureChange();
    }

    // 结构变更后：重算下标缓存 + 重绘 + 收起菜单
    afterStructureChange = () => {
        this.excelObject.setting_custome.columnLefts = [];
        this.excelObject.setting_custome.rowTops = [];
        this.closeContextMenu();
        clampScroll(this.excelObject.viewport, this.excelObject.setting_custome, this.excelObject.setting_def);
        this.reDrawCanvas();
        this.reDrawSelectArea();
        this.forceUpdate();
    }

    changeMergeState = (state:string) => {
        if(state === 'merge') {
            this.merge()
        }else {
            this.unMerge();
        }
    }
    merge() {
        // 合并状态判断
        let _s = this.state.regional_sel_start;
        let _e = this.state.regional_sel_end;
        let _arr = [..._s,..._e];
        let currentItem = this.excelData[_s[0]][_s[1]];
        if(!currentItem) return;
        let arr = currentItem[0];
        if(arr[0] === (_e[1] - _s[1] + 1)  && arr[1] === (_e[0] - _s[0] + 1) ) {
            return ;
        }
        this.recordHistory();
        this.reDrawSelectArea('merge');

        // 【新增】合并后验证数据一致性
        if(process.env.NODE_ENV === 'development') {
            this.validateMergeData();
        }
    }

    // 【新增】验证合并数据一致性的辅助函数
    validateMergeData() {
        const errors:string[] = [];

        // 检查每个 config.merge 配置
        this.excelObject.config.merge.forEach((merge:any, idx:number) => {
            const [rowStart, rowSpan, colStart, colSpan] = merge;

            // 检查边界
            if(rowStart < 0 || colStart < 0 || rowSpan < 0 || colSpan < 0) {
                errors.push(`Merge ${idx}: 负数坐标或跨度 [${merge.join(',')}]`);
                return;
            }

            // 检查主单元格是否存在
            const masterCell = this.excelData[rowStart]?.[colStart];
            if (!masterCell) {
                errors.push(`Merge ${idx}: 主单元格 [${rowStart},${colStart}] 不存在`);
                return;
            }

            // 检查主单元格的合并标记是否匹配
            // 注意：item[0] 格式是 [colSpan, rowSpan]（列在前）
            // 而 config.merge 格式是 [rowStart, rowSpan, colStart, colSpan]（行在前）
            const [cellColSpan, cellRowSpan] = masterCell[0];
            if (cellColSpan !== colSpan + 1 || cellRowSpan !== rowSpan + 1) {
                errors.push(`Merge ${idx}: 跨度不匹配 - config:[r${rowSpan},c${colSpan}] cell:[c${cellColSpan},r${cellRowSpan}]`);
            }

            // 检查被合并的单元格是否正确标记为 [0,0]
            for(let r = rowStart; r <= rowStart + rowSpan; r++) {
                for(let c = colStart; c <= colStart + colSpan; c++) {
                    if(r === rowStart && c === colStart) continue; // 跳过主单元格

                    const cell = this.excelData[r]?.[c];
                    if(!cell) {
                        errors.push(`Merge ${idx}: 被合并单元格 [${r},${c}] 不存在`);
                        continue;
                    }

                    if(cell[0][0] !== 0 || cell[0][1] !== 0) {
                        errors.push(`Merge ${idx}: 被合并单元格 [${r},${c}] 标记错误 [${cell[0].join(',')}]`);
                    }
                }
            }
        });

        if(errors.length > 0) {
            console.warn('合并数据一致性检查发现问题:', errors);
        }

        return errors;
    }

    unMerge() {
        // 状态判断
        let _start = this.state.regional_sel_start;
        let _end = this.state.regional_sel_end;
        let col_start = Math.min(_start[1],_end[1]);
        let row_start = Math.min(_start[0], _end[0]);
        let row_end = Math.max(_start[0], _end[0]);
        let col_end = Math.max(_start[1], _end[1]);
        let startItem = this.excelData[row_start][col_start];
        if(!startItem) return;

        this.recordHistory();

        // 清空单元格的合并标记
        for(let i=col_start;i<=col_end;i++) {
            for(let j=row_start;j<=row_end;j++) {
                let item =  this.excelData[j] && this.excelData[j][i];
                if(item) {
                    item[0] = [1,1];
                }
            }
        }

        // 【修复】清理 config.merge 中的合并配置
        // config.merge 格式：[row_start, row_span, col_start, col_span]
        this.excelObject.config.merge = this.excelObject.config.merge.filter((mergeItem:any) => {
            const [mRowStart, mRowSpan, mColStart, mColSpan] = mergeItem;
            const mRowEnd = mRowStart + mRowSpan;
            const mColEnd = mColStart + mColSpan;

            // 检查合并区域是否与当前选择区域有交集
            const hasOverlap = !(
                row_end < mRowStart || row_start > mRowEnd ||
                col_end < mColStart || col_start > mColEnd
            );

            // 保留没有交集的合并区域
            return !hasOverlap;
        });

        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let cols = setting.columnLefts;
        let rows = setting.rowTops;
        let _l,_t,_w,_h = 0;
        _w = cols[col_start + 1] - cols[col_start];
        _l = col_start > 0 ?
            cols[col_start-1] :
            def.columTitleDefWidth;
        _h = rows[row_start + 1] - rows[row_start];
        _t = row_start > 0 ?
            rows[row_start-1]:
            def.rowTitleHeight;
        this.setState({
            mouse_state:'m_up',
            mouse_event_type:'init',
            change_size_current_index:-1,
            editor_coordinate_x:col_start,
            editor_coordinate_y:row_start,
            regional_sel_start:[row_start, col_start],
            regional_sel_end:[row_end, col_end],
            regional_sel:[_l, _t, _w, _h]
        })
        this.reDrawCanvas();
        this.reDrawSelectArea();

    }


    // 属性设置
    setStyle = (param:string, key:string, val:any) =>  {
        let _start = this.state.regional_sel_start;
        let _end = this.state.regional_sel_end;  
        let col_start = Math.min(_start[1],_end[1]);
        let col_end = Math.max(_start[1], _end[1]);
        let row_start = Math.min(_start[0], _end[0]);
        let row_end = Math.max(_start[0], _end[0]);
        let hasChangeState = false; // 性能优化点：如果当前区域内所有对象的属性未变化，则不需要渲染
        if(['color' ,'fillStyle','fontFamily','fontSize'].indexOf(key) > -1) {
            this.initExtendedAttribute(key, val)
        }else {
            switch (key) {
                case 'fontWeight':
                    this.setState({
                        extended_attribute_font_weight:val,
                    })
                    break;
                case 'fontStyle':
                    this.setState({
                        extended_attribute_font_style:val,
                    })
                    break;
           
            }
        }
        if([col_start, col_end, row_start, row_end].indexOf(-1) > -1) return;

        // 检查是否会有实际变化，有则先记录历史
        let willChange = false;
        for(let j=row_start;j<=row_end && !willChange;j++) {
            for(let i=col_start;i<=col_end;i++) {
                if(this.excelData[j][i][3][param][key] !== val) {
                    willChange = true;
                    break;
                }
            }
        }
        if(willChange) {
            this.recordHistory();
        }

        for(let j=row_start;j<=row_end;j++) {
            for(let i=col_start;i<=col_end;i++) {
                let item = this.excelData[j];
                if( item[i][3][param][key] !== val) {
                    item[i][3][param][key] = val;
                    hasChangeState = true;
                }
            }
        }

        if(hasChangeState) {
            this.updateExcelCanvas();
            this.reDrawSelectArea();
        }
    }

    // 扩展属性
    extendedAttribute = (stateParma:string) =>  {
        this.setState({
            [stateParma]: !this.state[stateParma]
        })
    }

    // 属性设置好后扩展区域状态初始化
    initExtendedAttribute(type:string, val:string) {
        switch(type) {
            case 'color':
            this.setState({
                extended_attribute_font_color: val,
                extended_attribute_font_color_state: !this.state.extended_attribute_font_color_state
            })
            break;
            case 'fillStyle':{
                this.setState({
                    extended_attribute_rect_fillstyle: val,
                    extended_attribute_rect_fillstyle_state: !this.state.extended_attribute_rect_fillstyle_state
                })
            }
            break;
            case 'fontFamily':{
                this.setState({
                    extended_attribute_font_family:val,
                    extended_attribute_font_family_state: !this.state.extended_attribute_font_family_state,
                })
            }
            break;
            case 'fontSize':{
                this.setState({
                    extended_attribute_font_size:val,
                    extended_attribute_font_size_state: !this.state.extended_attribute_font_size_state,
 
                })
            }
            break;
            

        }
     
    }

    // 获取单元格input状态下的属性
    getInputItemStyle(type:string, param:string) {
        let data = this.state.editor_coordinate_x && this.state.editor_coordinate_y && 
                   this.excelData[this.state.editor_coordinate_y][this.state.editor_coordinate_x] && 
                   this.excelData[this.state.editor_coordinate_y][this.state.editor_coordinate_x][3];
        if(!data) return;
        return data[type][param];
    }

    // 计算合并网格大小
    getMergeVal(start:number, end:number, arr:[]) {
        let val = 0;
        let len = end - start;
        for(let i=start; i<=end;i++) {
            val += arr[i];
        }

        return val ;
    }

    sheetEditorChangeValue = (value:string) => {
        if(this.excelData[this.state.editor_coordinate_x] 
            && this.excelData[this.state.editor_coordinate_y][this.state.editor_coordinate_x] ){
            this.excelData[this.state.editor_coordinate_y][this.state.editor_coordinate_x][2] = value;
        }
        this.setState({
            editor_coordinate_val:value
        })
        this.updateExcelItemByInput('merge');
    }


    onInput() {
        this.setState({
            editor_coordinate_val: this.editorRef.current.innerHTML || ""
        })        
    }

    updateInputVal() {
        let newVal = this.editorRef.current.innerHTML || "";
        let oldVal = this.excelData[this.state.editor_coordinate_y][this.state.editor_coordinate_x][2];
        // 值发生变化时记录历史（此时 excelData 仍是旧值）
        if(newVal !== oldVal) {
            this.recordHistory();
        }
        this.excelData[this.state.editor_coordinate_y][this.state.editor_coordinate_x][2] = newVal;
        this.onInput();
    }

    onFocus() {
        // this.editorRef

    }

    updateExcelItemByInput(state:string) {
        const ctx = this.context;
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let _l= this.state.editor_coordinate_x > 0 ? setting.columnLefts[this.state.editor_coordinate_x -1] :  def.columTitleDefWidth;
        let _t=  this.state.editor_coordinate_y > 0 ? setting.rowTops[this.state.editor_coordinate_y -1] : def.rowTitleHeight;
        ctx.beginPath();
        ctx.lineWidth = 12 ;
        ctx.fillStyle = '#fff';
        let coordinate = this.excelData[this.state.editor_coordinate_y ][this.state.editor_coordinate_x][0];
        let _x = coordinate[0] -1;
        let _y = coordinate[1] -1;
        ctx.fillRect(
            _l + 1, 
            _t + 1, 
            (setting.columnLefts[this.state.editor_coordinate_x + _x] - _l - 2) ,
            (setting.rowTops[this.state.editor_coordinate_y  + _y] -_t - 2));
        ctx.fillStyle = '#fff';

        // 绘制左上角起始单元格内容
        drawMergeText(ctx, this.excelData[this.state.editor_coordinate_y][this.state.editor_coordinate_x], 
            this.state.editor_coordinate_y + _y, 
            this.state.editor_coordinate_x + _x, 
            _l + 1, _t, setting)
    }

    render() {
        return<div className="excel"> 

            {/* 设置栏 */}
            <SheetSettingAreaComponent
                family = { this.state.extended_attribute_font_family }
                family_state = { this.state.extended_attribute_font_family_state }
                font_size = { this.state.extended_attribute_font_size }
                font_size_state = { this.state.extended_attribute_font_size_state}
                font_weight = { this.state.extended_attribute_font_weight }
                font_style = { this.state.extended_attribute_font_style }
                font_color = { this.state.extended_attribute_font_color } 
                font_color_state = { this.state.extended_attribute_font_color_state}
                rect_fillstyle = {this.state.extended_attribute_rect_fillstyle }
                rect_fillstyle_state = {this.state.extended_attribute_rect_fillstyle_state }
                imgs = { REQ_IMG }
                changeStyle = { this.setStyle }
                changeAttribute = { this.extendedAttribute }
                changeMergeState = { this.changeMergeState }
                onUndo = { this.undo }
                onRedo = { this.redo }
                onSave = { this.saveData }
                onLoad = { this.loadData }
                onExportJSON = { this.exportJSON }
                onExportCSV = { this.exportCSV }
                onImport = { this.triggerImport }/>

            {/* 隐藏的文件导入 input */}
            <input
                type="file"
                accept=".json"
                ref={this.importInputRef}
                style={{ display: 'none' }}
                onChange={this.handleImportFile}
            />

            {/* 编辑栏 */}
            <SheetEditorBarComponent
                ref = { this.inputRef }
                val = { this.state.editor_coordinate_val }
                x = { this.state.editor_coordinate_x }
                y = { this.state.editor_coordinate_y }
                changeValue = { this.sheetEditorChangeValue }/>

            <div className="excel_body">
                {/* 输入编辑组件 */}
                <div className="editor_content" >
                    <div 
                        className={`editor_excel`} 
                        ref={this.editorRef}
                        id="editorRef"
                        style={{ 
                            height:(parseFloat(this.state.editor_height) ||0) + 4,
                            width:(this.state.regional_sel[2]||0)+ 4,
                            top:(parseFloat(this.state.editor_top)||0) -2,
                            left:(parseFloat(this.state.editor_left) || 0)  - 2,
                            display:this.state.editor_display,
                            color: this.getInputItemStyle('text', 'color'),
                            fontStyle: this.getInputItemStyle('text', 'fontStyle'),
                            fontWeight: this.getInputItemStyle('text', 'fontWeight'),
                            textAlign: this.getInputItemStyle('text', 'textAlign'),
                            fontFamily: this.getInputItemStyle('text', 'fontFamily'),
                            fontSize: this.getInputItemStyle('text', 'fontSize'),
                            background: this.getInputItemStyle('rect', 'fillStyle')
                        }}
                        onFocus={this.onFocus.bind(this)}
                        onInput ={this.onInput.bind(this)}
                        onBlur={this.updateInputVal.bind(this)}
                        suppressContentEditableWarning = {true}
                        dangerouslySetInnerHTML={{__html:this.excelData[this.state.editor_coordinate_x] 
                            && this.excelData[this.state.editor_coordinate_y][this.state.editor_coordinate_x] && this.excelData[this.state.editor_coordinate_y][this.state.editor_coordinate_x][2] }}               
                        >
                    </div>
           
                    <span className="editor_coordinate c-t" 
                        style={{
                            width:Math.min(parseFloat(this.state.regional_sel[2]), 1400 -parseFloat(this.state.regional_sel[0]) ) || 0,
                            left:parseFloat(this.state.regional_sel[0]) ||0,
                            top:(parseFloat(this.excelObject.setting_def.rowTitleHeight + 0.5)||0)  -2}}></span>
                    <span className="editor_coordinate c-l" 
                        style={{
                            height:Math.min(parseFloat(this.state.regional_sel[3]), this.viewHeight - parseFloat(this.state.regional_sel[1]))||0,
                            top:parseFloat(this.state.regional_sel[1])||0,
                            left:parseFloat(this.excelObject.setting_def.columTitleDefWidth ) -1 ||0}}></span>
                </div>

                {/* Excel下标工具栏拖拽组件*/}
                <div className={`change_size  ${this.state.changeSizeState}`} 
                    draggable = 'true'
                    onClick={this.dragChangeSize.bind(this)}
                    onDragStart={this.dragChangeSize.bind(this)}
                    onDrag={this.dragChangeSize.bind(this)}
                    onDragEnd={this.dragChangeSize.bind(this)}
                    style={{
                        top:parseFloat(this.state.change_size_top),
                        left:parseFloat(this.state.change_size_left),
                        width:parseFloat(this.state.change_size_title_w),
                        display:['w','h'].indexOf(this.state.mouse_event_type) > -1 && this.state.change_size_current_index> -1 ? 'block' :'none' 
                    }}>
                    <span className="title" style={{
                        top: parseFloat(this.state.change_size_title_t ), 
                        left:parseFloat(this.state.change_size_title_l),
                        width:parseFloat(this.state.change_size_title_w )||0, 
                        height:parseFloat(this.state.change_size_title_h ) || 0}}></span>
                    <span className="content" style={{
                        width:parseFloat(this.state.change_size_w)||0, 
                        height:parseFloat(this.state.change_size_h) || 0,
                        display:this.state.mouse_state === 'm_up'?'none':'block'
                    }}></span>
                </div>

                {/* Excle下标工具栏拖拽坐标组件 */}
                <div 
                    ref={this.currentLabelDOMRef} 
                    className="currentLabel"
                    style={{left:parseFloat(this.state.currentLabel_left),top:parseFloat(this.state.currentLabel_top) ,
                    display:['w','h'].indexOf(this.state.mouse_event_type) > -1 && this.state.change_size_current_index> -1 && parseFloat(this.state.currentLabel_left) > 0 ?'block':'none'
                }}>
                        <label className="lab">{this.state.changeSizeState === 'change_size_w' ? '宽度': '高度'}:</label>
                        <span className="val">{parseInt(this.state.currentLabel_val + '')} 像素 </span>
                </div>

                {/* Excel画布 */}
                <div className="content">
                    <canvas id="canvas_excle" ref={(c) => {this.excelRef = c;this.context = c && c.getContext('2d')}}
                    width={ 1400} height={800} />
                </div>

                {/* 右键上下文菜单 */}
                <div className="context-menu"
                    style={{
                        display:this.state.context_menu_display,
                        left:parseFloat(this.state.context_menu_left) || 0,
                        top:parseFloat(this.state.context_menu_top) || 0,
                    }}>
                    <div className="menu-item" onClick={() => this.ctxInsertRow(0)}>在上方插入行</div>
                    <div className="menu-item" onClick={() => this.ctxInsertRow(1)}>在下方插入行</div>
                    <div className="menu-item" onClick={this.ctxDeleteRow}>删除整行</div>
                    <div className="menu-sep"></div>
                    <div className="menu-item" onClick={() => this.ctxInsertColumn(0)}>在左侧插入列</div>
                    <div className="menu-item" onClick={() => this.ctxInsertColumn(1)}>在右侧插入列</div>
                    <div className="menu-item" onClick={this.ctxDeleteColumn}>删除整列</div>
                    <div className="menu-sep"></div>
                    <div className="menu-item" onClick={() => { this.copy(); this.closeContextMenu(); }}>复制</div>
                    <div className="menu-item" onClick={() => { this.cut(); this.closeContextMenu(); }}>剪切</div>
                    <div className="menu-item" onClick={() => { this.paste(); this.closeContextMenu(); }}>粘贴</div>
                    <div className="menu-sep"></div>
                    <div className="menu-item" onClick={() => { this.clearSelection(); this.closeContextMenu(); }}>清除内容</div>
                </div>
            </div>
        </div>
    }
}

export default Excel;