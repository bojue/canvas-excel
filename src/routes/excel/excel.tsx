import * as React from 'react';
import { Props } from 'react';
import "./excel.scss";
import { settings } from 'cluster';

export interface Txt {
    v:string;
    x:number;
    y:number;
}

class Excel extends React.Component<any, any>  {
    excelRef:any;
    editorDOMRef:any;
    changeSizeDOMRef:any;
    clientRect:DOMRect;
    excelObject:any;
    currentLabelDOMRef:any;
   
    constructor(props:any) {
        super(props);
        this.excelRef = React.createRef();
        this.changeSizeDOMRef = React.createRef();
        this.editorDOMRef = React.createRef();
        this.currentLabelDOMRef = React.createRef();
        this.state = {
            changeSizeState: 'change_size_h',
            change_size_w:0,
            change_size_h:0,
            change_size_current_index:-1,
            currentLabel_left:400,
            currentLabel_top:-22,
            currentLabel_val:22,
            currentLabel_state:'w'
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
                rowLen:15,
                columnLen:5,
                rowTitleHeight:25,
                columTitleDefWidth:30,
            },
            setting_custome: {
                row:[23,123,53,130,49,40,23,23,23,23],
                rowTops:[],
                column:[110,110,110,110,110,110,110,110],
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
            this.excelObject.setting_custome.columnLefts[i] =startLeft;
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
                ctx.textAlign = "center";
                ctx.textBaseline = 'middle';
                ctx.fillText(col + "_" + row ,currentLeft * ratio+ width /2* ratio, currentTop * ratio+ height /2* ratio + 0.5);
                currentLeft += width;
            }
            currentTop += height;
        }
        ctx.stroke();
    }
    addLister() {
        const ctx = this.excelRef;
        ctx.addEventListener('click', (e:MouseEvent)=> {
            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            this.updateEditorDOM(_eX, _eY)
        }); 
        ctx.addEventListener('mousemove', (e:MouseEvent)=> {
            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            this.updateChangeSizeButton(_eX, _eY, e)
        }); 
    }
    initDomState() {
        let changeSizeDOM =  this.changeSizeDOMRef.current;
        changeSizeDOM.style.display = 'none';
    }
    updateChangeSizeButton(left:number, top:number, event:MouseEvent) {
        //拖拽改变大小的DOM
        let dom =  this.changeSizeDOMRef.current;
        //当前选中下标
        let currentIndex = this.state.change_size_current_index;
        if(currentIndex > -1 ) return;

        // 初始化计算数据
        let info = this.excelObject.info;
        let ratio =  this.excelObject.info.scalingRatio; // canvas画板缩放比例
        let infoTop = info.top / ratio;
        let infoLeft = info.left / ratio;

        if(!(left > infoLeft && top <= infoTop ||  top > infoTop && left <= infoLeft)) {
            this.initDomState();
            return;
        };
        let _left = this.excelObject.setting_custome.columnLefts[ -1] || 
                    this.excelObject.setting_def.columTitleDefWidth ;
        let _width = Math.max(left- _left, 2);
        let _top = this.excelObject.setting_custome.rowTops[ currentIndex -1] || 
                   this.excelObject.setting_def.rowTitleHeight;
        let _height  = Math.max(top - _top, 2);
        if(top > info.top && left <= info.left){
            // 设置横向
            if(event.buttons === 1 && currentIndex > -1) {
                dom.style.left = 0;
                dom.style.top = top;
                dom.style.display = 'block';
                this.setState({
                    changeSizeState:'change_size_h',
                    change_size_h: 1,
                    change_size_w: Math.min(this.excelObject.info.width /ratio ,  1000),
                    currentLabel_val:_height,
                    currentLabel_top:  _top + 'px',
                    currentLabel_left: this.excelObject.setting_def.columTitleDefWidth+ 'px'
                })
            }else {
                let index = this.excelObject.setting_custome.rowTops.indexOf(top) 
                if(index > -1) {
                    dom.style.left = 0;
                    dom.style.top = top ;
                    dom.style.display = 'block';
                    this.setState({
                        change_size_current_index:index,
                        changeSizeState:'change_size_h',
                        change_size_h: 1,
                        change_size_w:Math.min(this.excelObject.info.left /ratio,  1000),
                        currentLabel_val:_height,
                        currentLabel_top:  _top + 'px',
                        currentLabel_left: this.excelObject.setting_def.columTitleDefWidth+ 'px'
                    })
                }
            } 
        }else  {
            // 设置纵向
            if(event.buttons === 1 && currentIndex > -1) {
                console.log(this.excelObject.info.height )
                this.setState({
                    changeSizeState:'change_size_w',
                    change_size_h: Math.min(this.excelObject.info.height /  ratio, 500),
                    change_size_w:1,
                    currentLabel_val:_width,
                    currentLabel_top:  (-22) + 'px',
                    currentLabel_left: left + 'px'
                })
                dom.style.display = 'block';
                dom.style.left = left;
                dom.style.top = 0;
            }else {
                let index = this.excelObject.setting_custome.columnLefts.indexOf(left) 
                if(index > -1) {
                    this.setState({
                        changeSizeState:'change_size_w',
                        change_size_h: Math.min(this.excelObject.info.top / ratio, 500),
                        change_size_w:1,
                        change_size_current_index:index,
                        currentLabel_val:_width,
                        currentLabel_top:  (-22) + 'px',
                        currentLabel_left: left+ 'px'
                    })
                    dom.style.display = 'block';
                    dom.style.left = left;
                    dom.style.top = 0;
                }
            } 
        }
    }
    changeSizeByDrag(e:MouseEvent){
        e.stopPropagation();
        let dom =  this.changeSizeDOMRef.current;
        let _eX = e.clientX - this.clientRect.x;
        let _eY = e.clientY - this.clientRect.y;
        if(e.type === 'mousedown') {
            let index = this.state.changeSizeState === 'change_size_w' ?
                        this.excelObject.setting_custome.columnLefts.indexOf(_eX) :
                        this.excelObject.setting_custome.rowTops.indexOf(_eY);
            if(index > -1) {
                if(this.state.changeSizeState === 'change_size_w') {
                    let _left = this.excelObject.setting_custome.columnLefts[this.state.change_size_current_index -1] || this.excelObject.setting_def.columTitleDefWidth;
                    let _width = Math.max(_eX - _left, 2);
                    this.setState({
                        change_size_h:Math.min(this.excelObject.info.height / this.excelObject.info.scalingRatio, 500),
                        change_size_w:1,
                        change_size_current_index:index,
                        currentLabel_val:_width,
                        currentLabel_top:  (-22 ) + 'px',
                        currentLabel_left: _eX 
                    })
                    dom.style.display = 'block';
                    dom.style.left = _eX -2;
                    dom.style.top = 0;
                }else {
                    let _top = this.excelObject.setting_custome.rowTops[this.state.change_size_current_index -1] || this.excelObject.setting_def.rowTitleHeight ;
                    let _height  = Math.max(_eY - _top, 2);
                    this.setState({
                        change_size_h: 1,
                        change_size_w:Math.min(this.excelObject.info.width / this.excelObject.info.scalingRatio, 1000),
                        change_size_current_index:index,
                        currentLabel_val:_height,
                        currentLabel_top:_top,
                        currentLabel_left: this.excelObject.setting_def.columTitleDefWidth+ 'px'
                    })
                    dom.style.left = 0;
                    dom.style.top = _eY-2;
                    dom.style.display = 'block';
                }
            }
        }else if(e.type === 'mouseup') {
            if(this.state.change_size_current_index > -1) {
                if(this.state.changeSizeState === 'change_size_w') { 
                    let _left = this.excelObject.setting_custome.columnLefts[this.state.change_size_current_index -1] || this.excelObject.setting_def.columTitleDefWidth ;
                    this.excelObject.setting_custome.column[this.state.change_size_current_index]  = Math.max(_eX - _left, 2)
                }else {
                    let _top = this.excelObject.setting_custome.rowTops[this.state.change_size_current_index -1] || this.excelObject.setting_def.rowTitleHeight
                    this.excelObject.setting_custome.row[this.state.change_size_current_index]  = Math.max((_eY - _top),2)
                }
                this.clearFullRect();
                this.drawBorder();
                this.initExcel();
            }
        }
    }

    updateEditorDOM(left:number,top:number) {
        let info = this.excelObject.info;
        if(!(left > info.left && left < info.width || 
            0 <= top && top < info.top )){
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
        for(let i=0; i<cols.length;i++) {
            let col = cols[i];
            if(_l<= left &&  left < _l+ col){
                _w = col;
                break;
            } 
            _l += col;
        }
        for(let i=0; i<rows.length;i++) {
            let row = rows[i];
            if(_t <= top && top < _t+ row){
                _h = row;
                break;
            }
            _t += row;
        }
        
        let dom =  this.editorDOMRef.current;
        dom.style.left = _l;
        dom.style.display = 'block';
        dom.style.top = _t;
        dom.style.height = _h;
        dom.style.width = _w;
        dom.innerText = "";
        // this.upateTxtByEdited(dom);
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
                if(col === 1 && row === 1) {
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "#e0e0e0";
                    let _w = (colums[col] + colums[col+1] + colums[col+2]) * ratio;
                    let _h = (rows[row] + rows[row+1] + + rows[row+2]) * ratio;
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
    }
    repaint(){
        this.clearFullRect();
        this.excelObject.setting_custome.row = [23,23,53,130,49,40,23,23,23,23];
        this.drawBorder();
        this.initExcel();
    }
    clearFullRect() {
        this.context.clearRect(0, 0,this.excelObject.info.scalingRatio * 1000, this.excelObject.info.scalingRatio * 500 );
    }
    style = {
        width: 1000 + 'px',
        height: 500 + 'px'
    }
    render() {
        return  <div className='excel_body'>
            <div ref={this.editorDOMRef} className={`editor_excel`} contentEditable='true'>
                <span className="content"></span>
            </div>
            <div 
                ref={this.changeSizeDOMRef} 
                className={`change_size  ${this.state.changeSizeState}`} 
                draggable='true'
                onMouseUp={this.changeSizeByDrag.bind(this)}
                onMouseDown={this.changeSizeByDrag.bind(this)}>
                <span className="content" style={{width:this.state.change_size_w, height:this.state.change_size_h}}></span>
            </div>
            <div 
                ref={this.currentLabelDOMRef} 
                style={{
                    left:this.state.currentLabel_left,
                    top:this.state.currentLabel_top
                }}
                className="currentLabel">
                    <label className="lab">{this.state.changeSizeState === 'change_size_w' ? '宽度': '高度'}:</label>
                    <span className="val">{this.state.currentLabel_val} </span>
            </div>
            <canvas id="canvas_excle" 
                ref={(c) => {this.excelRef = c;this.context = c && c.getContext('2d')}} 
                style={this.style}  width={this.excelObject.info.scalingRatio * 1000} height={this.excelObject.info.scalingRatio * 500} />
            <button onClick={this.merge.bind(this)}>删除</button>
            <button className='repaint' onClick={this.repaint.bind(this)}>repaint</button>
        </div>
    }
}

export default Excel;