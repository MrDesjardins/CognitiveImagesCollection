import * as React from "react";
import { IFilters } from "../../models/filterModels";
import { ChangeEventHandler, FormEvent, EventHandler } from "react";
export interface IFiltersPresentationProps {
    filters: IFilters;
    onApply: (filters: IFilters) => void;
}

export class FiltersPresentation extends React.Component<IFiltersPresentationProps, undefined> {
    private bw: HTMLInputElement;
    private tags: HTMLInputElement;

    constructor() {
        super();
        this.applyFiltersOnClick = this.applyFiltersOnClick.bind(this);
    }
    public render() {
        return <div id="sidebar-panel" className="col-md-3">
            <h3>Filters</h3>
            <div className="row">
                <div className="col-md-12 col-sm-6 col-xs-12">
                    <h4>Tags</h4>
                    <input
                        ref={(input) => { this.tags = input; }}
                        type="text"
                        value={this.props.filters.tags.join(",")} />
                </div>
                <div className="col-md-12 col-sm-6 col-xs-12">
                    <h4>Is BW?</h4>
                    <input
                        ref={(input) => { this.bw = input; }}
                        type="checkbox"
                        checked={this.props.filters.isBlackAndWhite} />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-12">
                    <button onClick={this.applyFiltersOnClick}>Apply</button>
                </div>
            </div>
        </div>
    }

    private applyFiltersOnClick(): void {
        const currentState = this.props.filters;
        currentState.isBlackAndWhite = this.bw.value === "0";
        currentState.tags = this.tags.value.split(",");
        this.props.onApply(currentState);
    }
}