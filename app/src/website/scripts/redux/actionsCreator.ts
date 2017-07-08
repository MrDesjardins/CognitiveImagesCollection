// Can be impure

import { FILTER_APPLIED_REQUEST, FILTER_CHANGED, FILTER_APPLIED_RESPONSE } from "./actions";
import { IFilters, IResults } from "../models/filterModels";
import { ThunkAction } from "redux-thunk";
import { Dispatch } from "redux";
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
export function applyFilter(): Dispatch<IUpdateFilterActionCreator> {
    return (dispatch: Dispatch<IUpdateFilterActionCreator>) => {
        dispatch({
            type: FILTER_APPLIED_REQUEST
        } as IUpdateFilterActionCreator);

        setTimeout(() => {
            const fakePayload = {} as IResults;
            dispatch({
                type: FILTER_APPLIED_RESPONSE,
                results: fakePayload
            } as IUpdateFilterActionCreator);
        }, 1500);
    };
}

export function filterChanged(filters: IFilters): IUpdateFilterActionCreator {
    return {
        type: FILTER_CHANGED,
        filters: filters
    } as IUpdateFilterActionCreator;
}
