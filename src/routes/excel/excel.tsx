import * as React from 'react';
import { Props } from 'react';
import "./excel-setting.scss";
import "./excel-canvas.scss";
const Merge = require( './../../assets/merge.svg');
// import Merge from './../../assets/merge.svg'

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
    editorRef:any;
    style = {
        width: 1000 + 'px',
        height: 500 + 'px'
    }
    constructor(props:any) {
        super(props);
        this.excelRef = React.createRef();
        this.editorRef = React.createRef();
        this.currentLabelDOMRef = React.createRef();
        this.state = {
            // Excel下标工具栏参数
            changeSizeState: 'change_size_h',
            change_size_w:0,
            change_size_h:0,
            change_size_title_l: 0,
            change_size_title_t: 0,
            change_size_title_w:0,
            change_size_title_h:0,
            change_size_current_index:-1,
                         
            // Excel下标工具栏操作状态坐标参数
            currentLabel_left:400,
            currentLabel_top:-22,
            currentLabel_val:22,
            currentLabel_state:'w',
     
            /**
            * Excel下标/区域鼠标状态维护
            * m_up
            * m_chaneg_zize|改变大小鼠标按下
            * m_sel_area|改变区域鼠标按下
            * m_input|输入状态
            * m_enter
            */ 
            mouse_state:'m_up',

            currentLabel_mouse_state:'m_up',
            // 可输入状态DOM参数
            editor_width:0,
            editor_height:0,
            editor_top:0,
            editor_left:0,
            editor_text:"",
            editor_display:'none',
            editor_coordinate_x:0,
            editor_coordinate_y:0,

            // 工具栏下标拖拽参数
            change_size_top:0,
            change_size_left:0,
            change_size_display:0,

            // 区域选择参数
            regional_sel_x:0, // 焦点位置
            regional_sel_y:0, // 焦点位置
            regional_sel_state:0, // 选中区域状态
            regional_sel:[0,0,0,0], // _l,_t,_w,_h
            regional_sel_by_click_state:0,// 点击选中状态
            regional_sel_l:0,  // 选中区域left
            regional_sel_t:0, // 选中区域top
            regional_sel_start:[-1, -1], // 开始坐标
            regional_sel_end:[-1,1], //结束坐标
            regional_cantch_before:[0, 0], // 焦点区域位置缓存
            regional_sel_width:0,
            regional_sel_height:0,
            regional_sel_x_count:0, // 行网格数
            regional_sel_y_conut:0, // 列网格数

        }
        this.excelObject = {
            info:{
                title:"Excel",
                scalingRatio: /macintosh|mac os x/i.test(navigator.userAgent) ? 2: 1,
                width:0,
                height:0,
                left:60,
                top:25
            },
            selection_board: {
                width:0,
                height:0,
                left:0,
                top:0,
                activeRows:[],
                activeColums:[]
            },
            setting_def:{
                width:110,
                height:23,
                rowTitleHeight:25,
                columTitleDefWidth:30,
            },
            setting_custome: {
                row:[50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50],
                rowTops:[],
                column:[50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50],
                columnLefts:[]
            }
        };
    }
    componentDidMount() {
        this.getExcelCanvas();
        this.drawBorder();
        this.addLister();
        this.initExcel();
    }
    getExcelCanvas() {
        this.clientRect = this.excelRef.getBoundingClientRect();
    }
    getFillText(lineWidth:number, txt:string, ctx:CanvasRenderingContext2D) {
        if(txt === null || txt === undefined) return txt;
        let len = txt.length;
        let count = 0;
        let width = 0;                                                                                      
        for (let i = 0; i < len; i++) {
            let fontWidth = ctx.measureText(txt[i]).width; 
            if(width + fontWidth > lineWidth) {
                count = i;
                break;
            }else {
                width += fontWidth;
            }
        }
        let str = count + 1 < len ? txt.substring(0, count) : txt;
        return str;
    }
    drawBorder() {
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let startLeft = def.columTitleDefWidth;
        let ratio = this.excelObject.info.scalingRatio;
        const ctx = this.context;

        // 绘制矩形
        ctx.beginPath();
        ctx.strokeStyle = "#E6e6e6";
        ctx.rect(0.5, 0.5, def.columTitleDefWidth * ratio, def.rowTitleHeight * ratio);

        // 绘制矩形
        ctx.fillStyle = "#E6e6e6";
        ctx.fillRect(0.5, 0.5, def.columTitleDefWidth * ratio, def.rowTitleHeight * ratio);
        
        // 绘制三角形
        ctx.strokeStyle = "#b2b2b2";
        ctx.beginPath();
        ctx.moveTo(11,23);
        ctx.lineTo(27, 23)
        ctx.lineTo(27, 7);
        ctx.lineTo(11, 23);
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
            ctx.rect(colLeft, rowTop, setting.column[i] * ratio, def.rowTitleHeight * ratio);
            
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
            this.excelObject.setting_custome.columnLefts[i] = startLeft;
            if( i === setting.column.length -1) {
                this.excelObject.info.width = startLeft * ratio;
            }
        }
        // 获取Excel高度
        let startHeight = def.rowTitleHeight;
        let _h = startHeight + 0.5;
        for(let i=0;i<setting.row.length;i++) {
            _h +=  setting.row[i] ;
        }
        this.excelObject.info.height  = _h * ratio;

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
            let val = i;
            ctx.textBaseline = 'bottom';

            // 绘制底部边框
            ctx.beginPath();
            ctx.moveTo(0, rowTop  );
            ctx.lineTo( def.columTitleDefWidth* ratio, rowTop);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#bcbcbc';
            ctx.stroke();

            ctx.fillText(val++, def.columTitleDefWidth /2* ratio, rowTop + setting.row[i] * ratio - 3.5);
            startHeight += setting.row[i];
            this.excelObject.setting_custome.rowTops[i] = startHeight;
        }
        ctx.stroke();
    }
    initExcel() {
        let ratio = this.excelObject.info.scalingRatio;
        const ctx = this.context;
        ctx.beginPath();
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let rows = setting.row;
        let colums = setting.column;
        let rLen = rows.length;
        let cLen = colums.length;
        let currentTop = def.rowTitleHeight + 0.5;
        let currentLeft = def.columTitleDefWidth+ 0.5;
        let str = "";
        for(let row = 0;row <rLen;row++) {
            let height = rows[row];
            currentLeft = def.columTitleDefWidth + 0.5;
            for(let col=0;col< cLen;col++) {
                let width = colums[col];
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#d4d4d4";
                ctx.rect(currentLeft* ratio, currentTop* ratio, width* ratio, height* ratio);
                ctx.fillStyle = "#fff";
                ctx.fillRect(currentLeft* ratio, currentTop* ratio, width* ratio, height* ratio);
                ctx.fillStyle = '#000';
                let size = 10 * ratio;
                ctx.font = 'lighter '+size+'pt  微软雅黑';
                ctx.textAlign = "left";
                ctx.textBaseline = 'middle';
                str = this.getFillText( (width - 5)* ratio,"_currnet", ctx);
                ctx.fillText( str, (currentLeft + 3)* ratio , currentTop * ratio+ height /2* ratio + 0.5, (width - 5)* ratio);
                currentLeft += width;
            }
            currentTop += height;
        }
        ctx.stroke();
    }
    addLister() {
        const ctx = this.excelRef;
        ctx.addEventListener('dblclick', (e:MouseEvent)=> {
            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            this.updateEditorDOM(_eX, _eY);
            this.initSelection();
            this.editorRef.current.setAttribute("contenteditable", "true");
            this.editorRef.current.focus();
        }); 
        ctx.addEventListener('click', (e:MouseEvent)=> {
            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            this.updateSelectArea(_eX, _eY);
            // this.initSelection();
        }); 
        ctx.addEventListener('mousemove', (e:MouseEvent)=> {

            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            this.updateChangeSizeButton(_eX, _eY, e);
        }); 
        ctx.addEventListener('mousedown', (e:MouseEvent)=> {
            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            let ratio = this.excelObject.info.scalingRatio;
            this.setState({
                regional_sel_x:_eX * ratio,
                regional_sel_y:_eY * ratio
            })
            this.setState({
                regional_sel_state: 1,
            })
            this.regionalSelection(_eX, _eY);
        }); 
        ctx.addEventListener('mouseup', (e:MouseEvent)=> {
            this.setState({
                mouse_state:'m_up'
            })
        }); 
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
        this.initExcel();
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

        let ratio = this.excelObject.info.scalingRatio;
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
                        })
                    }
                    //绘制矩形
                    this.reDrawCanvas();
                    //绘制选中区域
                    this.reDrawSelectArea();
                   
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
        let col_end = Math.max(_start[1], _end[1]) 
        let _l= col_start > 0 ? setting.columnLefts[col_start -1] :  def.columTitleDefWidth;
        let _w = (setting.columnLefts.length === (col_end + 1) ) ? 
        col_start === 0 ?
        setting.columnLefts[ setting.columnLefts.length-1] -  def.columTitleDefWidth :
        setting.columnLefts[ setting.columnLefts.length -1] - setting.columnLefts[col_start  -1] :
        setting.columnLefts[col_end] - (col_start > 0 ? setting.columnLefts[col_start-1] : def.columTitleDefWidth);
        
        // 鼠标选中从下向上选中
        let row_start = Math.min(_start[0], _end[0]);
        let row_end = Math.max(_start[0], _end[0]);
        let _t=  row_start > 0 ? setting.rowTops[row_start -1] : def.rowTitleHeight;
        let _h = (setting.rowTops.length === (row_end + 1) ) ? 
            row_start === 0 ?
            setting.rowTops[ setting.rowTops.length-1] -  def.rowTitleHeight :
            setting.rowTops[ setting.rowTops.length -1] - setting.rowTops[row_start  -1] :
            setting.rowTops[row_end] - (row_start > 0 ? setting.rowTops[row_start-1] : def.rowTitleHeight);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0, 102, 0, 0.8)';
        ctx.fillStyle =  'rgba(0, 102, 0, 0.02)';
        ctx.fillRect(_l * ratio, _t * ratio, _w * ratio, _h * ratio);
        this.setState({
            regional_sel:[_l,_t,_w,_h]
        });
        this.setState({
            editor_coordinate_x:col_start,
            editor_coordinate_y:row_start
        })

        let merge_col = state === 'merge' ? col_end :col_start;
        let merge_row = state === 'merge' ? row_end : row_start;

        ctx.rect(_l * ratio, _t * ratio, _w * ratio, _h * ratio);
        ctx.fillStyle =  'rgba(0, 102, 0, 0.04)';
        ctx.fillRect(_l * ratio, _t * ratio, _w * ratio, _h * ratio);
        // 选中区域的起始网格
        ctx.fillStyle = '#fff';
        ctx.fillRect(
            _l * ratio, 
            _t * ratio, 
            (setting.columnLefts[merge_col] - _l) * ratio,
            (setting.rowTops[merge_row] -_t) * ratio);

        // ctx.fillStyle = '#000';
        // let size = 10 * ratio;
        // ctx.textAlign = "left";
        // ctx.font = 'lighter '+size+'pt  微软雅黑';
        // ctx.textBaseline = 'middle';
        // ctx.fillText("(" +merge_row  +"," +merge_col+")"  + "_" + _t + "_" + _l,   _l * ratio, _t * ratio +   (setting.rowTops[merge_col] -_t) * ratio /2, _w * ratio, _h * ratio)
    
        ctx.stroke();
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
                        currentLabel_left: this.excelObject.setting_def.columTitleDefWidth+ 'px',
                        change_size_top:top ,
                        change_size_left:0,
                        change_size_display:'block'
                    })
                }
            } 
        }else  {
            
        // :{
        //     width:110,
        //     height:23,
        //     rowTitleHeight:25,
        //     columTitleDefWidth:30,
        // },
            
            // 设置纵向
            if(event.buttons === 1 && currentIndex > -1) {
                this.setState({
                    changeSizeState:'change_size_w',
                    change_size_h: Math.min(this.excelObject.info.height /  ratio, 500),
                    change_size_w:1,
                    change_size_title_l: -2 * ratio,
                    change_size_title_t:0,
                    change_size_title_w:4* ratio ,
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
                        change_size_title_l:-2 * ratio,
                        change_size_title_t: 0,
                        change_size_title_w: 4* ratio,
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
    
    changeSizeByDrag(e:MouseEvent){
        if(e.type === 'mouseleave' && e.buttons === 0) {

        }
        e.stopPropagation();
        let _eX = e.clientX - this.clientRect.x;
        let _eY = e.clientY - this.clientRect.y;
        let tit_h = this.excelObject.setting_def.rowTitleHeight;
        let tit_w = this.excelObject.setting_def.columTitleDefWidth;
        let ratio =  this.excelObject.info.scalingRatio; // canvas画板缩放比例
        let change_type = ''
        if(tit_h < _eY && tit_w >= _eX) {
            change_type = 'h'
        }else if(tit_w < _eX && tit_h >= _eY) {
            change_type = 'w'
        }
        let def = this.excelObject.setting_def;

        // :{
        //     width:110,
        //     height:23,
        //     rowTitleHeight:25,
        //     columTitleDefWidth:30,
        // },
        if(['mousedown','mouseenter'].indexOf(e.type)>-1 ) {
            let index = change_type === 'w' ?
                        this.excelObject.setting_custome.columnLefts.indexOf(_eX) :
                        this.excelObject.setting_custome.rowTops.indexOf(_eY);
            if(index > -1) {
                if(change_type === 'w') {
                    let _left = this.excelObject.setting_custome.columnLefts[this.state.change_size_current_index -1] || this.excelObject.setting_def.columTitleDefWidth;
                    let _width = Math.max(_eX - _left, 2);
                    this.setState({
                        change_size_w:1,
                        change_size_h: Math.min(this.excelObject.info.top / ratio, 500),
                        change_size_top:0,
                        change_size_title_l:-2 * ratio,
                        change_size_title_t: 0,
                        change_size_title_w: 4* ratio + 1,
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
                    let _height  = Math.max(_eY - _top, 2);
                    this.setState({
                        change_size_h: 1,
                        change_size_w:Math.min(this.excelObject.info.width / this.excelObject.info.scalingRatio, 1000),
                        change_size_current_index:index,
                        currentLabel_val:_height,
                        currentLabel_top:_top + 'px',
                        currentLabel_left: this.excelObject.setting_def.columTitleDefWidth+ 'px',
                        change_size_top: _eY,
                        change_size_left:0 + 'px',
                        change_size_display:'block',
                        changeSizeState:'change_size_h',
                    })
                }
            }
        }else if(e.type === 'mouseup') {
            if(this.state.change_size_current_index > -1) {
                if(this.state.changeSizeState === 'change_size_w') { 
                    let _left = this.excelObject.setting_custome.columnLefts[this.state.change_size_current_index -1] || this.excelObject.setting_def.columTitleDefWidth;
                    this.excelObject.setting_custome.column[this.state.change_size_current_index]  = Math.max(_eX - _left, 2)
                    this.setState({
                        change_size_w:1,
                        change_size_h: Math.min(this.excelObject.info.top / ratio, 500),
                        change_size_top:0,
                        change_size_title_l:-2 * ratio,
                        change_size_title_t: 0,
                        change_size_title_w: 4* ratio,
                        change_size_title_h: def.rowTitleHeight,
                        mouse_state:'m_up'
                    })
                }else {
                    this.setState({
                        change_size_w:1,
                        change_size_h: Math.min(this.excelObject.info.top / ratio, 500),
                        change_size_top:0,
                        change_size_title_l:-2 * ratio,
                        change_size_title_t: 0,
                        change_size_title_w: 4* ratio,
                        change_size_title_h: def.rowTitleHeight,
                        mouse_state:'m_up'
                    })
                    let _top = this.excelObject.setting_custome.rowTops[this.state.change_size_current_index -1] || this.excelObject.setting_def.rowTitleHeight
                    this.excelObject.setting_custome.row[this.state.change_size_current_index]  = Math.max(_eY - _top,2);
                }
            }
            this.reDrawCanvas();
            // this.updateEditorDOM(-1, -1,'changeSize');
            this.updateSelectArea(_eX, _eY);
        }
    }



    updateEditorDOM(left:number,top:number, state ?:string) {
        let info = this.excelObject.info;
        if(state !== 'changeSize') {
            if(!(left > info.left && left < info.width || 
                0 <= top && top < info.top )){
                console.info("请点击Excel区域");
                return;
            }
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
                    ctx.fillStyle = '#000';
                    ctx.font = "10pt serif";
                    ctx.textAlign = "center";
                    ctx.fillText(col + "-" + row + new Date().getTime(),currentLeft * ratio + _w /2 , currentTop * ratio+ _h/2 )
                }
                currentTop += height;
            }
            currentLeft += width;
        }
        
        ctx.stroke();
        this.reDrawSelectArea('merge');
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

    render() {
        return<> 
        <div className="setting">
            <span className="item">
                <span className="merge s_img" onClick={this.merge.bind(this)}>
                    <img src={ Merge } alt="" title="合并"/>
                </span>
            </span>
            <span className="item">
                {this.state.mouse_state}
            </span>
        </div>
        <div className="excel_body">
            <span className="current_coordinate"> {(String.fromCharCode(65 +this.state.editor_coordinate_x ))}{this.state.editor_coordinate_y}</span>
            {/* 输入编辑组件 */}
            <div className="editor_content" >
                <div 
                    className={`editor_excel`} 
                    ref={this.editorRef}
                    id="editorRef"
                    style={{ 
                        height:this.state.editor_height + 4,
                        width:this.state.editor_width + 4,
                        top:this.state.editor_top -2,
                        left:this.state.editor_left - 2,
                        display:this.state.editor_display
                    }}
                    suppressContentEditableWarning = {true}>
                    <span className="content">{this.state.editor_width + "_" +this.state.editor_top+'_'+this.state.editor_left+'_'+this.state.editor_display}</span>
                </div>
                <span className="editor_coordinate c-t" 
                    style={{
                        width:this.state.regional_sel[2],
                        left:this.state.regional_sel[0],
                        top:this.excelObject.setting_def.rowTitleHeight  -2}}></span>
                <span className="editor_coordinate c-l" 
                    style={{
                        height:this.state.regional_sel[3],
                        top:this.state.regional_sel[1],
                        left:this.excelObject.setting_def.columTitleDefWidth  -2 }}></span>
            </div>

            {/* Excel下标工具栏拖拽组件*/}
            <div className={`change_size  ${this.state.changeSizeState}`} 
                onMouseUp={this.changeSizeByDrag.bind(this)}
                onMouseDown={this.changeSizeByDrag.bind(this)}
                onMouseEnter={this.changeSizeByDrag.bind(this)}
                onMouseLeave={this.changeSizeByDrag.bind(this)}
                style={{
                    top:this.state.change_size_top,
                    left:this.state.change_size_left ,
                    width:this.state.change_size_title_w
                    // display:this.state.change_size_display
                }}>
                <span className="title" style={{
                    top: this.state.change_size_title_t, 
                    left:this.state.change_size_title_l,
                    width:this.state.change_size_title_w , 
                    height:this.state.change_size_title_h}}></span>
                <span className="content" style={{width:this.state.change_size_w , height:this.state.change_size_h}}></span>
            </div>

            {/* Excle下标工具栏拖拽坐标组件 */}
            <div ref={this.currentLabelDOMRef} 
                style={{left:this.state.currentLabel_left,top:this.state.currentLabel_top ,
                  display:this.state.mouse_state === 'm_up'?'none':'block'}} className="currentLabel">
                    <label className="lab">{this.state.changeSizeState === 'change_size_w' ? '宽度': '高度'}:</label>
                    <span className="val">{this.state.currentLabel_val} 像素 </span>
            </div>

            {/* Excel画布 */}
            <canvas id="canvas_excle" ref={(c) => {this.excelRef = c;this.context = c && c.getContext('2d')}} 
                style={this.style}  width={this.excelObject.info.scalingRatio * 1000} height={this.excelObject.info.scalingRatio * 500} />
        </div>
        </>
    }
}

export default Excel;