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

export { drawText, getFillText };