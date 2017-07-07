import * as React from "react";
import { IFilters } from "../../models/filterModels";
import { ChangeEventHandler, FormEvent, EventHandler } from "react";
export interface ISmileFilterProps {
    value: number;
    onChange: (value: number) => void;
}

export class SmileFilter extends React.Component<ISmileFilterProps, undefined> {
    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }

    public render(): JSX.Element {
        return <div>
            <h5>Smile</h5>
            <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={this.props.value}
                onChange={this.onChange}
            />
        </div>
            ;
    }

    public onChange(event: any): void {
        this.props.onChange(parseFloat(event.target.value));
    }
}