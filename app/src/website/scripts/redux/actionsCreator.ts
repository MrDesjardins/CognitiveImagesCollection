// Can be impure

import { IUpdateFilterAction, actionApplyRequest, actionApplyResponse, actionFilterChanged } from "./actions";
import { IFilters, IResults, IAppState } from "../models/filterModels";
import { ThunkAction } from "redux-thunk";
import { Dispatch } from "redux";

export function applyFilter(): ThunkAction<void, IAppState, void> {
    return (dispatch: Dispatch<IUpdateFilterAction>, getState: () => IAppState, extra: any) => {
        // return null;
        setTimeout(() => {
            const fakePayload = {} as IResults; // Simulate date from response through Ajax response
            dispatch(actionApplyResponse(fakePayload));
        }, 1500);

        return dispatch(actionApplyRequest());
    };
}

export function filterChanged(filters: IFilters): IUpdateFilterAction {
    return actionFilterChanged(filters);
}
