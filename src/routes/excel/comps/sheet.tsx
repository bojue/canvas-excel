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

//data
import { txtCols, rectFillStylesCols, txtFamilys, txtSizes} from '../models/excle-setting-data';
import SheetEditorBarComponent from './sheet-edior-bar/sheet-editor-bar';


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
    txtCols:any[];
    txtFamilys:any[];
    txtSizes:any[];
    dpr:number;
    rectFillStylesCols:any[];
    constructor(props:any) {
        super(props);
        this.initData();
    }

    initData() {
        this.excelRef = React.createRef();
        this.editorRef = React.createRef();
        this.currentLabelDOMRef = React.createRef();
        this.inputRef = React.createRef();
        this.state = excelStateModel;
        this.excelObject = excelObjectModel;
        this.excelData = excelDataModel;
        this.txtCols = txtCols;
        this.rectFillStylesCols = rectFillStylesCols;
        this.txtFamilys = txtFamilys;
        this.txtSizes = txtSizes;
        this.sheetEditorChangeValue = this.sheetEditorChangeValue.bind(this)
    }
    
    componentDidMount() {
        this.initCanvasDOM();
        this.getExcelCanvas();
        this.drawBorder();
        this.addLister();
        this.initExcelContent();
    }

    initCanvasDOM() {
        let ctx = this.context        
        let dpr = window.devicePixelRatio || window.webkitDevicePixelRatio || window.mozDevicePixelRatio || 1;
        this.dpr = dpr;
        let w = this.excelRef.width;
        let h = this.excelRef.height;
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
            if( i === setting.column.length -1 || startLeft > 1000) {
                this.excelObject.info.width = startLeft ;
            }
            if(startLeft > 1000) {
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
            if( i === setting.row.length -1 || startHeight > 500) {
                this.excelObject.info.height = startHeight ;
            }

            if(startHeight > 500) {
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
        initExcelCanvas(this.context, this.excelObject, this.excelData, excelItemModel);
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
        for(let row = 0;row <rLen && currentTop <= 500;row++) {
            let height = rows[row];
            currentLeft = def.columTitleDefWidth;
            for(let col=0;col < cLen && currentLeft <= 1000;col++) {
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
                    // h = tops[row + h_count] - tops[row];
                    // for(let r=0; r < w_count;r++) {
                    //     w += colums[r+ col];
                    // }
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
            if(def.columTitleDefWidth <= _eX && _eX <= 1000 && 0<= _eY && _eY <def.rowTitleHeight || 
            0 <= _eX && _eX < def.columTitleDefWidth && def.rowTitleHeight < _eY && _eY <= 500 ) {
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
                    change_size_h:500,
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
                    change_size_w: 1000,
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
                change_size_w: 1000,
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
        this.context.clearRect(0, 0,this.excelObject.info.scalingRatio * 1000, this.excelObject.info.scalingRatio* 500 );
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
        if(def.columTitleDefWidth <= left && left <= 1000 && 0<= top && top <def.rowTitleHeight ) {
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
        }else if(0 <= left && left < def.columTitleDefWidth && def.rowTitleHeight < top && top <= 500){
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
        }else if(def.columTitleDefWidth<= left && left <= 1000 && def.rowTitleHeight < top && top <= 500){
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
        console.log(this.inputRef)
        // this.inputRef.value = this.excelData[row_start][ col_start][2];
    } 

    // 重新绘制区域选择
    reDrawSelectArea(state?:string | 'merge') {
        const ctx = this.context;
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;

        let _start = this.state.regional_sel_start;
        let _end = this.state.regional_sel_end;  
    
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

        // 开始点坐标计算
        if(!currIndexs[0] && !currIndexs[1]) {
            // 计算开始列
            if(!currIndexs[1]) {
                col_start -= 1
            }
            let find_col_start_bool = false;
            if(col_start > 0) {
                let nextColItem = this.excelData[row_start ][col_start-1];
                let nextColIndexs = nextColItem[0];
                while(!currIndexs[1] && !find_col_start_bool && col_start) {
                    currItem = this.excelData[row_start][col_start];
                    currIndexs = currItem[0];
                    nextColItem = this.excelData[row_start][col_start-1];
                    nextColIndexs = nextColItem[0];
                    if(currIndexs[1] === 0 && nextColIndexs[1] === 1 || col_start === 0) {
                        find_col_start_bool = true;
                    }else if(currIndexs[1] === 0) {
                        col_start -= 1;
                    }
                }
            }
     
          
            // 计算开始行
            let find_row_start_bool = false;
            if(row_start > 0) {
                let nextRowItem = this.excelData[row_start -1][col_start];
                let nextRowIndexs = nextRowItem[0];
                while(!currIndexs[0] && !find_row_start_bool && row_start) {
                    currItem = this.excelData[row_start][col_start];
                    currIndexs = currItem[0];
                    nextRowItem = this.excelData[row_start -1][col_start];
                    nextRowIndexs = nextRowItem[0];
                    if(currIndexs[0] === 0 && nextRowIndexs[0] === 1 || row_start === 0) {
                        find_row_start_bool = true;
                    }else if(currIndexs[0] === 0) {
                        row_start -= 1;
                    }
                }
            }
         
        }

        // 结束点坐标计算
        if(!currEndIndexs[0] && !currEndIndexs[1]) {
            // 计算结束列

            let find_col_end_bool = false;
            currEndItem = this.excelData[row_end ][col_end];
            let nextEndColItem = this.excelData[row_end ][col_end];
            let nextEndColIndexs = nextEndColItem[0];
            while(!currEndIndexs[1] && !find_col_end_bool) {
                currEndItem = this.excelData[row_end][col_end];
                currEndIndexs = currEndItem[0];
                nextEndColItem = this.excelData[row_end][col_end+1];
                nextEndColIndexs = nextEndColItem[0];
                if(currEndIndexs[1] === 0 && nextEndColIndexs[1] === 1) {
                    find_col_end_bool = true;
                }else if(currEndIndexs[1] === 0) {
                    col_end += 1;
                }
            }
          
            // 计算结束行
            currEndItem = this.excelData[row_end][col_end];
            currEndIndexs = currEndItem[0];
            let find_row_end_bool = false;
            let nextEndRowItem = this.excelData[row_end +1][col_end];
            let nextEndRowIndexs = nextEndRowItem[0];

            while(!currEndIndexs[0] && !find_row_end_bool) {
                currEndItem = this.excelData[row_end][col_end];
                currEndIndexs = currEndItem[0];
                nextEndRowItem = this.excelData[row_end +1][col_end];
                nextEndRowIndexs = nextEndRowItem[0];
                if(currEndIndexs[0] === 0 && nextEndRowIndexs[0] > 0) {
                    find_row_end_bool = true;
                }else if(currEndIndexs[0] === 0) {
                    row_end += 1;
                }
            }
        }

        TODO: // 左下角向上存在bug

        // 计算top包含合并区域
        if(row_start > 0) {
            for(let i= col_start;i< col_end;i++) {
                let item = this.excelData[row_start][i];
                let indexs = item && item[0];
                let topItem = this.excelData[row_start-1][i];
                let topIndexs = topItem && topItem[0];
                while(!indexs[0] && !indexs[1] && !topIndexs[0] && !topIndexs[1]) {
                    row_start -= 1;
                    item = this.excelData[row_start][i];
                    indexs = item && item[0];
                    topItem = this.excelData[row_start-1] && this.excelData[row_start-1][i];
                    if(!topItem) break;
                    topIndexs = topItem && topItem[0];
                }
            }
        }

     
        // 计算bottom包含合并区域
        for(let i= col_start;i< col_end;i++) {
            let item = this.excelData[row_end][i];
            let indexs = item && item[0];
            let bottomItem = this.excelData[row_end+1] &&  this.excelData[row_end+1][i];
            if(!bottomItem) break;
            let bottomIndexs = bottomItem && bottomItem[0];
            while(!indexs[0] && !indexs[1] && !bottomIndexs[0] && !bottomIndexs[1]) {
                row_end += 1;
                item = this.excelData[row_end][i];
                indexs = item && item[0];
                bottomItem = this.excelData[row_end+1][i];
                bottomIndexs = bottomItem && bottomItem[0];
            }
        }
        
        // 计算right包含合并区域
        for(let i= row_start;i< row_end;i++) {
            let item = this.excelData[i][col_end];
            let indexs = item && item[0];
            let rightItem = this.excelData[i][col_end+1 ];
            if(!rightItem) break;
            let rightIndexs = rightItem && rightItem[0];
            while(!indexs[0] && !indexs[1] && !rightIndexs[0] && !rightIndexs[1]) {
                col_end += 1;
                item = this.excelData[i][col_end];
                indexs = item && item[0];
                rightItem = this.excelData[i][col_end + 1];
                rightIndexs = rightItem && rightItem[0];
            }
        }

        // 计算left包含合并区域
        if(col_start > 0) {
            for(let i= row_start;i< row_end;i++) {
                let item = this.excelData[i][col_start];
                let indexs = item && item[0];
                let rightItem = this.excelData[i][col_start-1 ];
                let rightIndexs = rightItem && rightItem[0];
                while(!indexs[0] && !indexs[1] && !rightIndexs[0] && !rightIndexs[1] && col_start > 0) {
                    col_start -= 1;
                    item = this.excelData[i][col_start];
                    indexs = item && item[0];
                    rightItem = this.excelData[i][col_start + 1];
                    rightIndexs = rightItem && rightItem[0];
                }
            }    
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
        console.log(this.inputRef)

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


    getWidthByCount() {
        
    }

    updateSelAreaItemsByMerge(c_s:number, r_s:number, c_e:number, r_e: number) {
        let datas =  this.excelData;
       
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
                    change_size_w: Math.min(this.excelObject.info.width  ,  1000),
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
                        change_size_w:Math.min(this.excelObject.setting_def.columTitleDefWidth,  1000),
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
                    change_size_h: Math.min(this.excelObject.info.height , 500),
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
                        change_size_h: Math.min(this.excelObject.info.top , 500),
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
        let width = Math.min(info.width, 1000);
        let height = Math.min(info.height, 500);
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

        const ctx = this.context;
        ctx.beginPath();
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let rows = setting.row;
        let colums = setting.column;
        let rLen = rows.length;
        let cLen = colums.length;
        let currentLeft = def.columTitleDefWidth + 0.5;
        let currentTop = def.rowTitleHeight + 0.5;
        for(let row = 0;row < rLen;row++) {
            currentTop = def.rowTitleHeight+ 0.5;
            let width = colums[row];
            if(width === undefined) continue;
            for(let col=0;col< cLen;col++) {
                let height = rows[col];
                if(height === undefined) continue;
                if(col === _s[0] && row ===  _s[1]) {
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "#e0e0e0";
                    let _w = this.getMergeVal(_s[1],_e[1], colums);
                    let _h = this.getMergeVal(_s[0],_e[0], rows);
                    ctx.rect(currentLeft , currentTop ,  _w, _h );
                    ctx.fillStyle = "#fff";
                    ctx.fillRect(currentLeft, currentTop , _w,_h);
                }
                currentTop += height;
            }
            currentLeft += width;
        }
        this.reDrawSelectArea('merge');
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
        for(let i=col_start;i<=col_end;i++) {
            for(let j=row_start;j<=row_end;j++) {
                let item =  this.excelData[j] && this.excelData[j][i];
                if(item) {
                    item[0] = [1,1];
                }
            }
        }
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
            regional_sel_end:[row_start, col_start],
            regional_sel:[_l, _t, _w, _h]
        })
        this.reDrawCanvas();
        this.reDrawSelectArea();
      
    }


    // 属性设置
    setStyle(param:string, key:string, val:any) {
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
    extendedAttribute(stateParma:string) {
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

    // changeEidorVal(target:Event) {
    //     console.log(this.excelData)
    //     // if(this.excelData[this.state.editor_coordinate_x] 
    //     //     && this.excelData[this.state.editor_coordinate_y][this.state.editor_coordinate_x] ){
    //     //     this.excelData[this.state.editor_coordinate_y][this.state.editor_coordinate_x][2] =target;
    //     // }
    //     // this.setState({
    //     //     editor_coordinate_val:this.excelData[this.state.editor_coordinate_y][this.state.editor_coordinate_x][2]
    //     // })
    //     // this.test()
    // }

    sheetEditorChangeValue(value:string) {
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
        this.excelData[this.state.editor_coordinate_y][this.state.editor_coordinate_x][2] = this.editorRef.current.innerHTML || ""; 
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
            <div className="setting">
                <span className="item item-fz">
                    <div className="f-family" style={{
                        fontFamily:this.state.extended_attribute_font_family
                    }}>
                        <span className="name">
                            <span className="val">
                                {this.state.extended_attribute_font_family}
                            </span>
                        <img src={
                            REQ_IMG.Down!.default
                        } 
                        onClick={this.extendedAttribute.bind(this, 'extended_attribute_font_family_state')}
                        alt="字体" title="字体"/>
                        
                        </span>
                        {/* extended_attribute_font_style_state */}
                        {
                            this.state.extended_attribute_font_family_state && 
                            <span className="attr-familys">
                                <div className="fams">
                                { this.txtFamilys.map((family, ind) => {
                                        return <span key={ind} onClick={this.setStyle.bind(this, 'text','fontFamily',family)} className="fams-item">
                                                <span className="lab"
                                                style={{fontFamily:family}}>{family}</span>
                                            </span>
                                    })}
                                </div>  
                            </span>
                        }
                    </div>
                    <div className="f-size">
                        <span className="name">
                            <span className="val">
                                {this.state.extended_attribute_font_size}
                            </span>
                        <img src={
                            REQ_IMG.Down!.default
                        } 
                        onClick={this.extendedAttribute.bind(this, 'extended_attribute_font_size_state')}
                        alt="字体大小" title="字体大小"/>
                        </span>
                        {
                            this.state.extended_attribute_font_size_state && 
                            <span className="attr-familys f-size">
                                <div className="fams">
                                { this.txtSizes.map((size, ind) => {
                                        return <span key={ind} onClick={this.setStyle.bind(this, 'text','fontSize', size)} className="fams-item">
                                                <span className="lab">{size}</span>
                                            </span>
                                    })}
                                </div>  
                            </span>
                        }
                  
                    </div>
                </span>
                <span className="item">
                    <img onClick={
                        this.setStyle.bind(this, 'text','fontWeight',this.state.extended_attribute_font_weight === 'normal' ? 'bold' : 'normal')} 
                        src={ REQ_IMG.F_Blod!.default} 
                        className = {
                            this.state.extended_attribute_font_weight === 'bold' ? 'active': ''
                        }
                        alt="" 
                        title="粗体"/>
                    <img onClick={
                        this.setStyle.bind(this, 'text','fontStyle', this.state.extended_attribute_font_style === 'normal' ? 'italic': 'normal')} 
                        className = {
                            this.state.extended_attribute_font_style === 'italic' ? 'active': ''
                        }
                        src={ REQ_IMG.F_Ltalic!.default} 
                        alt="" 
                        title="斜体"/>
                </span>
                
                <span className="item">
                    <span className="extend-attribute">
                        <img onClick={this.extendedAttribute.bind(this, 'extended_attribute_font_color_state')} src={  REQ_IMG.F_Color!.default} alt="" title="字体颜色"/>
                        <span className="color" style={{
                            background:this.state.extended_attribute_font_color
                        }}></span>
                        {
                            this.state.extended_attribute_font_color_state && 
                            <span className="attr-cols">
                                <span className="item col">
                                    <div className="cols">
                                    { this.txtCols.map((col, ind) => {
                                            return <span key={ind} onClick={this.setStyle.bind(this, 'text','color',col)} className="col-item"
                                                style={{background:col}}></span>
                                        })}
                                    </div>
                                </span>       
                            </span>
                        }
                    </span>
                    <span className="extend-attribute">
                        <img onClick={this.extendedAttribute.bind(this, 'extended_attribute_rect_fillstyle_state')} src={ REQ_IMG.BG!.default} alt="" title="字体颜色"/>
                        <span className="color" style={{
                            background:this.state.extended_attribute_rect_fillstyle
                        }}></span>
                        {
                            this.state.extended_attribute_rect_fillstyle_state && 
                            <span className="attr-cols fillstyles">
                                <span className="item col">
                                    <div className="cols">
                                    { this.rectFillStylesCols.map((col, ind) => {
                                            return <span key={ind} onClick={this.setStyle.bind(this, 'rect','fillStyle',col) } className="col-item"
                                                style={{background:col}}></span>
                                        })}
                                    </div>
                                </span>       
                            </span>
                        }
                    </span>
                </span>
                <span className="item">
                    <img src={ REQ_IMG.F_L!.default} alt="" title="居左" onClick={this.setStyle.bind(this, 'text', 'textAlign', 'left')}/>
                    <img src={ REQ_IMG.F_C!.default} alt="" title="居中" onClick={this.setStyle.bind(this, 'text', 'textAlign', 'center')}/>
                    <img src={ REQ_IMG.F_R!.default} alt="" title="居右" onClick={this.setStyle.bind(this, 'text', 'textAlign', 'right')}/>
                </span>
                <span className="item">
                    <img onClick={this.merge.bind(this)} src={ REQ_IMG.Merge!.default} alt="" title="合并"/>
                    <img onClick={this.unMerge.bind(this)} src={ REQ_IMG.UnMerge!.default} alt="" title="取消合并"/>
                </span>
                <span className="github">
                    <a href="https://github.com/bojue/canvas-excel" target="_black">
                         <img src={REQ_IMG.GITHUB!.default} alt=""/>
                    </a>
                </span>
            </div>
            <SheetEditorBarComponent
                changeValue = { this.sheetEditorChangeValue }
                ref = { this.inputRef }
                val = { this.state.editor_coordinate_val }
                x = { this.state.editor_coordinate_x }
                y = { this.state.editor_coordinate_y }
            />
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
                            width:Math.min(parseFloat(this.state.regional_sel[2]), 1000 -parseFloat(this.state.regional_sel[0]) ) || 0,
                            left:parseFloat(this.state.regional_sel[0]) ||0,
                            top:(parseFloat(this.excelObject.setting_def.rowTitleHeight + 0.5)||0)  -2}}></span>
                    <span className="editor_coordinate c-l" 
                        style={{
                            height:Math.min(parseFloat(this.state.regional_sel[3]), 500 - parseFloat(this.state.regional_sel[1]))||0,
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
                    width={ 1000} height={500} />
                </div>
            </div>
        </div>
    }
}

export default Excel;