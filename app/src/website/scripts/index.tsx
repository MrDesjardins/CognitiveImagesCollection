import * as React from "react";
import * as ReactDOM from "react-dom";
import "./index.scss";
import { createStore } from "redux";
import App from "./components/presentationComponents/App";
import { appReducer } from "./redux/reducers";
import { Provider } from "react-redux";

const store = createStore(appReducer);
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>
    , document.getElementById("main"));
