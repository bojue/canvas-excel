// 视口 / 分区（pane）工具
//
// 坐标约定：
//   columnLefts[c] = 第 c 列的“右边缘”逻辑绝对坐标（累加，含表头原点）
//   rowTops[r]     = 第 r 行的“下边缘”逻辑绝对坐标
//   表头原点：x = def.columTitleDefWidth, y = def.rowTitleHeight
//
//   物理坐标 = 逻辑坐标 - scroll （body 区）
//   冻结区（表头 + 前 freezeCols 列 / freezeRows 行）不减 scroll
//
// viewport = { scrollLeft, scrollTop, freezeRows, freezeCols }

const VIEW_W = 1400;
const VIEW_H = 800; // 默认视口高度,实际由 Excel 组件动态计算

// 冻结区右边缘（物理 x）：表头 + 前 freezeCols 列。freezeCols=0 时即表头右缘。
let getFrozenX = (setting: any, def: any, freezeCols: number): number => {
    if (!freezeCols || freezeCols <= 0) return def.columTitleDefWidth;
    let idx = Math.min(freezeCols - 1, setting.columnLefts.length - 1);
    return setting.columnLefts[idx];
};

// 冻结区下边缘（物理 y）：表头 + 前 freezeRows 行。
let getFrozenY = (setting: any, def: any, freezeRows: number): number => {
    if (!freezeRows || freezeRows <= 0) return def.rowTitleHeight;
    let idx = Math.min(freezeRows - 1, setting.rowTops.length - 1);
    return setting.rowTops[idx];
};

// 内容总宽 / 总高（逻辑）
let getContentWidth = (setting: any, def: any): number => {
    let arr = setting.columnLefts;
    return arr && arr.length ? arr[arr.length - 1] : def.columTitleDefWidth;
};
let getContentHeight = (setting: any, def: any): number => {
    let arr = setting.rowTops;
    return arr && arr.length ? arr[arr.length - 1] : def.rowTitleHeight;
};

// 滚动上限
let getMaxScroll = (setting: any, def: any): { maxX: number; maxY: number } => {
    return {
        maxX: Math.max(0, getContentWidth(setting, def) - VIEW_W),
        maxY: Math.max(0, getContentHeight(setting, def) - VIEW_H),
    };
};

// 钳制 viewport.scroll 到 [0, max]，原地修改并返回
let clampScroll = (viewport: any, setting: any, def: any): any => {
    let { maxX, maxY } = getMaxScroll(setting, def);
    viewport.scrollLeft = Math.max(0, Math.min(viewport.scrollLeft || 0, maxX));
    viewport.scrollTop = Math.max(0, Math.min(viewport.scrollTop || 0, maxY));
    return viewport;
};

// 物理 x -> 逻辑 x：落在冻结区不加 scroll
let toLogicalX = (physX: number, viewport: any, frozenX: number): number => {
    if (physX <= frozenX) return physX;
    return physX + (viewport.scrollLeft || 0);
};
let toLogicalY = (physY: number, viewport: any, frozenY: number): number => {
    if (physY <= frozenY) return physY;
    return physY + (viewport.scrollTop || 0);
};

// 逻辑 x -> 物理 x：逻辑落在冻结区不减 scroll
let toPhysicalX = (logX: number, viewport: any, frozenX: number): number => {
    if (logX <= frozenX) return logX;
    return logX - (viewport.scrollLeft || 0);
};
let toPhysicalY = (logY: number, viewport: any, frozenY: number): number => {
    if (logY <= frozenY) return logY;
    return logY - (viewport.scrollTop || 0);
};

// 归一化 viewport（兼容旧存档缺字段）
let normalizeViewport = (vp: any): any => {
    return {
        scrollLeft: (vp && vp.scrollLeft) || 0,
        scrollTop: (vp && vp.scrollTop) || 0,
        freezeRows: vp && typeof vp.freezeRows === 'number' ? vp.freezeRows : 1,
        freezeCols: vp && typeof vp.freezeCols === 'number' ? vp.freezeCols : 1,
    };
};

export {
    VIEW_W,
    VIEW_H,
    getFrozenX,
    getFrozenY,
    getContentWidth,
    getContentHeight,
    getMaxScroll,
    clampScroll,
    toLogicalX,
    toLogicalY,
    toPhysicalX,
    toPhysicalY,
    normalizeViewport,
};
