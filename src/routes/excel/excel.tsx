import * as React from 'react';
import { Props } from 'react';
import "./excel.scss";

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
                title:"Excel"
            },
            setting_def:{
                width:150,
                height:35,
                rowLen:15,
                columnLen:5
            },
            setting_custome: {
                row:[35,35,35,35],
                column:[300,300,300,300]
            }
        };
    }
    componentDidMount() {
        this.getExcelCanvas();
        this.initExcel();
        this.addLister();
    }
    getExcelCanvas() {
        this.clientRect = this.excelRef.getBoundingClientRect();
    }
    initExcel() {
        console.log(this.excelObject)
        const ctx = this.context;
        ctx.beginPath();
        let def = this.excelObject.setting_def;
        let width  = def.width;
        let height = def.height;
        let rLen = def.rowLen;
        let cLen = def.columnLen;
        for(let row = 0;row <=rLen;row++) {
            let rowTop = row * height + 0.5;
            for(let col=0;col<= cLen;col++) {
                let colLeft = col * width + 0.5;
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#ccc";
                ctx.rect(colLeft, rowTop, 150, 35);
                ctx.fillStyle = "#fff";
                ctx.fillRect(colLeft, rowTop, 150, 35);
                ctx.fillStyle = '#000';
                ctx.font = "13pt serif";
                ctx.textAlign = "left";
                ctx.fillText(col + "-" + row,colLeft + 5, rowTop + 35 -5)
            }
        }
        ctx.stroke();
    }
    addLister() {
        const ctx = this.excelRef;
        ctx.addEventListener('click', (e:MouseEvent)=> {
            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            let _l = Math.floor(_eX / 150) * 150;
            let _t = Math.floor(_eY / 35) * 35;
            this.updateEditorDOM(_t, _l)
        }); 
    }
    updateEditorDOM(top:number, left:number) {
        let dom =  this.editorDOMRef.current;
        this.upateTxtByEdited(dom);
        dom.style.left = left;
        dom.style.top = top ;
        dom.innerText = "";
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
        let _x =  left + 5;
        let _y = top + 35 -5;
        ctx.fillText(text, _x, _y);
        dom.innerText = "";
    }
    merge() {
        const ctx = this.context;
        ctx.beginPath();
        for(let row = 0;row <=5;row++) {
            let rowTop = row * 35 + 0.5;
            for(let col=0;col<= 5;col++) {
                let colLeft = col * 150 + 0.5;
                if(col === 3 && row === 2) {
                    ctx.clearRect(colLeft, rowTop, 150 * 3, 100);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "#ccc";
                    ctx.rect(colLeft, rowTop,  150 * 3, 35 * 3);
                    ctx.fillStyle = "#fff";
                    ctx.fillRect(colLeft, rowTop,  150 * 3, 35 * 3);
                    ctx.fillStyle = '#000';
                    ctx.font = "13pt serif";
                    ctx.textAlign = "left";
                    ctx.fillText(col + "-" + row,colLeft + 5, rowTop + 35 -5)
                }
            }
        }
       ctx.stroke();
    }
    style = {
        width: '1000px',
        height: '500px'
    }
    render() {
        return  <div className='excel_body'>
            <div ref={this.editorDOMRef} className="editor_excel" contentEditable='true'>
                <span className="content"></span>
            </div>
            <canvas id="canvas_excle" 
                ref={(c) => {this.excelRef = c;this.context = c && c.getContext('2d')}} 
                style={this.style}  width="1000" height="500" />
            <button onClick={this.merge.bind(this)}>删除</button>
        </div>
    }
}

export default Excel;