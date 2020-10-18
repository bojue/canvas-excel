
let updateExcelDataByItem = function(excelData:any, excelItemModel:any, x:number, y:number,coordinate:any[],type:string, val:string, setting?:object) {
    excelData[x][y] = JSON.parse(JSON.stringify([coordinate, type, val, setting || excelData[x] && excelData[x][y] && excelData[x][y][3] || excelItemModel[3]]));
}
export {updateExcelDataByItem}