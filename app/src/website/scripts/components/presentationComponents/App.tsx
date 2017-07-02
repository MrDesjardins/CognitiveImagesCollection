import * as React from "react";
import { HeaderPanel } from "../presentationComponents/HeaderPanel";
import { ResultPanel } from "../presentationComponents/ResultPanel";
import { Provider, connect, Dispatch } from "react-redux";
import { createStore } from "redux";
import FiltersContainer from "../containerComponents/FiltersContainer";
import { IAppState, IFilters, IResults } from "../../models/filterModels";
import { updateFilter } from "../../redux/actionsCreator";
import { FiltersPresentation } from "./FiltersPresentation";

const App = (props: IAppProps) => (<div>
    <HeaderPanel
    />
    <div className="container">
        <div className="row">
            <FiltersPresentation
                filters={props.model.filters}
                onApply={() => { console.log("to do soon"); }} />
            <ResultPanel
                results={props.model.results}
            />
        </div>
    </div>
</div>
);

interface IAppProps {
    model: IAppState;
}

const mapStateToProps = (state: IAppState) => ({
    model: state,
} as IAppProps);

export default connect(mapStateToProps)(App);