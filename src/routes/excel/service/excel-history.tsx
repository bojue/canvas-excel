// Excel 撤销/重做历史管理
// 采用全量快照策略：每次修改前记录 excelData + config 的深拷贝

interface HistorySnapshot {
    excelData: any[][];
    merge: any[];
}

class HistoryManager {
    private undoStack: HistorySnapshot[] = [];
    private redoStack: HistorySnapshot[] = [];
    private maxSize: number;

    constructor(maxSize: number = 50) {
        this.maxSize = maxSize;
    }

    // 深拷贝生成快照
    private clone(excelData: any[][], merge: any[]): HistorySnapshot {
        return {
            excelData: JSON.parse(JSON.stringify(excelData)),
            merge: JSON.parse(JSON.stringify(merge || [])),
        };
    }

    // 记录当前状态到 undo 栈（在修改发生前调用）
    record(excelData: any[][], merge: any[]): void {
        this.undoStack.push(this.clone(excelData, merge));
        if (this.undoStack.length > this.maxSize) {
            this.undoStack.shift();
        }
        // 新操作发生后，清空 redo 栈
        this.redoStack = [];
    }

    // 撤销：返回上一个状态，需传入当前状态用于压入 redo 栈
    undo(currentData: any[][], currentMerge: any[]): HistorySnapshot | null {
        if (this.undoStack.length === 0) return null;
        this.redoStack.push(this.clone(currentData, currentMerge));
        return this.undoStack.pop()!;
    }

    // 重做：返回下一个状态，需传入当前状态用于压回 undo 栈
    redo(currentData: any[][], currentMerge: any[]): HistorySnapshot | null {
        if (this.redoStack.length === 0) return null;
        this.undoStack.push(this.clone(currentData, currentMerge));
        return this.redoStack.pop()!;
    }

    canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    clear(): void {
        this.undoStack = [];
        this.redoStack = [];
    }
}

export { HistoryManager, HistorySnapshot };
