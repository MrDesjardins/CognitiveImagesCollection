import * as React from "react";
import { IResults } from "../../models/filterModels";

export interface ResultPanelProps {
    results: IResults;
}

export class ResultPanel extends React.Component<ResultPanelProps, undefined> {
    public render(): JSX.Element {
        console.log("Render Result Panel");
        return <div id="result-panel" className="col-md-9" > </div>;
    }
}

