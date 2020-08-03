import * as React from 'react';
import { Props } from 'react';
import "./excel.scss";

class Excel extends React.Component<{}, object>  {
    componentDidMount() {
        this.updateCanvas();
    }
    updateCanvas() {
        const ctx = this.context;
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#bbb';
        ctx.beginPath();
        for(let i=0;i<100;i++) {
          let item = i * 70+0.5;
          ctx.moveTo(0.5, item);
          ctx.lineTo(2000.5, item);
        }
        for(let i=0;i<30;i++) {
          let item = i * 200+0.5;
          ctx.moveTo(item, 0);
          ctx.lineTo(item, 1000);
        }
        ctx.stroke();
    }
    render() {
        return  <div className='excel_body'>
            <div className="editor_excel" contentEditable='true'>
                {/* <div className="content" contentEditable="true">
                </div> */}
                <span>3342</span>
            </div>
            <canvas ref={(c) => this.context = c && c.getContext('2d')}  width="2000" height="1000" />
        </div>
    }
}

export default Excel;