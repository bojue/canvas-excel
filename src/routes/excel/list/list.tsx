import * as React from 'react';
import { Props } from 'react';
import "./excel.scss";

class Excel extends React.Component<{}, object>  {
    excelRef:any;
    editorDOMRef:any;
    clientRect:DOMRect;
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
        ctx.strokeStyle = '#aaaaaa';
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
        ctx.font = "normal normal 600 20pt Microsoft YaHei";
        let txt = "测试sensfkjfsf圳";

        
        ctx.font = "normal normal 20pt Microsoft YaHei";
        ctx.fillStyle  = '#333';
        ctx.weight = 100;
        ctx.textAlign = "start";
        ctx.textBaseline = "bottom";
        ctx.fillText(txt, 310, 60, 300);

        ctx.font = "normal normal 20pt Microsoft YaHei";
        ctx.fillStyle  = '#333';
        ctx.weight = 100;
        ctx.textAlign = "start";
        ctx.textBaseline = "bottom";
        ctx.fillText(txt, 310, 130, 300);
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
        console.log(top, left,dom)
        console.log(dom)
        dom.style.left = left;
        dom.style.top = top;
    }
    style = {
        width: '1000px',
        height: '500px'
    }
    render() {
        return  <div className='excel_body'>
            <div ref={this.editorDOMRef} className="editor_excel" contentEditable='true'>
                <span className="content">3342</span>
            </div>
            <canvas id="canvas_excle" ref={(c) => {this.excelRef = c;this.context = c && c.getContext('2d')}} style={this.style}  width="2000" height="1000" />
        </div>
    }
}

export default Excel;