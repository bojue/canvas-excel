import React = require("react");

const GitHubImg = require('./../../../assets/github.svg');

export class GitHubComponent  extends React.Component<any, any>{
    render () {
        return <span className="github">
        <a href="https://github.com/bojue/canvas-excel" target="_black">
            <img src={ GitHubImg!.default} alt="github" title='github'/>
        </a>
    </span>
    }
}