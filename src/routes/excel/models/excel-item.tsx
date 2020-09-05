let excelItemModel =  [
    [
        // 合并单元格方案1:通过行列坐标位置定位
        'start_colum',  //开始列
        'start_row',    //开始行
        'end_colum',    //结束列
        'end_row',       //结束行,

        // 合并单元格方案2:通过单元格位置信息定位
        'left',   // 左侧
        'top',    // 顶部
        'width',  // 宽度
        'height', // 高度
    ],     
    'txt', //内容类型 txt|img|...
    'value', //内容
    {
        'text':{
            'color':'#000',
            'fontStyle': 'normal' || 'italic',
            'fontWeight': 'normal' || 'bold',
            'textAlign': 'center' || 'right' || 'center',
        },
        'line':{
            'textLine':'underline' || 'normal'
        },
        'bg': {
            fillStyle:"#fff"
        }
    }
]

export { excelItemModel }