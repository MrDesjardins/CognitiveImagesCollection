import * as React from "react";
import * as ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.css";
import "./index.scss";
import { createStore, combineReducers, ReducersMapObject } from "redux";
import App from "./components/presentationComponents/App";
import { appReducer } from "./redux/reducers";
import { Provider } from "react-redux";

// const store = createStore(combineReducers({appReducer, appReducerFilterChange} as ReducersMapObject));
const store = createStore(appReducer);
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>
    , document.getElementById("main"));
