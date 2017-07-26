import * as React from "react";
import { IFilters } from "../../models/filterModels";
import { ChangeEventHandler, FormEvent, EventHandler } from "react";
export interface IHapinessFilterProps {
    value: number;
    onChange: (value: number) => void;
}

export class HapinessFilter extends React.Component<IHapinessFilterProps, undefined> {
    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }

    public render(): JSX.Element {
        return <div>
            <h5>Hapiness</h5>
            <input
                type="range"
                min="0"
                max="1"
                step="0.05"
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