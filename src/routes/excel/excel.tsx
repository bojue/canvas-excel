import * as React from 'react';
import "./style/e-setting.scss";
import "./style/e-current.scss";
import "./style/e-content.scss";

const Merge = require( './../../assets/merge.svg');
const F_Blod = require( './../../assets/f_b.svg');
const F_Ltalic = require( './../../assets/f_i.svg');
const F_Under = require( './../../assets/f_ul.svg');
const F_C = require( './../../assets/f_c.svg');
const F_L = require( './../../assets/f_l.svg');
const F_R = require( './../../assets/f_r.svg');
const BG = require( './../../assets/bg.svg');
const F_Color = require( './../../assets/f_color.svg');
const GITHUB = require( './../../assets/github.svg');
const Down = require( './../../assets/down.svg');

import { excelObjectModel } from "./models/excel-object";
import { excelStateModel } from './models/excel-state';
import { excelItemModel } from './models/excel-item';
import { excelDataModel } from './models/excel-data';

import { drawMergeText, drawText} from './service/excel-draw-text';
import { cpus } from 'os';
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
    style = {
        width: 1000 + 'px',
        height: 500 + 'px'
    }
    txtCols:any[];
    txtFamilys:any[];
    txtSizes:any[];
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
        this.txtCols = [
            'rgb(0,0,0)',
            'rgb(66, 133, 244)',
            'rgb(70, 189, 198)',
            'rgb(52, 168, 83)',
            'rgb(251, 188, 4)',
            'rgb(255, 109, 1)',
            'rgb(234, 67, 53)',
        ],
        this.rectFillStylesCols = [
            'rgb(255, 255, 255)',
            'rgb(70, 189, 198)',
            'rgb(52, 168, 83)',
            'rgb(251, 188, 4)',
            'rgb(255, 109, 1)',
            'rgb(234, 67, 53)',
        ],
        this.txtFamilys = [
            "微软雅黑",
            "楷体",
            "黑体",
            "宋体",
            "仿宋",
            "华文楷体",
            "Agency FB"
        ],
        this.txtSizes = [
            8,
            10,
            12,
            14,
            16,
            18,
            20
        ]
    }


    updateExcelDataByItem(x:number, y:number,coordinate:any[],type:string, val:string, setting?:object ) {
        this.excelData[x][y] = JSON.parse(JSON.stringify([coordinate, type, val, setting || this.excelData[x] && this.excelData[x][y] && this.excelData[x][y][3] || excelItemModel[3]]));
    }
    
    componentDidMount() {
        this.getExcelCanvas();
        this.drawBorder();
        this.addLister();
        this.initExcelCanvas();
    }
    getExcelCanvas() {
        this.clientRect = this.excelRef.getBoundingClientRect();
    }

    drawBorder() {
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let startLeft = def.columTitleDefWidth;
        let ratio = this.excelObject.info.scalingRatio;
        const ctx = this.context;
        ctx.beginPath();
        // 绘制矩形
        ctx.fillStyle = "#E6e6e6";
        ctx.fillRect(0.5, 0.5, def.columTitleDefWidth * ratio + 0.5, def.rowTitleHeight * ratio + 0.5);
        
        // 绘制三角形
        ctx.strokeStyle = "#b2b2b2";
        ctx.beginPath();
        ctx.moveTo(11 * ratio,23 * ratio);
        ctx.lineTo(27 * ratio, 23 * ratio)
        ctx.lineTo(27 * ratio, 7 * ratio);
        ctx.lineTo(11 * ratio, 23 * ratio);
        ctx.fillStyle = "#b4b4b4";
        ctx.fill();
   
        // 绘制边框
        ctx.beginPath();
        ctx.moveTo(def.columTitleDefWidth * ratio + 0.5, 0  );
        ctx.lineTo(def.columTitleDefWidth * ratio + 0.5, def.rowTitleHeight * ratio );
        ctx.beginPath();
        ctx.moveTo(def.columTitleDefWidth * ratio + 0.5, 0  );
        ctx.lineTo(def.columTitleDefWidth * ratio + 0.5, def.rowTitleHeight * ratio );
        ctx.strokeStyle = '#bcbcbc';
        ctx.stroke();

        // 绘制上侧统计列工具栏
        for(let i=0;i<setting.column.length;i++) {
            let colLeft = startLeft * ratio+ 0.5;
            let rowTop = 0.5;

            //绘制边框
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#b2b2b2";
            ctx.rect(colLeft, rowTop - 0.5, setting.column[i] * ratio, def.rowTitleHeight * ratio);
            
            //绘制矩形
            ctx.fillStyle = "#E6e6e6";
            ctx.fillRect(colLeft, rowTop, setting.column[i] * ratio,  def.rowTitleHeight * ratio) ;
            
            //绘制文本
            ctx.fillStyle = '#000';
            let size = 10 * ratio;
            ctx.font = 'lighter '+size+'pt  微软雅黑';
            ctx.textAlign = "center";
            ctx.textBaseline = 'bottom';
            ctx.fillText(String.fromCharCode((65 + i)),  startLeft * ratio + setting.column[i] /2 * ratio, def.rowTitleHeight * ratio - 3.5 );

            //绘制右边框
            ctx.beginPath();
            ctx.moveTo(colLeft +setting.column[i] * ratio, 0  );
            ctx.lineTo(colLeft +setting.column[i] * ratio,  def.rowTitleHeight * ratio);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#b9b9b9';
            ctx.stroke();
            startLeft += setting.column[i];
            if( i === setting.column.length -1 || startLeft > 1000) {
                this.excelObject.info.width = startLeft * ratio;
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
            let rowTop = startHeight * ratio + 0.5;

            // 绘制矩形
            ctx.fillStyle = "#E6e6e6";
            ctx.fillRect(colLeft, rowTop,  def.columTitleDefWidth* ratio, setting.row[i]* ratio);

            // 绘制文字
            let size = 10 * ratio;
            ctx.fillStyle = '#000';
            ctx.font = 'lighter '+size+'pt  微软雅黑';
            ctx.textAlign = "center";
            let val =  1+i;
            ctx.textBaseline = 'bottom';

            // 绘制底部边框
            ctx.beginPath();
            ctx.moveTo(0, rowTop  );
            ctx.lineTo( def.columTitleDefWidth* ratio, rowTop);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#bcbcbc';
            ctx.textBaseline = "middle";
            ctx.fillText(val++, def.columTitleDefWidth /2* ratio, rowTop + setting.row[i] * ratio / 2);
            ctx.stroke();
            startHeight += setting.row[i];
            if( i === setting.row.length -1 || startHeight > 500) {
                this.excelObject.info.height = startHeight * ratio;
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

    
    initExcelCanvas() {
        const ratio = this.excelObject.info.scalingRatio;
        const ctx = this.context;
        ctx.beginPath();
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let rows = setting.row;
        let colums = setting.column;
        let rLen = rows.length;
        let cLen = colums.length;
        let currentTop = def.rowTitleHeight;
        let currentLeft = def.columTitleDefWidth;
        let str = "";
        currentLeft = def.columTitleDefWidth;
        for(let col=0;col< cLen && currentLeft <= 1000;col++) {
            if(!(this.excelData && this.excelData[col])) {
                this.excelData[col] = [];
            }
  
            let width = colums[col];
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#ccc";
            currentTop = def.rowTitleHeight ;
            for(let row = 0;row <rLen && currentTop <= 500;row++) {
                let height = rows[row];
                if(this.excelData &&this.excelData[col] && this.excelData[col][row]){
                    str = this.excelData &&this.excelData[col] && this.excelData[col][row] &&  this.excelData[col][row][2];
                }else {
                    this.excelData[col][row] = excelItemModel || [];
                    str = (col+1)  +' - '+ (row+1);
                }
                ctx.rect(currentLeft* ratio +0.5 , currentTop* ratio + 0.5, width* ratio, height* ratio);
                ctx.fillStyle = this.excelData &&this.excelData[col] && this.excelData[col][row] ?
                                this.excelData[col][row][3]['rect']['fillStyle']:
                                "#fff"
                ctx.fillRect(currentLeft* ratio, currentTop* ratio, width* ratio, height* ratio);
                this.updateExcelDataByItem(col, row, [col, row, 1, 1], 'txt', str)
                drawText(ctx, this.excelData[col][row], col, row, str, ratio, currentLeft, currentTop, height, width);
                currentTop += height;
            }
            currentLeft += width;
        }
        ctx.stroke();
    }

    updateExcelCanvas() {
        const ratio = this.excelObject.info.scalingRatio;
        const ctx = this.context;
        ctx.beginPath();
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let rows = setting.row;
        let colums = setting.column;
        let rLen = rows.length;
        let cLen = colums.length;
        let currentTop = def.rowTitleHeight;
        let currentLeft = def.columTitleDefWidth;
        let str = "";
        currentLeft = def.columTitleDefWidth;
        for(let col=0;col< cLen && currentLeft <= 1000;col++) {
            if(!(this.excelData && this.excelData[col])) {
                this.excelData[col] = [];
            }
            let width = colums[col];
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#ccc";
            currentTop = def.rowTitleHeight ;
            for(let row = 0;row <rLen && currentTop <= 500;row++) {
                let height = rows[row];
                if(this.excelData &&this.excelData[col] && this.excelData[col][row]){
                    str = this.excelData &&this.excelData[col] && this.excelData[col][row] &&  this.excelData[col][row][2];
                }else {
                    this.excelData[col][row] = excelItemModel || [];
                    str = (col+1)  +' - '+ (row+1);
                }
                ctx.rect(currentLeft* ratio +0.5 , currentTop* ratio + 0.5, width* ratio, height* ratio);
                ctx.fillStyle = this.excelData &&this.excelData[col] && this.excelData[col][row] ?
                                this.excelData[col][row][3]['rect']['fillStyle']:
                                "#fff"
                ctx.fillRect(currentLeft* ratio, currentTop* ratio, width* ratio, height* ratio);
                this.updateExcelDataByItem(col, row, [col, row, 1, 1], 'txt', str)
                drawText(ctx, this.excelData[col][row], col, row, str, ratio, currentLeft, currentTop, height, width);
                currentTop += height;
            }
            currentLeft += width;
        }
        ctx.stroke();
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
            let ratio =  this.excelObject.info.scalingRatio; // canvas画板缩放比例
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
            let ratio = this.excelObject.info.scalingRatio;
            this.setState({
                regional_sel_x:_eX * ratio,
                regional_sel_y:_eY * ratio,
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
        let ratio = this.excelObject.info.scalingRatio;
        let setting = this.excelObject.setting_custome;
        let index = -1;
        if(change_type === 'w') {
            index = current_index || this.excelObject.setting_custome.columnLefts.indexOf(_eX);
        }else if(change_type === 'h') {
            index = current_index || this.excelObject.setting_custome.rowTops.indexOf(_eY)
        }

        if(index > -1) {
            if(change_type === 'w') {
                let _left = this.excelObject.setting_custome.columnLefts[this.state.change_size_current_index -1] || this.excelObject.setting_def.columTitleDefWidth;
                let _width = Math.max(_eX - _left, 2);
                setting.column[this.state.change_size_current_index]  = Math.max(_eX - _left, 2)
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
        let ratio = this.excelObject.info.scalingRatio;
        let change_type = this.state.mouse_event_type;
        let setting = this.excelObject.setting_custome;
        if(change_type === 'w') { 
            let _left = setting.columnLefts[this.state.change_size_current_index -1] || this.excelObject.setting_def.columTitleDefWidth;
            setting.column[this.state.change_size_current_index]  = Math.max(_eX - _left, 2)
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
            this.updateEditorDOM(_eX, _eY, 'changeSize');
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
        this.updateExcelCanvas();
    }

    reDragSelAreaByTitle(index:number, width:number) {
        let ctx = this.context;
        let ratio = this.excelObject.info.scalingRatio;
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let left = setting.columnLefts[index-1] || def.columTitleDefWidth;
        let top = setting.rowTops[index -1] || def.rowTitleHeight;
        ctx.fillStyle = '#ccc';
        ctx.font = 'bold '+(11 * ratio)+'pt  微软雅黑';
        ctx.textAlign = "center";
        ctx.textBaseline = 'bottom';
  
        if(this.state.regional_sel_by_title_state === 'x') {
            ctx.fillRect(
                left  * ratio + 0.5, 
                 1, 
                ( width- 0.5) * ratio,
                (def.rowTitleHeight- 0.5) * ratio);
            ctx.fillStyle = '#000';
            ctx.fillText(String.fromCharCode((65 + index)),  left * ratio + setting.column[index] /2 * ratio, def.rowTitleHeight * ratio - 3.5 );
        }else if(this.state.regional_sel_by_title_state === 'y') {
            ctx.fillRect(
                0, 
                top+0.5, 
                (def.columTitleDefWidth- 0.5) * ratio,
                (setting.rowTops[index] - top - 0.5) * ratio);
            ctx.fillStyle = '#000';
            ctx.textBaseline = "middle";
            let val = index+1;
            ctx.fillText(val, def.columTitleDefWidth /2* ratio,top * ratio+ setting.row[index] * ratio /2);
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
        // let ratio = this.excelObject.info.scalingRatio;
        if(def.columTitleDefWidth <= left && left <= 1000 && 0<= top && top <def.rowTitleHeight ) {
            let _cl = def.columTitleDefWidth;
            for(let col=0;col< cLen;col++) {
                let _w = colums[col];
                if(_cl <= left && left <= _cl + _w) {
                    if(this.state.regional_sel_by_title_state !== 'x' || this.state.regional_sel_by_title_index !== col) {
                        this.setState({
                            regional_sel_by_title_state: 'x',
                            regional_sel_by_title_index: col
                        });
                        let _rowList = this.excelData && this.excelData[col];
                        let len = _rowList && Array.isArray(_rowList) && _rowList.length;
                        if(!!len) {
                            this.setState({
                                regional_sel_start:[0,col],
                                regional_sel_end:[len-1, col],
                            })
                            this.reDrawCanvas();
                            this.reDrawSelectArea();
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
                        regional_sel_by_title_index: row
                    })
                    let len = this.excelData && Array.isArray(this.excelData) && this.excelData.length;
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
                                regional_sel_by_title_index: null
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
    reDrawSelectArea(state?:string | 'merge') {
        const ctx = this.context;
        let ratio = this.excelObject.info.scalingRatio;
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
        ctx.lineWidth = 2 * ratio;
        ctx.strokeStyle = 'rgba(0, 102, 0, 0.8)';
        ctx.fillStyle =  'rgba(0, 102, 0, 0.02)';
        ctx.fillRect(_l * ratio, _t * ratio, _w * ratio, _h * ratio);
        this.setState({
            regional_sel:[_l,_t,_w,_h]
        });
        let currentItem =  this.excelData[col_start][row_start];
        if(col_start > -1 && row_start > -1) {
            this.setState({
                editor_coordinate_x:col_start,
                editor_coordinate_y:row_start,
                editor_coordinate_val:currentItem[2],
                extended_attribute_font_color:currentItem[3]['text']['color'], 
                extended_attribute_font_weight:currentItem[3]['text']['fontWeight'], 
                extended_attribute_font_style:currentItem[3]['text']['fontStyle'], 
            })
        } 
        let merge_col = state === 'merge' ? col_end :col_start;
        let merge_row = state === 'merge' ? row_end : row_start;

        ctx.rect(_l * ratio, _t * ratio, _w * ratio, _h * ratio);
        ctx.fillStyle =  'rgba(0, 102, 0, 0.04)';
        ctx.fillRect(_l * ratio, _t * ratio, _w * ratio, _h * ratio);

        // 选中区域的起始网格
        ctx.fillStyle = '#fff';
        ctx.fillRect(
            _l * ratio  + 0.5, 
            _t * ratio + 0.5, 
            (setting.columnLefts[merge_col] - _l - 0.5) * ratio,
            (setting.rowTops[merge_row] - _t - 0.5) * ratio);
        if(state === 'merge') {
            this.excelData[row_start ][col_start][2] = this.inputRef.value;
        }
        // 绘制左上角起始单元格内容
        drawMergeText(ctx, this.excelData[ col_start  ][row_start], merge_row, merge_col, _l + 0.5, _t + 0.5, setting, ratio);
        ctx.stroke();
        this.inputRef.value = this.excelData[ col_start][ row_start ][2];
    } 

    updateChangeSizeButton(left:number, top:number, event:MouseEvent) {
        //当前选中下标
        let currentIndex = this.state.change_size_current_index;
        // 初始化计算数据
        let info = this.excelObject.info;
        let ratio =  this.excelObject.info.scalingRatio; // canvas画板缩放比例
        let infoTop = info.top / ratio;
        let infoLeft = info.left / ratio;

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
                    change_size_w: Math.min(this.excelObject.info.width /ratio ,  1000),
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
                    change_size_h: Math.min(this.excelObject.info.height /  ratio, 500),
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
                        change_size_h: Math.min(this.excelObject.info.top / ratio, 500),
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
        let cols = setting.column;
        let rows = setting.row;
        let _l = def.columTitleDefWidth;
        let _t = def.rowTitleHeight;
        let _w = 0;
        let _h = 0;
        let _c_x = 0;
        let _c_y = 0;
        for(let i=0; i<cols.length;i++) {
            let col = cols[i];
            if(state === 'changeSize' && i === this.state.editor_coordinate_x) {
                _w = col;
                break;
            }else if(_l<= left &&  left < _l+ col){
                _w = col;
                _c_x = i;
                break;
            } 
            _l += col;
        }
        for(let i=0; i<rows.length;i++) {
            let row = rows[i];
            if(state === 'changeSize' && i === this.state.editor_coordinate_y) {
                _h = row;
                break;
            }else if(_t <= top && top < _t+ row){
                _h = row;
                _c_y = i;
                break;
            }
            _t += row;
        }
        this.setState({
            editor_text:"",
            editor_display:'block',
            editor_width:_w,
            editor_height:_h ,
            editor_top:_t ,
            editor_left:_l,
            editor_coordinate_x: state === 'changeSize' ? this.state.editor_coordinate_x: _c_x, 
            editor_coordinate_y:state === 'changeSize' ? this.state.editor_coordinate_y:_c_y
        })
    
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
        // 初始状态判断
        let _s = this.state.regional_sel_start;
        let _e = this.state.regional_sel_end;
        let _arr = [..._s,..._e];
        if(_arr.indexOf(-1) > -1) return;

        const ctx = this.context;
        let ratio = this.excelObject.info.scalingRatio;
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
            for(let col=0;col< cLen;col++) {
                let height = rows[col];
                if(col === _s[0] && row ===  _s[1]) {
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "#e0e0e0";
                    let _w = this.getMergeVal(_s[1],_e[1], colums, ratio);
                    let _h = this.getMergeVal(_s[0],_e[0], rows, ratio);
                    ctx.rect(currentLeft * ratio, currentTop * ratio,  _w, _h );
                    ctx.fillStyle = "#fff";
                    ctx.fillRect(currentLeft * ratio, currentTop * ratio, _w,_h);
                }
                currentTop += height;
            }
            currentLeft += width;
        }
        ctx.stroke();
        this.reDrawSelectArea('merge');
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
                let item = this.excelData[i];
                if( item[j][3][param][key] !== val) {
                    item[j][3][param][key] = val;
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
                   this.excelData[this.state.editor_coordinate_x][this.state.editor_coordinate_y] && 
                   this.excelData[this.state.editor_coordinate_x][this.state.editor_coordinate_y][3];
        if(!data) return;
        return data[type][param];
    }

    // 计算合并网格大小
    getMergeVal(start:number, end:number, arr:[], ratio:number) {
        let val = 0;
        let len = end - start;
        for(let i=start; i<=end;i++) {
            val += arr[i];
        }

        return val * ratio;
    }

    onChange(e:Event) {
        let target =  e.target as HTMLTextAreaElement;
        if(this.excelData[this.state.editor_coordinate_x] 
        && this.excelData[this.state.editor_coordinate_x][this.state.editor_coordinate_y] ){
            this.excelData[this.state.editor_coordinate_x][this.state.editor_coordinate_y][2] = target.value || target.innerHTML;
        }
        this.setState({
            editor_coordinate_val:this.excelData[this.state.editor_coordinate_x][this.state.editor_coordinate_y][2]
        })
        this.updateExcelItemByInput('merge');
    }

    onInput() {
        this.setState({
            editor_coordinate_val: this.editorRef.current.innerHTML
        })        
    }

    updateInputVal() {  
        this.onInput();
        this.excelData[this.state.editor_coordinate_x][this.state.editor_coordinate_y][2] = this.editorRef.current.innerHTML;
    }

    updateExcelItemByInput(state:string) {
        const ctx = this.context;
        let def = this.excelObject.setting_def;
        let ratio = this.excelObject.info.scalingRatio;
        let setting = this.excelObject.setting_custome;
        let _l= this.state.editor_coordinate_x > 0 ? setting.columnLefts[this.state.editor_coordinate_x -1] :  def.columTitleDefWidth;
        let _t=  this.state.editor_coordinate_y > 0 ? setting.rowTops[this.state.editor_coordinate_y -1] : def.rowTitleHeight;
        ctx.beginPath();
        ctx.lineWidth = 12 * ratio;
        ctx.fillStyle = '#fff';
        ctx.fillRect(
            _l * ratio, 
            _t * ratio, 
            (setting.columnLefts[this.state.editor_coordinate_x] - _l) * ratio,
            (setting.rowTops[this.state.editor_coordinate_y] -_t) * ratio);
        ctx.fillStyle = '#fff';

        // 绘制左上角起始单元格内容
        drawMergeText(ctx, this.excelData[this.state.editor_coordinate_x][this.state.editor_coordinate_y], this.state.editor_coordinate_y, this.state.editor_coordinate_x, _l, _t, setting, ratio)
        ctx.stroke();
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
                            Down && Down.default
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
                            Down && Down.default
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
                        src={ F_Blod && F_Blod.default} 
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
                        src={ F_Ltalic && F_Ltalic.default} 
                        alt="" 
                        title="斜体"/>
                </span>
                
                <span className="item">
                    <span className="extend-attribute">
                        <img onClick={this.extendedAttribute.bind(this, 'extended_attribute_font_color_state')} src={ F_Color && F_Color.default} alt="" title="字体颜色"/>
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
                        <img onClick={this.extendedAttribute.bind(this, 'extended_attribute_rect_fillstyle_state')} src={ BG && BG.default} alt="" title="字体颜色"/>
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
                    <img src={ F_L && F_L.default} alt="" title="居左" onClick={this.setStyle.bind(this, 'text', 'textAlign', 'left')}/>
                    <img src={ F_C && F_C.default} alt="" title="居中" onClick={this.setStyle.bind(this, 'text', 'textAlign', 'center')}/>
                    <img src={ F_R && F_R.default} alt="" title="居右" onClick={this.setStyle.bind(this, 'text', 'textAlign', 'right')}/>
                </span>
                <span className="item">
                    <img onClick={this.merge.bind(this)} src={ Merge && Merge.default} alt="" title="合并"/>
                </span>
                <span className="github">
                    <a href="https://github.com/bojue/canvas-excel" target="_black">
                         <img src={GITHUB && GITHUB.default} alt=""/>
                    </a>
                </span>
            </div>
            <div className="current">
                <div className="item">
                    <span className="current_coordinate"> {(String.fromCharCode(65 +this.state.editor_coordinate_x ))}{this.state.editor_coordinate_y}</span>
                </div>
                <div className="item">
                    <input type="val" 
                        onChange ={this.onChange.bind(this)}
                        ref={input => this.inputRef = input} 
                        value={ this.state.editor_coordinate_val }/>
                </div>
            </div>
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
                            background: this.getInputItemStyle('rect', 'fillStyle')
                        }}
                        onInput ={this.onInput.bind(this)}
                        onBlur={this.updateInputVal.bind(this)}
                        suppressContentEditableWarning = {true}
                        dangerouslySetInnerHTML={{__html:this.excelData[this.state.editor_coordinate_x] 
                            && this.excelData[this.state.editor_coordinate_x][this.state.editor_coordinate_y] && this.excelData[this.state.editor_coordinate_x][this.state.editor_coordinate_y][2] }}               
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
                            left:parseFloat(this.excelObject.setting_def.columTitleDefWidth ) -2 ||0}}></span>
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
                        <span className="val">{this.state.currentLabel_val} 像素 </span>
                </div>

                {/* Excel画布 */}
                <div className="content">
                    <canvas id="canvas_excle" ref={(c) => {this.excelRef = c;this.context = c && c.getContext('2d')}} 
                        style={this.style}  width={parseFloat(this.excelObject.info.scalingRatio) * 1000} height={this.excelObject.info.scalingRatio * 500} />
                </div>
            </div>
        </div>
    }
}

export default Excel;