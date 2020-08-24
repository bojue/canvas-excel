export class ExcelTxt {
    drawText(ctx:any) {
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
    
}