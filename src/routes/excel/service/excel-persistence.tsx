// Excel 数据持久化服务
// 负责工作表数据的保存、加载、导入、导出

const STORAGE_KEY = 'canvas-excel-data';
const DATA_VERSION = 1;

interface ExcelSnapshot {
    version: number;
    savedAt: number;
    excelData: any[][];
    config: any;
    setting_custome: any;
}

// 构建快照数据
let buildSnapshot = (excelData: any[][], excelObject: any): ExcelSnapshot => {
    return {
        version: DATA_VERSION,
        savedAt: Date.now(),
        excelData: excelData,
        config: excelObject.config,
        setting_custome: excelObject.setting_custome,
    };
};

// 应用快照到目标对象（原地修改，保持引用）
let applySnapshot = (snapshot: ExcelSnapshot, excelData: any[][], excelObject: any): boolean => {
    if (!snapshot || snapshot.version === undefined) return false;

    // 清空并重填 excelData（保持数组引用）
    excelData.length = 0;
    snapshot.excelData.forEach((row) => excelData.push(row));

    if (snapshot.config) {
        excelObject.config = snapshot.config;
    }
    if (snapshot.setting_custome) {
        excelObject.setting_custome = snapshot.setting_custome;
    }
    return true;
};

// 保存到 localStorage
let saveToLocal = (excelData: any[][], excelObject: any): boolean => {
    try {
        const snapshot = buildSnapshot(excelData, excelObject);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
        return true;
    } catch (e) {
        console.error('保存失败:', e);
        return false;
    }
};

// 从 localStorage 加载
let loadFromLocal = (excelData: any[][], excelObject: any): boolean => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const snapshot = JSON.parse(raw) as ExcelSnapshot;
        return applySnapshot(snapshot, excelData, excelObject);
    } catch (e) {
        console.error('加载失败:', e);
        return false;
    }
};

// 导出为 JSON 文件下载
let exportToFile = (excelData: any[][], excelObject: any, fileName?: string): void => {
    const snapshot = buildSnapshot(excelData, excelObject);
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `excel-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// 从文件导入（返回 Promise）
let importFromFile = (file: File, excelData: any[][], excelObject: any): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const snapshot = JSON.parse(reader.result as string) as ExcelSnapshot;
                const ok = applySnapshot(snapshot, excelData, excelObject);
                resolve(ok);
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};

// 导出为 CSV
let exportToCSV = (excelData: any[][], fileName?: string): void => {
    const rows = excelData.map((row) => {
        return row
            .map((cell) => {
                const val = (cell && cell[2] != null) ? String(cell[2]) : '';
                // CSV 转义：包含逗号、引号、换行时用引号包裹
                if (/[",\n]/.test(val)) {
                    return '"' + val.replace(/"/g, '""') + '"';
                }
                return val;
            })
            .join(',');
    });
    const csv = rows.join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `excel-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// 清除本地存储
let clearLocal = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};

export {
    saveToLocal,
    loadFromLocal,
    exportToFile,
    importFromFile,
    exportToCSV,
    clearLocal,
    STORAGE_KEY,
};
