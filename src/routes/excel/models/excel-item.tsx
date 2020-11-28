let excelItemModel =  [
    [
        // 合并单元格方案1:通过行列坐标位置定位
        'end_colum',    //结束列
        'end_row',       //结束行,
    ],     
    'txt', //内容类型 txt|img|...
    'value', //内容
    {
        'text':{
            'color':'#000',
            'fontStyle': 'normal' || 'italic',
            'fontFamily':'微软雅黑',
            'fontSize':10,
            'fontWeight': 'normal' || 'bold',
            'lineHeight':10,
            'textAlign': 'center' || 'right' || 'center',
        },
        'line':{
            'textLine':'underline' || 'normal'
        },
        'rect': {
            'fillStyle':"#fff"
        }
    }
]

export { excelItemModel }