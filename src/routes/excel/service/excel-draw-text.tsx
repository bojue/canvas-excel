// 绘制文本
let drawText = (ctx:any, item:any, row:number, col:number, str:string, ratio:number, currentLeft:number, currentTop:number, height:number, width:number) => {
    let setText = item[3]['text'];
    let {
        color,
        fontFamily,
        fontSize,
        fontWeight,
        fontStyle
    } = setText;
    ctx.fillStyle = color;
    let textAlign = item[3]['text']['textAlign'];
    let txtVal = getFillText( (width - 3)* ratio,  str, ctx, textAlign);
    item[2] = str;
    ctx.font = `${fontStyle} ${fontWeight}  ${fontSize}pt  ${fontFamily}`;
    ctx.fontSize = fontSize + 'px',
    ctx.lineHeight = fontSize +'px',
    ctx.textAlign =textAlign ;
    ctx.textBaseline = 'middle';
    let textLeft = textAlign === 'left' ? (currentLeft + 3) * ratio :
                     textAlign === 'right' ? (currentLeft + width -3) * ratio :
                     (currentLeft + width /2 ) * ratio
    ctx.fillText( txtVal, textLeft , currentTop * ratio+ height /2* ratio + 0.5);
}


// 绘制合并区域文本
let drawMergeText = (ctx:any, item:any,merge_row:number, merge_col:number, _l:number, _t:number, setting:any, ratio:number)=> {
    let setText = item[3]['text']

    let {
        color,
        fontFamily,
        fontSize,
        fontWeight,
        fontStyle
    } = setText;
    console.log(setText, color, fontSize)

    ctx.fillStyle = color;

    let textAlign = item[3]['text']['textAlign'];
    let txtVal = getFillText(((setting.columnLefts[merge_col] - _l)  - 3)* ratio, item[2] , ctx, textAlign);
    ctx.font = `${fontStyle } ${fontWeight}  ${fontSize}pt  ${fontFamily}`;
    ctx.textAlign = textAlign ;
    ctx.textBaseline = 'middle';
    let l =  textAlign === 'left' ?  (_l + 3) * ratio : textAlign === 'center' ?  
        _l * ratio + (setting.columnLefts[merge_col] - _l) * ratio /2 :
   ( setting.columnLefts[merge_col]  -3) * ratio;
    ctx.fillText(txtVal,l, _t * ratio +  (setting.rowTops[merge_row] -_t) * ratio/ 2);
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
            let indexL = 0;
            let indexR = 0;
            let current = parseInt(len / 2 +'' );
            let  fontWidth = ctx.measureText(txt[current]).width;
            let bool = width + fontWidth >= lineWidth;
            if(!bool) {
                width += fontWidth;
                count++;
                indexR= current+1;
                indexL = current -1;
            }
            while( (indexL >= 0 || indexR <= len +1) && !bool) {
                if(indexL >=0 ) {
                    fontWidth = ctx.measureText(txt[indexL]).width;
                    bool = width + fontWidth >= lineWidth;
                    if(!bool) {
                        width += fontWidth;
                        count++;
                        indexL--;
                        indexL = Math.max(indexL, 0)
                    }
                }

                if(!bool && indexR < len) {
                    fontWidth = ctx.measureText(txt[indexR]).width;
                    bool = width + fontWidth >= lineWidth;
                    if(!bool) {
                        width += fontWidth;
                        count++;
                        indexR++;
                        indexR =  Math.min(indexR,  len)
                    }
                }
            }
            if(count + 1< len) {
                txt = txt.substring(indexR - indexL > 1 ? indexL +1 : indexL, indexR)
            }
            break;
    }

    return txt;
}

export { drawText, drawMergeText, getFillText };
