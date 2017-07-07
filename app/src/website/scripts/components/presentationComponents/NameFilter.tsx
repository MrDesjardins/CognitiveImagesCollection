import * as React from "react";
import { IFilters } from "../../models/filterModels";
import { ChangeEventHandler, FormEvent, EventHandler } from "react";
export interface INameFilterProps {
    names: string[];
    onChange: (names: string[]) => void;
}

export class NameFilter extends React.Component<INameFilterProps, undefined> {
    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }

    public render(): JSX.Element {
        return <div>
            <h4>Names</h4>
            <input
                type="text"
                value={this.props.names.join(",")} 
                onChange={this.onChange}
                />
        </div>
            ;
    }

    public onChange(event: any): void {
        this.props.onChange(event.target.value.split(","));
    }
}