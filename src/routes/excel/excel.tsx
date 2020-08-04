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
    data:Txt[] = [{
        x:300,
        y:70,
        v:'测试sensfkjfsf圳1'
    },{
        x:300,
        y:140,
        v:'234 '
    },{
        x:300,
        y:210,
        v:'24'
    },{
        x:300,
        y:280,
        v:'234'
    },{
        x:300,
        y:350,
        v:'234'
    },{
        x:300,
        y:420,
        v:'测试sensfkjfsf圳2'
    }];
    constructor(props:any) {
    super(props);
        this.excelRef = React.createRef();
        this.editorDOMRef = React.createRef();
    }
    componentDidMount() {
        this.getExcelCanvas();
        this.updateCanvas();
        this.addLister();
    }
    getExcelCanvas() {
        this.clientRect = this.excelRef.getBoundingClientRect();
    }
    updateCanvas() {
        const ctx = this.context;
        ctx.lineWidth = 1;
        let width = ctx.lineWidth % 2 /2;
        ctx.strokeStyle = '#aaa';
        ctx.beginPath();
        for(let i=0;i<30;i++) {
          let item = i * 70+width;
          ctx.moveTo(width, item);
          ctx.lineTo(2000 + width, item);
        }
        for(let i=0;i<30;i++) {
          let item = i * 300+width;
          ctx.moveTo(item, 0);
          ctx.lineTo(item, 1000);
        }
        ctx.stroke();
        ctx.font = "normal normal 100 20pt Microsoft YaHei";
        let data = this.data;
        for(let i=0;i<data.length;i++) {
            let obj = data[i];
            ctx.fillText(obj && obj.v, obj.x + 10, obj.y - 10, 290);
        }

    }
    addLister() {
        const ctx = this.excelRef;
        ctx.addEventListener('click', (e:MouseEvent)=> {
            let _eX = e.clientX - this.clientRect.x;
            let _eY = e.clientY - this.clientRect.y;
            let _l = Math.floor(_eX / 150) * 150;
            let _t = Math.floor(_eY / 35) * 35;
            this.updateEditorDOM(_t, _l)
        })
    }
    updateEditorDOM(top:number, left:number) {
        let dom =  this.editorDOMRef.current;
        this.upateTxtByEdited(dom);
        dom.style.left = left;
        dom.style.top = top;
    }
    upateTxtByEdited(dom:any) {
        let style = dom.style;
        let text = dom.innerText;
        let left = parseFloat(style.left);
        let top = parseFloat(style.top);
        const ctx = this.context;
        ctx.font = "normal normal 100 20pt Microsoft YaHei";
        ctx.fillStyle  = '#333';
        ctx.textAlign = "start";
        ctx.textBaseline = "bottom";
        let _x =  left * 2 + 10;
        let _y = top * 2 + 70 -10;
        ctx.fillText(text, _x, _y);
        dom.innerText = "";
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
            <canvas id="canvas_excle" ref={(c) => {this.excelRef = c;this.context = c && c.getContext('2d')}} style={this.style}  width="2000" height="1000" />
        </div>
    }
}

export default Excel;