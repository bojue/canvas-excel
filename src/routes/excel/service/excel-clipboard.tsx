// Excel 复制/粘贴服务
// 内部剪贴板保存选区的单元格数据（值 + 样式），同时写入系统剪贴板（制表符分隔的纯文本）

interface ClipboardData {
    rows: number;
    cols: number;
    // 二维数组，每项包含 value 和 style 的深拷贝
    cells: { value: any; type: string; style: any }[][];
    isCut: boolean;
}

let internalClipboard: ClipboardData | null = null;

// 从选区提取数据（rowStart/rowEnd/colStart/colEnd 均为闭区间下标）
let copyRegion = (
    excelData: any[][],
    rowStart: number,
    rowEnd: number,
    colStart: number,
    colEnd: number,
    isCut: boolean = false
): ClipboardData => {
    const cells: { value: any; type: string; style: any }[][] = [];
    for (let r = rowStart; r <= rowEnd; r++) {
        const rowArr: { value: any; type: string; style: any }[] = [];
        for (let c = colStart; c <= colEnd; c++) {
            const item = excelData[r] && excelData[r][c];
            if (item) {
                rowArr.push({
                    value: item[2],
                    type: item[1],
                    style: JSON.parse(JSON.stringify(item[3])),
                });
            } else {
                rowArr.push({ value: '', type: 'txt', style: null });
            }
        }
        cells.push(rowArr);
    }

    internalClipboard = {
        rows: rowEnd - rowStart + 1,
        cols: colEnd - colStart + 1,
        cells,
        isCut,
    };

    // 同步写入系统剪贴板（纯文本，制表符/换行分隔）
    writeSystemClipboard(internalClipboard);

    return internalClipboard;
};

// 写入系统剪贴板
let writeSystemClipboard = (data: ClipboardData): void => {
    const text = data.cells
        .map((row) => row.map((cell) => (cell.value == null ? '' : String(cell.value))).join('\t'))
        .join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {
            // 忽略权限错误，内部剪贴板仍可用
        });
    }
};

// 获取内部剪贴板数据
let getClipboard = (): ClipboardData | null => {
    return internalClipboard;
};

// 粘贴到目标位置（以 targetRow/targetCol 为左上角）
// keepStyle: 是否保留样式；withValues: 外部纯文本（可选，用于跨应用粘贴）
let pasteToRegion = (
    excelData: any[][],
    targetRow: number,
    targetCol: number,
    keepStyle: boolean = true
): { rows: number; cols: number } | null => {
    if (!internalClipboard) return null;
    const { cells, rows, cols } = internalClipboard;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const destR = targetRow + r;
            const destC = targetCol + c;
            const dest = excelData[destR] && excelData[destR][destC];
            if (!dest) continue;
            const src = cells[r][c];
            dest[2] = src.value;
            dest[1] = src.type || 'txt';
            if (keepStyle && src.style) {
                dest[3] = JSON.parse(JSON.stringify(src.style));
            }
            // 粘贴的单元格不继承合并状态
            dest[0] = [1, 1];
        }
    }

    // 剪切模式：粘贴后清空源数据（内部标记，源清空由调用方处理）
    return { rows, cols };
};

// 由纯文本构造剪贴板（用于跨应用粘贴场景）
let parseTextToClipboard = (text: string): ClipboardData | null => {
    if (!text) return null;
    const lines = text.replace(/\r\n/g, '\n').split('\n');
    // 去掉尾部空行
    while (lines.length > 1 && lines[lines.length - 1] === '') {
        lines.pop();
    }
    const cells = lines.map((line) => {
        return line.split('\t').map((val) => ({ value: val, type: 'txt', style: null }));
    });
    const rows = cells.length;
    const cols = cells.reduce((max, r) => Math.max(max, r.length), 0);
    internalClipboard = { rows, cols, cells, isCut: false };
    return internalClipboard;
};

let clearClipboard = (): void => {
    internalClipboard = null;
};

export {
    copyRegion,
    pasteToRegion,
    getClipboard,
    parseTextToClipboard,
    clearClipboard,
    ClipboardData,
};
