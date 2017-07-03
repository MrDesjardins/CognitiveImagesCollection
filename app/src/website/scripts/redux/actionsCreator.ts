// Can be impure

import { FILTER_APPLIED, FILTER_CHANGED } from "./actions";
import { IFilters, IResults } from "../models/filterModels";

export interface IUpdateFilterActionCreator {
    type: string;
    filters: IFilters;
    results: IResults;
}

export interface IChangedFilterActionCreator {
    type: string;
    filterName: string;
    value: any;
}
export function updateFilter(): IUpdateFilterActionCreator {
    return {
        type: FILTER_APPLIED
    } as IUpdateFilterActionCreator;
}

export function filterChanged(filters: IFilters): IUpdateFilterActionCreator {
    return {
        type: FILTER_CHANGED,
        filters: filters
    } as IUpdateFilterActionCreator;
}
