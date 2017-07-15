// Can be impure

import { IUpdateFilterAction, actionApplyRequest, actionApplyResponse, actionFilterChanged } from "./actions";
import { IFilters, IResults, IAppState } from "../models/filterModels";
import { ThunkAction } from "redux-thunk";
import { Dispatch } from "redux";
import { ImageDataProvider } from "../dataproviders/imageDataProviders";

export function applyFilter(): ThunkAction<void, IAppState, void> {
    return (dispatch: Dispatch<IUpdateFilterAction>, getState: () => IAppState, extra: any) => {

        const provider = new ImageDataProvider();
        const filters = getState().filters;
        provider.getBeersListWithFilter(filters).then((result: IResults) => {
            console.log("Action Creator Result : " + result);
            dispatch(actionApplyResponse(result));
        });

        return dispatch(actionApplyRequest());
    };
}

export function filterChanged(filters: IFilters): IUpdateFilterAction {
    return actionFilterChanged(filters);
}
