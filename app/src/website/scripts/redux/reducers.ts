// Modify the store state
// Pure function
// Always return a new object

import { UPDATE_FILTER, RESET, SHOW_RESULT } from "./actions";
import { IAppState, IResults, IFilters } from "../models/filterModels";
import { IUpdateFilterActionCreator } from "./actionsCreator";

const initialState = {
    filters: {
        tags: [],
        isBlackAndWhite: false,
        startingDate: undefined,
        endingDate: undefined,
        numberOfPeople: undefined,
        smileLevel: undefined,
        hapinessLevel: undefined,
        peopleName: []
    } as IFilters
    , results: {
        pictureResults: []
    } as IResults
} as IAppState;

export function appReducer(state: IAppState = initialState, action: IUpdateFilterActionCreator): IAppState {
    switch (action.type) {
        case RESET:
            return initialState;
        case UPDATE_FILTER:
            return Object.assign({}, state, {
                filters: action.filters
            }) as IAppState;
        case SHOW_RESULT:
            return Object.assign({}, state, {
                results: action.results
            }) as IAppState;
        default:
            return state
    }
}
