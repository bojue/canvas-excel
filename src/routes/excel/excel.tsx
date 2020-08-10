import * as React from 'react';
import { Props } from 'react';
import "./excel.scss";
import { settings } from 'cluster';
import { log } from 'util';

export interface Txt {
    v:string;
    x:number;
    y:number;
}

class Excel extends React.Component<any, any>  {
    excelRef:any;
    clientRect:DOMRect;
    excelObject:any;
    currentLabelDOMRef:any;
    editorRef:any;
   
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
            change_size_current_index:-1,
                         
            // Excel下标工具栏操作状态坐标参数
            currentLabel_left:400,
            currentLabel_top:-22,
            currentLabel_val:22,
            currentLabel_state:'w',
              
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
            change_size_display:0
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
        ctx.addEventListener('dblclick', (e:MouseEvent)=> {
            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            this.updateEditorDOM(_eX, _eY);
            this.editorRef.current.setAttribute("contenteditable", "true");
            this.editorRef.current.focus();

            let d = document.getElementById('editorRef') as HTMLDivElement;
            let range = document.createRange();//创建一个选中区域
            range.selectNodeContents(d);//选中节点的内容
            if(d.innerHTML.length > 0) {
              range.setStart(d.childNodes[0], pos); //设置光标起始为指定位置
            }
            range.collapse(true);       //设置选中区域为一个点
            let  selection = window.getSelection();//获取当前选中区域
            selection.removeAllRanges();//移出所有的选中范围
            selection.addRange(range);//添加新建的范围
        }); 
        // ctx.addEventListener('click', (e:MouseEvent)=> {
        //     let _eX = e.clientX - this.clientRect.x;
        //     let _eY = e.clientY - this.clientRect.y;
        //     this.updateEditorDOM(_eX, _eY)
        // }); 
        ctx.addEventListener('mousemove', (e:MouseEvent)=> {
            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            this.updateChangeSizeButton(_eX, _eY, e)
            this.editorRef.current.setAttribute("contenteditable", "true")
        }); 
    }
    initChangeSizeState() {
        this.setState({
            change_size_display:'none'
        })
    }
    updateChangeSizeButton(left:number, top:number, event:MouseEvent) {
        //当前选中下标
        let currentIndex = this.state.change_size_current_index;

        // 初始化计算数据
        let info = this.excelObject.info;
        let ratio =  this.excelObject.info.scalingRatio; // canvas画板缩放比例
        let infoTop = info.top / ratio;
        let infoLeft = info.left / ratio;

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
        if(top > info.top && left <= info.left){
            // 设置横向
            if(event.buttons === 1 && currentIndex > -1) {
                this.setState({
                    changeSizeState:'change_size_h',
                    change_size_h: 1,
                    change_size_w: Math.min(this.excelObject.info.width /ratio ,  1000),
                    currentLabel_val:_height,
                    currentLabel_top:  _top + 'px',
                    currentLabel_left: this.excelObject.setting_def.columTitleDefWidth+ 'px',
                    change_size_top:top + 'px',
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
                        change_size_w:Math.min(this.excelObject.setting_def.columTitleDefWidth/ratio,  1000),
                        currentLabel_val:_height,
                        currentLabel_top:  _top + 'px',
                        currentLabel_left: this.excelObject.setting_def.columTitleDefWidth+ 'px',
                        change_size_top:top + 'px',
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
                        change_size_current_index:index,
                        currentLabel_val:_width,
                        currentLabel_top:  (-22) + 'px',
                        currentLabel_left: left+ 'px',
                        change_size_top:0,
                        change_size_left:left +'px',
                        change_size_display:'block'
                    })
                }
            } 
        }
    }
    
    changeSizeByDrag(e:MouseEvent){
        e.stopPropagation();
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
                        currentLabel_left: _eX + 'px',
                        change_size_top: 0,
                        change_size_left:_eX,
                        change_size_display:'block'
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
                        change_size_top: 0,
                        change_size_left:_eY-1 + 'px',
                        change_size_display:'block'
                    })
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
                this.initChangeSizeState();
                this.clearFullRect();
                this.drawBorder();
                this.initExcel();
                this.updateEditorDOM(-1, -1,'changeSize');
            }
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
    clearFullRect() {
        this.context.clearRect(0, 0,this.excelObject.info.scalingRatio * 1000, this.excelObject.info.scalingRatio * 500 );
    }
    clickEditor(e:MouseEvent) {
        console.log(e)
    }
    style = {
        width: 1000 + 'px',
        height: 500 + 'px'
    }
    render() {
        return  <div className='excel_body'>
            <span className="current_coordinate"> {(String.fromCharCode(65 +this.state.editor_coordinate_x ))}{this.state.editor_coordinate_y}</span>
            {/* 输入编辑组件 */}
            <div className="editor_content" >
                <div 
                    className={`editor_excel`} 
                    ref={this.editorRef}
                    id="editorRef"
                    onClick={this.clickEditor.bind(this)}
                    style={{ 
                        height:this.state.editor_height + 4,
                        width:this.state.editor_width + 4,
                        top:this.state.editor_top -2,
                        left:this.state.editor_left - 2,
                        display:this.state.editor_display}}
                    suppressContentEditableWarning = {true}>
                    <span className="content">{this.state.editor_top+'_'+this.state.editor_left+'_'+this.state.editor_display}</span>
                </div>
                <span className="editor_coordinate c-t" 
                    style={{
                        width:this.state.editor_width,
                        left:this.state.editor_left,
                        top:this.excelObject.setting_def.rowTitleHeight  -2}}></span>
                <span className="editor_coordinate c-l" 
                    style={{
                        height:this.state.editor_height,
                        top:this.state.editor_top,
                        left:this.excelObject.setting_def.columTitleDefWidth  -2 }}></span>
            </div>

            {/* Excel下标工具栏拖拽组件*/}
            <div className={`change_size  ${this.state.changeSizeState}`} 
                draggable='true'
                onMouseUp={this.changeSizeByDrag.bind(this)}
                onMouseDown={this.changeSizeByDrag.bind(this)}
                style={{
                    top:this.state.change_size_top,
                    left:this.state.change_size_left,
                    display:this.state.change_size_display
                }}>
                <span className="content" style={{width:this.state.change_size_w, height:this.state.change_size_h}}></span>
            </div>

            {/* Excle下标工具栏拖拽坐标组件 */}
            <div ref={this.currentLabelDOMRef} 
                style={{left:this.state.currentLabel_left,top:this.state.currentLabel_top }} className="currentLabel">
                    <label className="lab">{this.state.changeSizeState === 'change_size_w' ? '宽度': '高度'}:</label>
                    <span className="val">{this.state.currentLabel_val} </span>
            </div>

            {/* Excel画布 */}
            <canvas id="canvas_excle" ref={(c) => {this.excelRef = c;this.context = c && c.getContext('2d')}} 
                style={this.style}  width={this.excelObject.info.scalingRatio * 1000} height={this.excelObject.info.scalingRatio * 500} />
            <button onClick={this.merge.bind(this)}>合并</button>
        </div>
    }
}

export default Excel;