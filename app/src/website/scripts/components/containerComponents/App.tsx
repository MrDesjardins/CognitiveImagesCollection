import * as React from "react";
import { HeaderPanel } from "../presentationComponents/HeaderPanel";
import { ResultPanel } from "../presentationComponents/ResultPanel";
import { Provider, connect, Dispatch } from "react-redux";
import { createStore } from "redux";
import { IAppState, IFilters, IResults } from "../../models/filterModels";
import { updateFilter, filterChanged } from "../../redux/actionsCreator";
import { FiltersPresentation } from "../presentationComponents/FiltersPresentation";

export interface IAppProps {
    model: IAppState;
    onApply: () => void;
    filterChange: (filters: IFilters) => void;
}


const App = (props: IAppProps) => (<div>
    <HeaderPanel
    />
    <div className="container">
        <div className="row">
            <FiltersPresentation
                filters={props.model.filters}
                onApply={() => { console.log("to do soon"); }}
                filterChange={(filters: IFilters) => {
                    console.log("filter changed");
                    props.filterChange(filters);
                }}
            />
            <ResultPanel
                results={props.model.results}
            />
        </div>
    </div>
</div>
);


const mapStateToProps = (state: IAppState) => ({
    model: state,
} as IAppProps);

const mapDispatchToProps = (dispatch: Dispatch<IFilters>) => {
    return {
        onApply: () => {
            dispatch(updateFilter());
        },
        filterChange: (filters: IFilters) => {
            dispatch(filterChanged(filters));
        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(App);