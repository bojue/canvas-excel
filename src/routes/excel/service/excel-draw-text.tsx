let drawText = (ctx:any) => {
    ctx.font = "20pt";
    let str = "Hello World"
    ctx.fillText(str, 10, 50);
    ctx.beginPath();
    ctx.lineWidth = 1;
    let len = ctx.measureText(str).width;
    ctx.moveTo(10, 50 + 2.5);
    ctx.lineTo(len + 10,50 + 2.5);
    ctx.stroke();
}

let initDrawText = (str:string, ctx:any, excelData:any, width:number, height:number, currentLeft:number, currentTop:number, ratio:number,row:number, col:number)=> {
    let color = excelData[row][col][3]['text']['color'];
    ctx.fillStyle = color;
    let size = 10 * ratio;
    ctx.font = 'lighter '+size+'pt  微软雅黑';
    ctx.textAlign = "left";
    ctx.textBaseline = 'middle';
    ctx.fillText( str, (currentLeft  + 3)* ratio , currentTop * ratio+ height /2* ratio + 0.5);
}

let getFillText = (lineWidth:number, txt:string, ctx:CanvasRenderingContext2D) => {
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
    if(count + 1 < len ) {
        txt.substring(0, count)
    }
    return txt;
}

export { drawText, getFillText, initDrawText };