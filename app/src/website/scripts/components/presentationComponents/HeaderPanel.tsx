import * as React from "react";

export interface HeaderPanelProps {

}
export class HeaderPanel extends React.Component<HeaderPanelProps, undefined> {
    public render() {
        return <div id="header-panel" className="jumbotron">
            <div className="container">
                <h1>Cognitive Images Collection</h1>
            </div>
        </div>
    }
}