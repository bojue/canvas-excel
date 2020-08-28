let excelObjectModel = {
    info:{
        title:"Excel",
        scalingRatio: /macintosh|mac os x/i.test(navigator.userAgent) ? 2: 1,
        width:0,
        height:0,
        left:60,
        top:25
    },

    // 选择的区域
    selection_board: {
        width:0,
        height:0,
        left:0,
        top:0,
        activeRows:[],
        activeColums:[]
    },
    setting_def:{
        width:60,
        height:20,
        rowTitleHeight:25,
        columTitleDefWidth:30,
    },
    setting_custome: {
        row:[20,20,20,20,10,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,2020,20,20,20,20,20,20,20,20],
        rowTops:[],
        column:[60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60],
        columnLefts:[]
    }
}

export { excelObjectModel }