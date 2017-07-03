import * as React from "react";
import { IFilters } from "../../models/filterModels";
import { ChangeEventHandler, FormEvent, EventHandler } from "react";
import { TagPresentation } from "./Tags";
export interface IFiltersPresentationProps {
    filters: IFilters;
    onApply: () => void;
    filterChange: (filters: IFilters) => void;
}

export class FiltersPresentation extends React.Component<IFiltersPresentationProps, undefined> {
    private bw: HTMLInputElement;
    private startDate: HTMLInputElement;
    private endDate: HTMLInputElement;
    private numberOfPeople: HTMLInputElement;
    private peopleName: HTMLInputElement;
    private smileRange: HTMLInputElement;
    private hapinessRange: HTMLInputElement;

    constructor() {
        super();
    }
    public render(): JSX.Element {
        return <div id="sidebar-panel" className="col-md-3">
            <h3>Filters</h3>
            <div className="row">
                <div className="col-md-12 col-sm-6 col-xs-12">
                    <TagPresentation
                        defaultValue={this.props.filters.tags.join(",")}
                        onChange={(value: string) => { this.props.filterChange(this.getRefreshedState(value)); }}
                    />
                </div>
                <div className="col-md-12 col-sm-6 col-xs-12">
                    <h4>Is BW?</h4>
                    <input
                        ref={(input) => { this.bw = input; }}
                        type="checkbox"
                        checked={this.props.filters.isBlackAndWhite} />
                </div>
                <div className="col-md-12 col-sm-6 col-xs-12">
                    <h4>Dates</h4>
                    <input
                        ref={(input) => { this.startDate = input; }}
                        type="date"
                        value={this.props.filters.startingDate.toISOString()} />
                    <input
                        ref={(input) => { this.endDate = input; }}
                        type="date"
                        value={this.props.filters.endingDate.toISOString()} />
                </div>
                <div className="col-md-12 col-sm-6 col-xs-12">
                    <h4>Number of people</h4>
                    <input
                        ref={(input) => { this.numberOfPeople = input; }}
                        type="number"
                        value={this.props.filters.numberOfPeople} />
                </div>

                <div className="col-md-12 col-sm-6 col-xs-12">
                    <h4>Name</h4>
                    <input
                        ref={(input) => { this.peopleName = input; }}
                        type="text"
                        value={this.props.filters.peopleName.join(",")} />
                </div>

                <div className="col-md-12 col-sm-6 col-xs-12">
                    <h4>Emotion</h4>
                    <h5>Smile</h5>
                    <input
                        ref={(input) => { this.smileRange = input; }}
                        type="range"
                        min="0"
                        max="1"
                        value={this.props.filters.smileLevel} />
                    <h5>Hapiness</h5>
                    <input
                        ref={(input) => { this.hapinessRange = input; }}
                        type="range"
                        min="0"
                        max="1"
                        value={this.props.filters.happinessLevel} />
                </div>

                <div className="row">
                    <div className="col-xs-12">
                        <button onClick={() => { this.props.onApply(); }}>Apply</button>
                    </div>
                </div>
            </div>
        </div>
    }

    private getRefreshedState(tags: string): IFilters {
        const currentState = this.props.filters;
        currentState.isBlackAndWhite = this.bw.value === "0";
        currentState.tags = tags.split(",");
        currentState.startingDate = new Date(this.startDate.value);
        currentState.endingDate = new Date(this.endDate.value);
        currentState.numberOfPeople = parseInt(this.numberOfPeople.value, 10);
        currentState.peopleName = this.peopleName.value.split(",");
        currentState.smileLevel = parseInt(this.smileRange.value, 10);
        currentState.happinessLevel = parseInt(this.hapinessRange.value, 10);
        return currentState;
    }
}