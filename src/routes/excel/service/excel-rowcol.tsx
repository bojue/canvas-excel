// Excel 插入/删除 行/列 服务
// 直接原地修改 excelData / setting_custome / config.merge，保持 excelData 引用不变。
//
// 数据约定：
//   excelData[row][col] = [[colSpan,rowSpan], type, value, styleObj]
//   被合并的从属单元格 item[0] = [0,0]
//   setting_custome.row[]    = 每行高度
//   setting_custome.column[] = 每列宽度
//   config.merge[] = [rowStart, rowSpan(跨度-1), colStart, colSpan(跨度-1)]
//
// 合并区处理策略（MVP）：
//   结构操作若“切穿”某个合并区，则先自动拆开该合并区（拆分可预期，避免双份状态撕裂）；
//   完全位于切割线之前/之后的合并区只做起始下标平移。

const DEF_ROW_HEIGHT = 20;
const DEF_COL_WIDTH = 60;

// 生成一个默认单元格（深拷贝模型，避免共享引用）
let makeCell = (model: any): any => {
    return JSON.parse(JSON.stringify([[1, 1], 'txt', '', model[3]]));
};

// 拆开一个合并区：把矩形内所有单元格 item[0] 复位为 [1,1]
let unmergeRect = (excelData: any[][], mR: number, mRS: number, mC: number, mCS: number): void => {
    for (let j = mR; j <= mR + mRS; j++) {
        for (let i = mC; i <= mC + mCS; i++) {
            let item = excelData[j] && excelData[j][i];
            if (item && item[0]) {
                item[0] = [1, 1];
            }
        }
    }
};

// 插入行：在 rowIndex 位置插入一行空白，原 rowIndex 及之后整体下移
let insertRow = (excelData: any[][], excelObject: any, rowIndex: number, model: any): void => {
    let setting = excelObject.setting_custome;
    let colCount = setting.column.length;

    // 处理被切穿的合并区，平移其余合并区
    excelObject.config.merge = excelObject.config.merge.filter((m: any) => {
        let [mR, mRS] = m;
        if (mR < rowIndex && mR + mRS >= rowIndex) {
            // 插入线穿过该合并区 -> 拆开
            unmergeRect(excelData, m[0], m[1], m[2], m[3]);
            return false;
        }
        return true;
    });
    excelObject.config.merge.forEach((m: any) => {
        if (m[0] >= rowIndex) m[0] += 1; // 位于插入线之后，整体下移
    });

    // 尺寸数组
    setting.row.splice(rowIndex, 0, DEF_ROW_HEIGHT);

    // 数据行
    let newRow: any[] = [];
    for (let c = 0; c < colCount; c++) {
        newRow.push(makeCell(model));
    }
    excelData.splice(rowIndex, 0, newRow);
};

// 删除行：删除 rowIndex 行，之后整体上移
let deleteRow = (excelData: any[][], excelObject: any, rowIndex: number, model: any): void => {
    let setting = excelObject.setting_custome;
    if (setting.row.length <= 1) return; // 至少保留一行

    excelObject.config.merge = excelObject.config.merge.filter((m: any) => {
        let [mR, mRS] = m;
        if (mR <= rowIndex && rowIndex <= mR + mRS) {
            // 删除线与合并区相交 -> 拆开并丢弃
            unmergeRect(excelData, m[0], m[1], m[2], m[3]);
            return false;
        }
        return true;
    });
    excelObject.config.merge.forEach((m: any) => {
        if (m[0] > rowIndex) m[0] -= 1;
    });

    setting.row.splice(rowIndex, 1);
    excelData.splice(rowIndex, 1);
};

// 插入列：在 colIndex 位置插入一列空白，原 colIndex 及之后整体右移
let insertColumn = (excelData: any[][], excelObject: any, colIndex: number, model: any): void => {
    let setting = excelObject.setting_custome;

    excelObject.config.merge = excelObject.config.merge.filter((m: any) => {
        let mC = m[2];
        let mCS = m[3];
        if (mC < colIndex && mC + mCS >= colIndex) {
            unmergeRect(excelData, m[0], m[1], m[2], m[3]);
            return false;
        }
        return true;
    });
    excelObject.config.merge.forEach((m: any) => {
        if (m[2] >= colIndex) m[2] += 1;
    });

    setting.column.splice(colIndex, 0, DEF_COL_WIDTH);
    for (let r = 0; r < excelData.length; r++) {
        if (!excelData[r]) excelData[r] = [];
        excelData[r].splice(colIndex, 0, makeCell(model));
    }
};

// 删除列：删除 colIndex 列，之后整体左移
let deleteColumn = (excelData: any[][], excelObject: any, colIndex: number, model: any): void => {
    let setting = excelObject.setting_custome;
    if (setting.column.length <= 1) return; // 至少保留一列

    excelObject.config.merge = excelObject.config.merge.filter((m: any) => {
        let mC = m[2];
        let mCS = m[3];
        if (mC <= colIndex && colIndex <= mC + mCS) {
            unmergeRect(excelData, m[0], m[1], m[2], m[3]);
            return false;
        }
        return true;
    });
    excelObject.config.merge.forEach((m: any) => {
        if (m[2] > colIndex) m[2] -= 1;
    });

    setting.column.splice(colIndex, 1);
    for (let r = 0; r < excelData.length; r++) {
        if (excelData[r]) excelData[r].splice(colIndex, 1);
    }
};

export { insertRow, deleteRow, insertColumn, deleteColumn };
