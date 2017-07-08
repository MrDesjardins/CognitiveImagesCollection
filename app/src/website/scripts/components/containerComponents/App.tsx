import * as React from "react";
import { HeaderPanel } from "../presentationComponents/HeaderPanel";
import { ResultPanel } from "../presentationComponents/ResultPanel";
import { Provider, connect, Dispatch } from "react-redux";
import { createStore } from "redux";
import { IAppState, IFilters, IResults } from "../../models/filterModels";
import { applyFilter, filterChanged } from "../../redux/actionsCreator";
import { Filters } from "../presentationComponents/Filters";


interface IAppDispatch {
    onApply: () => void;
    filterChange: (filters: IFilters) => void;
}
export interface IAppProps extends IAppDispatch {
    model: IAppState;

}


const App = (props: IAppProps) => (<div>
    <HeaderPanel
    />
    <div className="container">
        <div className="row">
            <Filters
                filters={props.model.filters}
                onApply={() => { props.onApply(); }}
                filterChange={(filters: IFilters) => {
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


const mapStateToProps = (state: IAppState) => {
    return {
        model: state,
    } as IAppProps
};

const mapDispatchToProps = (dispatch: Dispatch<IAppState>): IAppDispatch => {
    return {
        onApply: () => {
            dispatch(applyFilter());
        },
        filterChange: (filters: IFilters) => {
            dispatch(filterChanged(filters));
        }
    } as IAppDispatch;
};
export default connect(mapStateToProps, mapDispatchToProps)(App);