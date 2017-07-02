// Can be impure

import { UPDATE_FILTER } from "./actions";
import { IFilters, IResults } from "../models/filterModels";

export interface IUpdateFilterActionCreator {
    type: string;
    filters: IFilters;
    results: IResults;
}
export function updateFilter(filters: IFilters): IUpdateFilterActionCreator {
    return {
        type: UPDATE_FILTER,
        filters: filters
    } as IUpdateFilterActionCreator;
}
