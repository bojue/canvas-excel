let excelItem = [
    [
        [
            'start_colum',  //开始列
            'start_row',    //开始行
            'end_colum',    //结束列
            'end_row'       //结束行
        ],     
        'txt', 
        'value',    
        {
            'text':{
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

export { excelItem }