// What is happening?
import { IFilters, IResults } from "../models/filterModels";

export const RESET = "RESET";
export const FILTER_CHANGED = "FILTER_CHANGED";
export const FILTER_APPLIED_REQUEST = "FILTER_REQUEST";
export const FILTER_APPLIED_RESPONSE = "FILTER_RESPONSE";

export interface IUpdateFilterAction {
    type: string;
    filters: IFilters;
    results: IResults;
}

export interface IChangedFilterAction {
    type: string;
    filterName: string;
    value: any;
}

export function actionApplyRequest(): IUpdateFilterAction {
    return {
        type: FILTER_APPLIED_REQUEST
    } as IUpdateFilterAction;
}


export function actionApplyResponse(results: IResults): IUpdateFilterAction {
    return {
        type: FILTER_APPLIED_RESPONSE,
        results: results
    } as IUpdateFilterAction;
}

export function actionFilterChanged(newFilters: IFilters): IUpdateFilterAction {
    return {
        type: FILTER_CHANGED,
        filters: newFilters
    } as IUpdateFilterAction;
}