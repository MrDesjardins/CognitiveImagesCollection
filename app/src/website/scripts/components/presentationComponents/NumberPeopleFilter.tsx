import * as React from "react";
import { IFilters } from "../../models/filterModels";
import { ChangeEventHandler, FormEvent, EventHandler } from "react";
export interface INumberPeopleFilterProps {
    numberOfPeople: number;
    onChange: (numberOfPeople: number) => void;
}

export class NumberPeopleFilter extends React.Component<INumberPeopleFilterProps, undefined> {
    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }

    public render(): JSX.Element {
        return <div>
            <h4>Number of people</h4>
            <input
                type="number"
                value={this.props.numberOfPeople}
                onChange={this.onChange}
            />
        </div>
            ;
    }

    public onChange(event: any): void {
        const value = parseInt(event.target.value, 10);
        if (isNaN(value)) {
            this.props.onChange(0);
        } else {
            this.props.onChange(parseInt(event.target.value, 10));
        }
    }
}