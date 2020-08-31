let excelItemModel =  [
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
            'color':'#000',
            'fontStyle': 'normal' || 'italic',
            'fontWeight': 'lighter' ||'normal' || 'bold',
            'textAlign': 'center' || 'right' || 'left',
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