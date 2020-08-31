let drawText = (ctx:any, item:any, row:number, col:number, str:string, ratio:number, currentLeft:number, currentTop:number, height:number, width:number) => {
    let color = item[3]['text']['color'];
    ctx.fillStyle = color;
    let size = 10 * ratio;
    let textAlign = item[3]['text']['textAlign'];
    let txtVal = getFillText( (width - 3)* ratio,  str, ctx, textAlign);
    item[2] = str;
    ctx.font = `${item[3]['text']['fontStyle'] } ${item[3]['text']['fontWeight']}  ${size}pt  微软雅黑`;
    ctx.textAlign =textAlign ;
    ctx.textBaseline = 'middle';
    let textLeft = textAlign === 'left' ? (currentLeft + 3) * ratio :
                     textAlign === 'right' ? (currentLeft + width -3) * ratio :
                     (currentLeft + width /2 ) * ratio
    ctx.fillText( txtVal, textLeft , currentTop * ratio+ height /2* ratio + 0.5);
}

let getFillText = (lineWidth:number, txt:string, ctx:CanvasRenderingContext2D, textAlign:string) => {
    if(txt === null || txt === undefined) return txt;
    let len = txt.length;
    let count = 0;
    let width = 0;        
    switch(textAlign) {
        case 'left':
            count = 0;
            for (let i = 0; i < len; i++) {
                let fontWidth = ctx.measureText(txt[i]).width; 
                if(width + fontWidth >= lineWidth) {
                    break;
                }else {
                    width += fontWidth;
                    count++;
                }
            }
            if(count + 1< len) {
                txt = txt.substring(0, count)
            }
            break;
        case 'right':
            count = 0;
            for (let i = len-1; i >= 0; i--) {
                let fontWidth = ctx.measureText(txt[i]).width; 
                if(width + fontWidth > lineWidth ) {
                    break;
                }else {
                    count++;
                    width += fontWidth;
                }
             
            }
            txt = txt.slice(-count)
            break;
        default: 
        count = 0;
        for (let i = 0; i < len; i++) {
            let fontWidth = ctx.measureText(txt[i]).width; 
            if(width + fontWidth >= lineWidth) {
                break;
            }else {
                width += fontWidth;
                count++;
            }
            }
            if(count + 1< len) {
                let s = parseInt((len / 2 - count/2)+'');
                let e = parseInt((len /2 + count /2) + '');
                txt = txt.substring(s, e)
            }
            break;
    }

    return txt;
}

export { drawText, getFillText };