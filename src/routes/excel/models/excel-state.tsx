let excelStateModel = {
    // Excel下标工具栏参数
    changeSizeState: 'change_size_h',
    change_size_w:0,
    change_size_h:0,
    change_size_title_l: 0,
    change_size_title_t: 0,
    change_size_title_w:0,
    change_size_title_h:0,
    change_size_current_index:-1,
                 
    // Excel下标工具栏操作状态坐标参数
    currentLabel_left:400,
    currentLabel_top:-22,
    currentLabel_val:22,

    /**
    * Excel下标/区域鼠标状态维护|
    * m_up
    * m_move
    * m_down
    * m_drag
    */ 
    mouse_state:'m_up', 
    /**
     * 鼠标事件维护|
     * init
     * w
     * h
     * sel_area
     */
    mouse_event_type:'init', 

    currentLabel_mouse_state:'m_up',
    // 可输入状态DOM参数
    editor_width:0,
    editor_height:0,
    editor_top:0,
    editor_left:0,
    editor_text:"",
    editor_display:'none',
    editor_coordinate_x:0,
    editor_coordinate_y:0,
    editor_coordinate_val:"",

    // 工具栏下标拖拽参数
    change_size_top:0,
    change_size_left:0,
    change_size_display:0,

    // 区域选择参数
    regional_sel_x:0, // 焦点位置
    regional_sel_y:0, // 焦点位置
    regional_sel_state:0, // 选中区域状态
    regional_sel:[0,0,0,0], // _l,_t,_w,_h
    regional_sel_by_click_state:0,// 点击选中状态
    regional_sel_l:0,  // 选中区域left
    regional_sel_t:0, // 选中区域top
    regional_sel_start:[-1, -1], // 开始坐标
    regional_sel_end:[-1,1], //结束坐标
    regional_cantch_before:[0, 0], // 焦点区域位置缓存
    regional_sel_width:0,
    regional_sel_height:0,
    regional_sel_x_count:0, // 行网格数
    regional_sel_y_conut:0, // 列网格数

    // 扩展属性设置
    extended_attribute_font_color_state: false, //展示字体颜色扩展部分
    extended_attribute_font_color:'#000', //当前字体的颜色，方便获取当前字体的颜色
    extended_attribute_font_weight:"normal", //当前区域的字体粗细
    extended_attribute_font_style:'normal',  //当前区域的字体样式
    extended_attribute_font_size:'normal',  //当前区域的字体样式
    extended_attribute_font_family:'normal',  //当前区域的字体样式
    
    extended_attribute_rect_fillstyle_state: false, // 展示填充色扩展部分
    extended_attribute_rect_fillstyle:'#fff', //设置填充色
}

export { excelStateModel }