let EXCEL_OBJ = {
    rows:[], // 行
    columns:[], // 列
    datas:[] // 数据对象
}

let EXCLE_DATAS = [
    [
        [
            'start_colum',  //开始列
            'start_row',    //开始行
            'end_colum',    //结束列
            'end_row'       //结束行
        ],     
        'txt',          
        {
            'font':{
                'fillStyle':null,
                'fontStyle':'normal' || 'italic',
                'fontWeight':'normal' || 'bold',
                'textAlign': 'center' || 'right' || 'left',
            },
            'line':{
                'textLine':'underline'
            },
            'bg': {
                fillStyle:"#fff"
            }
        }
    ]
]