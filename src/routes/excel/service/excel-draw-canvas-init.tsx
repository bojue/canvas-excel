
import { drawText} from './excel-draw-text';
import { updateExcelDataByItem } from './excel-draw-item-text';

let initExcelCanvas = function(context:any, excelObject:any, excelData:any, excelItemModel:any) {
    const ratio = excelObject.info.scalingRatio;
    const ctx = context;
        ctx.beginPath();
    let def = excelObject.setting_def;
    let setting = excelObject.setting_custome;
    let rows = setting.row;
    let colums = setting.column;
    let rLen = rows.length;
    let cLen = colums.length;
    let currentTop = def.rowTitleHeight;
    let currentLeft = def.columTitleDefWidth;
    let str = "";
    for(let row = 0;row <rLen && currentTop <= 500;row++) {
        if(!(excelData && excelData[row])) {
            excelData[row] = [];
        }
        let height = rows[row];
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#ccc";
        currentLeft = def.columTitleDefWidth;
        for(let col=0;col< cLen && currentLeft <= 1000;col++) {
            if(excelData &&excelData[row] && excelData[row][col]){
                str = excelData &&excelData[row] && excelData[row][col] &&  excelData[row][col][2];
            }else {
                excelData[row][col] = excelItemModel || [];
            }
            let width = colums[col];
            ctx.rect(currentLeft* ratio +0.5 , currentTop* ratio + 0.5, width* ratio, height* ratio);
            ctx.fillStyle = excelData &&excelData[col] && excelData[col][row] ?
                            excelData[col][row][3]['rect']['fillStyle']:
                            "#fff"
            ctx.fillRect(currentLeft* ratio, currentTop* ratio, width* ratio, height* ratio);
            updateExcelDataByItem( excelData, excelItemModel, row, col, [1, 1], 'txt', str)
            drawText(ctx, excelData[row][col], col, row, str, ratio, currentLeft, currentTop, height, width);
            currentLeft += width;
        }
        currentTop += height;   
    }
        ctx.stroke();
}

export { initExcelCanvas };
