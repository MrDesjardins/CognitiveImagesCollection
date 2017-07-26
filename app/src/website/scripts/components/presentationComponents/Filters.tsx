import * as React from "react";
import { IFilters } from "../../models/filterModels";
import { ChangeEventHandler, FormEvent, EventHandler } from "react";
import { TagsFilter } from "./TagsFilter";
import { ColorsFilter } from "./ColorFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import { NumberPeopleFilter } from "./NumberPeopleFilter";
import { NameFilter } from "./NameFilter";
import { SmileFilter } from "./SmileFilter";
import { HapinessFilter } from "./HapinessLevel";
export interface IFiltersPresentationProps {
    filters: IFilters;
    onApply: () => void;
    filterChange: (filters: IFilters) => void;
}

export class Filters extends React.Component<IFiltersPresentationProps, undefined> {
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
                    <TagsFilter
                        defaultValue={this.props.filters.tags}
                        onChange={(value: string[]) => { this.props.filters.tags = value; this.refresh(); }}
                    />
                </div>
                <div className="col-md-12 col-sm-6 col-xs-12">
                    <ColorsFilter
                        isBlackWhite={this.props.filters.isBlackAndWhite}
                        onChange={(value: boolean) => { this.props.filters.isBlackAndWhite = value; this.refresh(); }}
                    />
                </div>
                <div className="col-md-12 col-sm-6 col-xs-12">
                    <DateRangeFilter
                        date1={this.props.filters.startingDate}
                        date2={this.props.filters.endingDate}
                        onChange={(v1: Date, v2: Date) => { this.props.filters.startingDate = v1; this.props.filters.endingDate = v2; this.refresh(); }}
                    />
                </div>
                <div className="col-md-12 col-sm-6 col-xs-12">
                    <NumberPeopleFilter
                        numberOfPeople={this.props.filters.numberOfPeople}
                        onChange={(numberPeople: number) => { this.props.filters.numberOfPeople = numberPeople; this.refresh(); }}
                    />
                </div>
                <div className="col-md-12 col-sm-6 col-xs-12">
                    <NameFilter
                        names={this.props.filters.peopleNames}
                        onChange={(names: string[]) => { this.props.filters.peopleNames = names; this.refresh(); }}
                    />
                </div>
                <div className="col-md-12 col-sm-6 col-xs-12">
                    <h4>Emotion</h4>
                    <SmileFilter
                        value={this.props.filters.smileLevel}
                        onChange={(smileLevel: number) => { this.props.filters.smileLevel = smileLevel; this.refresh(); }}
                    />
                    <HapinessFilter
                        value={this.props.filters.happinessLevel}
                        onChange={(hapinessLevel: number) => { this.props.filters.happinessLevel = hapinessLevel; this.refresh(); }}
                    />
                </div>

                <div className="row">
                    <div className="col-xs-12">
                        <button onClick={() => { this.props.onApply(); }}>Apply</button>
                    </div>
                </div>
            </div>
        </div>
    }

    private refresh(): void {
        this.props.filterChange(this.props.filters);
    }
}