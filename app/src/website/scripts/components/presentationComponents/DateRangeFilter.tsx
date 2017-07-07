import * as React from "react";
import { IFilters } from "../../models/filterModels";
import { ChangeEventHandler, FormEvent, EventHandler } from "react";
export interface IDateRangeProps {
    date1: Date,
    date2: Date,
    onChange: (date1: Date, date2: Date) => void;
}

export class DateRangeFilter extends React.Component<IDateRangeProps, undefined> {
    private date1: HTMLInputElement;
    private date2: HTMLInputElement;

    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }

    public render(): JSX.Element {
        return <div>
            <h4>Dates</h4>
            <input
                type="date"
                ref={(input) => { this.date1 = input; }}
                value={this.props.date1.toISOString().substring(0, 10)}
                onChange={this.onChange}
            />
            <input
                type="date"
                ref={(input) => { this.date2 = input; }}
                value={this.props.date2.toISOString().substring(0, 10)}
                onChange={this.onChange}
            />
        </div>
            ;
    }

    public onChange(event: any): void {
        this.props.onChange(new Date(this.date1.value), new Date(this.date2.value));
    }
}