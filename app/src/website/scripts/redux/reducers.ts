// Modify the store state
// Pure function
// Always return a new object

import { FILTER_APPLIED, RESET, SHOW_RESULT, FILTER_CHANGED } from "./actions";
import { IAppState, IResults, IFilters } from "../models/filterModels";
import { IUpdateFilterActionCreator, IChangedFilterActionCreator } from "./actionsCreator";

const initialState = {
    filters: {
        tags: [],
        isBlackAndWhite: false,
        startingDate: new Date(),
        endingDate: new Date(),
        numberOfPeople: 100,
        smileLevel: 0,
        happinessLevel: 0,
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
        case FILTER_CHANGED:
            return Object.assign({}, state, {
                filters: action.filters
            }) as IAppState;
        case FILTER_APPLIED:
            return Object.assign({}, state) as IAppState;
        case SHOW_RESULT:
            return Object.assign({}, state, {
                results: action.results
            }) as IAppState;
        default:
            return state
    }
}

// export function appReducerFilterChange(state: IAppState = initialState, action: IChangedFilterActionCreator): IAppState {
//     switch (action.type) {
//         case FILTER_UPDATED:
//             state[action.filterName] = action.value;
//             return Object.assign({}, state) as IAppState;
//         default:
//             return state
//     }
// }
