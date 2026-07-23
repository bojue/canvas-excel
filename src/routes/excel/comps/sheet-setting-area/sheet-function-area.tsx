import * as React from 'react';
import { GitHubComponent } from '../../../../commount/components/github/github';
import { txtFamilys ,txtSizes, txtCols, rectFillStylesCols } from '../../models/excle-setting-data';

class SheetSettingAreaComponent extends React.Component<any, any>  {
    inputRef:any;
    txtFamilys:any[];
    txtSizes:any[];
    txtCols:any[];
    rectFillStylesCols:any[];
    
    constructor(props:any) {
        super(props)
        this.initData();
    }

    initData() {
        this.inputRef =  React.createRef();
        this.txtFamilys = txtFamilys;
        this.txtSizes = txtSizes;
        this.txtCols = txtCols;
        this.rectFillStylesCols = rectFillStylesCols;
    }

    componentDidMount() {

    }

    mergeFun(state:string) {
        this.props.changeMergeState(state);
    }

    fileFun(action:string) {
        switch(action) {
            case 'save': this.props.onSave && this.props.onSave(); break;
            case 'load': this.props.onLoad && this.props.onLoad(); break;
            case 'exportJSON': this.props.onExportJSON && this.props.onExportJSON(); break;
            case 'exportCSV': this.props.onExportCSV && this.props.onExportCSV(); break;
            case 'import': this.props.onImport && this.props.onImport(); break;
        }
    }

    changeStyle(style:string, parames:string, val:string) {
        this.props.changeStyle(style, parames, val);
    }

    extendedAttribute(params:string) {
        this.props.changeAttribute(params);
    }

    onChange(e:Event) {
        let target =  e.target as HTMLTextAreaElement;
        this.props.changeValue(target.value);
    }

    render() {
        return  <div className="setting">
        <span className="item item-history">
            <span className="file-btn" onClick={() => this.props.onUndo && this.props.onUndo()} title="撤销 (Ctrl+Z)">撤销</span>
            <span className="file-btn" onClick={() => this.props.onRedo && this.props.onRedo()} title="重做 (Ctrl+Y)">重做</span>
        </span>
        <span className="item item-fz">
            <div className="f-family" style={{
                fontFamily:this.props.family
            }}>
                <span className="name">
                    <span className="val">
                        {this.props.family}
                    </span>
                <img src={
                    this.props.imgs.Down!.default
                } 
                onClick={this.extendedAttribute.bind(this, 'extended_attribute_font_family_state')}
                alt="字体" title="字体"/>
                
                </span>
                {
                    this.props.family_state && 
                    <span className="attr-familys">
                        <div className="fams">
                        { this.txtFamilys.map((family, ind) => {
                                return <span key={ind} onClick={this.changeStyle.bind(this, 'text','fontFamily',family)} className="fams-item">
                                        <span className="lab"
                                        style={{fontFamily:family}}>{family}</span>
                                    </span>
                            })}
                        </div>  
                    </span>
                }
            </div>
            <div className="f-size">
                <span className="name">
                    <span className="val">
                        {this.props.font_size}
                    </span>
                <img src={
                    this.props.imgs.Down!.default
                } 
                onClick={this.extendedAttribute.bind(this, 'extended_attribute_font_size_state')}
                alt="字体大小" title="字体大小"/>
                </span>
                {
                    this.props.font_size_state && 
                    <span className="attr-familys f-size">
                        <div className="fams">
                        { this.txtSizes.map((size, ind) => {
                                return <span key={ind} onClick={this.changeStyle.bind(this, 'text','fontSize', size)} className="fams-item">
                                        <span className="lab">{size}</span>
                                    </span>
                            })}
                        </div>  
                    </span>
                }
            </div>
        </span>
        <span className="item">
            <img onClick={
                this.changeStyle.bind(this, 'text','fontWeight',this.props.font_weight === 'normal' ? 'bold' : 'normal')} 
                src={ this.props.imgs.F_Blod!.default} 
                className = {
                    this.props.font_weight === 'bold' ? 'active': ''
                }
                alt="" 
                title="粗体"/>
            <img onClick={
                this.changeStyle.bind(this, 'text','fontStyle', this.props.font_style === 'normal' ? 'italic': 'normal')} 
                className = {
                    this.props.font_style === 'italic' ? 'active': ''
                }
                src={ this.props.imgs.F_Ltalic!.default} 
                alt="" 
                title="斜体"/>
        </span>
        
        <span className="item">
            <span className="extend-attribute">
                <img onClick={this.extendedAttribute.bind(this, 'extended_attribute_font_color_state')} src={   this.props.imgs.F_Color!.default} alt="" title="字体颜色"/>
                <span className="color" style={{
                    background:this.props.font_color
                }}></span>
                {
                    this.props.font_color_state && 
                    <span className="attr-cols">
                        <span className="item col">
                            <div className="cols">
                            { this.txtCols.map((col, ind) => {
                                    return <span key={ind} onClick={this.changeStyle.bind(this, 'text','color',col)} className="col-item"
                                        style={{background:col}}></span>
                                })}
                            </div>
                        </span>       
                    </span>
                }
            </span>
            <span className="extend-attribute">
                <img onClick={this.extendedAttribute.bind(this, 'extended_attribute_rect_fillstyle_state')} src={  this.props.imgs.BG!.default} alt="" title="字体颜色"/>
                <span className="color" style={{
                    background:this.props.rect_fillstyle
                }}></span>
                {
                    this.props.rect_fillstyle_state && 
                    <span className="attr-cols fillstyles">
                        <span className="item col">
                            <div className="cols">
                            { this.rectFillStylesCols.map((col, ind) => {
                                    return <span key={ind} onClick={this.changeStyle.bind(this, 'rect','fillStyle',col) } className="col-item"
                                        style={{background:col}}></span>
                                })}
                            </div>
                        </span>       
                    </span>
                }
            </span>
        </span>
        <span className="item">
            <img src={ this.props.imgs.F_L!.default} alt="" title="居左" onClick={this.changeStyle.bind(this, 'text', 'textAlign', 'left')}/>
            <img src={ this.props.imgs.F_C!.default} alt="" title="居中" onClick={this.changeStyle.bind(this, 'text', 'textAlign', 'center')}/>
            <img src={ this.props.imgs.F_R!.default} alt="" title="居右" onClick={this.changeStyle.bind(this, 'text', 'textAlign', 'right')}/>
        </span>
        <span className="item">
            <img onClick={this.mergeFun.bind(this, 'merge')} src={ this.props.imgs.Merge!.default} alt="" title="合并"/>
            <img onClick={this.mergeFun.bind(this, 'unmerge')} src={ this.props.imgs.UnMerge!.default} alt="" title="取消合并"/>
        </span>
        <span className="item item-file">
            <span className="file-btn" onClick={this.fileFun.bind(this, 'exportCSV')} title="导出为 CSV">导出CSV</span>
        </span>
        <GitHubComponent/>
    </div>
    }
}

export default SheetSettingAreaComponent;