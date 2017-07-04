import * as React from "react";
import { IFilters } from "../../models/filterModels";
import { ChangeEventHandler, FormEvent, EventHandler } from "react";
export interface IColorsProps {
    isBlackWhite: boolean;
    onChange: (isBlackWhite: boolean) => void;
}

export class ColorsFilter extends React.Component<IColorsProps, undefined> {
    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }

    public render(): JSX.Element {
        return <div>
            <h4>Is BW?</h4>
            <input
                type="checkbox"
                checked={this.props.isBlackWhite}
                onChange={this.onChange}
            />
        </div>
            ;
    }

    public onChange(event: any): void {
        this.props.onChange(event.target.checked);
    }
}