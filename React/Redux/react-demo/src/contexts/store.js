import {configureStore} from "@reduxjs/toolkit";
import counterReducer from "../contexts/CounterReducer";
import AuthReducer from "../contexts/AuthReducer";
import ThemeReducer from "./ThemeReducer";

export const Store = configureStore({
    reducer: {counter : counterReducer, auth  : AuthReducer, theme : ThemeReducer}
});