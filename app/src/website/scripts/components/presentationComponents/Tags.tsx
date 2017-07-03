import * as React from "react";
import { IFilters } from "../../models/filterModels";
import { ChangeEventHandler, FormEvent, EventHandler } from "react";
export interface ITagsProps {
    defaultValue: string;
    onChange: (tags: string) => void;
}

export class TagPresentation extends React.Component<ITagsProps, undefined> {
    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }

    public render(): JSX.Element {
        return <div><h4>Tags</h4>
            <input
                type="text"
                value={this.props.defaultValue}
                onChange={this.onChange}
            />
        </div>;
    }

    public onChange(event: any): void {
        this.props.onChange(event.target.value);
    }
}