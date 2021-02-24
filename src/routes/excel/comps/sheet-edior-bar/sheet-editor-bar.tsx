import * as React from 'react';

export interface SheetEdiorObj {
    val:string,
    inputRef:any;
}

class SheetEditorBarComponent extends React.Component<any, any>  {
    inputRef:any;
    constructor(props:any) {
        super(props)
        this.initData();
    }

    initData() {
        this.inputRef =  React.createRef();
    }

    componentDidMount() {

    }

    onChange(e:Event) {
        let target =  e.target as HTMLTextAreaElement;
        this.props.changeValue(target.value);
    }

    render() {
        return <div className="current">
            <div className="item">
                <span className="current_coordinate">            
                    {(String.fromCharCode(65 +this.props.x ))}{this.props.y + 1} </span>
            </div>
            <div className="item">
                <input type="val" 
                    onChange ={this.onChange.bind(this)}
                    ref={this.inputRef} 
                    value={ this.props.val }/>
            </div>
        </div>
    }
}

export default SheetEditorBarComponent;