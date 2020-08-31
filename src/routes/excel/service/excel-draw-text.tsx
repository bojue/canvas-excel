let drawText = (ctx:any, item:any, row:number, col:number, str:string, ratio:number, currentLeft:number, currentTop:number, height:number) => {
    console.log(item)
    let color = item[3]['text']['color'];
    ctx.fillStyle = color;
    let size = 10 * ratio;
    ctx.font = `${item[3]['text']['fontStyle'] } ${item[3]['text']['fontWeight']}  ${size}pt  微软雅黑`;
    ctx.textAlign = "left";
    ctx.textBaseline = 'middle';
    ctx.fillText( str, (currentLeft  + 3)* ratio , currentTop * ratio+ height /2* ratio + 0.5);
    // ctx.moveTo((currentLeft  + 3)* ratio , currentTop * ratio+ height /2* ratio + 0.5);
    // ctx.lineTo((currentLeft  + 3)* ratio + ctx.measureText(str).width, currentTop * ratio+ height /2* ratio + 0.5);

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