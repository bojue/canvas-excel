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
    clientRect:DOMRect;
    excelObject:any;
   
    constructor(props:any) {
        super(props);
        this.excelRef = React.createRef();
        this.editorDOMRef = React.createRef();
        this.excelObject = {
            info:{
                title:"Excel",
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
                columTitleDefWidth:60,
            },
            setting_custome: {
                row:[23,23,223,30,49,40,23,23,23,23],
                column:[30,110,110,110,110,110,110,110]
            }
        };
    }
    componentDidMount() {
        this.getExcelCanvas();
        this.drawBorder();
        this.initExcel();
        this.addLister();
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
        ctx.strokeStyle = "#e0e0e0";
        ctx.rect(0.5, 0.5, def.columTitleDefWidth, def.rowTitleHeight);
        ctx.fillStyle = "#f9fafb";
        ctx.fillRect(0.5, 0.5, def.columTitleDefWidth, def.rowTitleHeight);
        ctx.fillStyle = '#000';
        ctx.font = "lighter 10pt  微软雅黑";
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        ctx.fillText("Excel",  def.columTitleDefWidth/2, def.rowTitleHeight /2 +0.5 );
        for(let i=0;i<setting.column.length;i++) {
            let colLeft = startLeft + 0.5;
            let rowTop = 0.5;
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#e0e0e0";
            ctx.rect(colLeft, rowTop, setting.column[i], def.rowTitleHeight);
            ctx.fillStyle = "#f9fafb";
            ctx.fillRect(colLeft, rowTop, setting.column[i],  def.rowTitleHeight);
            ctx.fillStyle = '#000';
            ctx.font = "lighter 10pt  微软雅黑";
            ctx.textAlign = "center";
            ctx.textBaseline = 'middle';
            ctx.fillText(String.fromCharCode((65 + i)),  startLeft + setting.column[i] /2, def.rowTitleHeight /2 + 0.5 );
            startLeft += setting.column[i];
            if( i === setting.column.length -1) {
                this.excelObject.info.width = startLeft;
            }
        }

        let startHeight = def.rowTitleHeight;
        for(let i=0;i<setting.row.length;i++) {
            let colLeft = 0.5;
            let rowTop = startHeight + 0.5;
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#e0e0e0";
            ctx.rect(colLeft, rowTop, def.columTitleDefWidth, setting.row[i]);
            ctx.fillStyle = "#f9fafb";
            ctx.fillRect(colLeft, rowTop,  def.columTitleDefWidth, setting.row[i]);
            ctx.fillStyle = '#000';
            ctx.font = "lighter 10pt  微软雅黑";
            ctx.textAlign = "center";
            let val = i;
            ctx.textBaseline = 'middle';
            ctx.fillText(val++, def.columTitleDefWidth /2, rowTop + setting.row[i] /2 + 0.5);
            startHeight += setting.row[i];
            this.excelObject.info.height = startHeight;
            if( i === setting.column.length -1) {
                this.excelObject.info.height = rowTop;
            }
        }
        ctx.stroke();
    }
    initExcel() {
        const ctx = this.context;
        ctx.beginPath();
        let def = this.excelObject.setting_def;
        let setting = this.excelObject.setting_custome;
        let rows = setting.row;
        let colums = setting.column;
        let rLen = rows.length;
        let cLen = colums.length;
        let currentTop = def.rowTitleHeight + 0.5;
        let currentLeft = def.columTitleDefWidth + 0.5;
        for(let row = 0;row <rLen;row++) {
            let height = rows[row];
            currentLeft = def.columTitleDefWidth + 0.5;
            for(let col=0;col< cLen;col++) {
                let width = colums[col];
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#e0e0e0";
                ctx.rect(currentLeft, currentTop, width, height);
                ctx.fillStyle = "#fff";
                ctx.fillRect(currentLeft, currentTop, width, height);
                ctx.fillStyle = '#000';
                ctx.font = "lighter 10pt  微软雅黑";
                ctx.textAlign = "center";
                ctx.textBaseline = 'middle';
                ctx.fillText(col + "-" + row,currentLeft + width /2, currentTop + height /2 + 0.5);
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
            this.updateEditorDOM(_eY, _eX)
        }); 
    }
    updateEditorDOM(top:number, left:number) {
        let info = this.excelObject.info;
        if( left < info.left ||
            left > info.width|| 
            top < info.top || 
            top > info.height ){
            console.info("请点击Excel区域");
            return;
        }
        console.log(info)
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
            currentTop = def.rowTitleHeight + 0.5;
            let width = colums[row];
            for(let col=0;col< cLen;col++) {
                let height = rows[col];
                if(col === 1 && row === 1) {
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "#e0e0e0";
                    let _w = colums[col] + colums[col+1] + colums[col+2];
                    let _h = rows[row] + rows[row+1] + + rows[row+2];
                    ctx.rect(currentLeft, currentTop,  _w, _h );
                    ctx.fillStyle = "#fff";
                    ctx.fillRect(currentLeft, currentTop, _w,_h);
                    ctx.fillStyle = '#000';
                    ctx.font = "10pt serif";
                    ctx.textAlign = "center";
                    ctx.fillText(col + "-" + row + new Date().getTime(),currentLeft + _w /2 , currentTop + _h/2 )
                }
                currentTop += height;
            }
            currentLeft += width;
        }
       ctx.stroke();
    }
    repaint(){
        this.clearRect();
        this.excelObject.setting_custome.row = [23,23,53,130,49,40,23,23,23,23];
        this.drawBorder();
        this.initExcel();
    }
    clearRect() {
        let {
            width,
            left,
            height,
            top
        } = this.excelObject.info;
        this.context.clearRect(0, 0, width +  left, height + top);
    }
    style = {
        width: '2000px',
        height: '1000px'
    }
    render() {
        return  <div className='excel_body'>
            <div ref={this.editorDOMRef} className="editor_excel" contentEditable='true'>
                <span className="content"></span>
            </div>
            <canvas id="canvas_excle" 
                ref={(c) => {this.excelRef = c;this.context = c && c.getContext('2d')}} 
                style={this.style}  width="2000" height="1000" />
            <button onClick={this.merge.bind(this)}>删除</button>
            <button className='repaint' onClick={this.repaint.bind(this)}>repaint</button>
        </div>
    }
}

export default Excel;