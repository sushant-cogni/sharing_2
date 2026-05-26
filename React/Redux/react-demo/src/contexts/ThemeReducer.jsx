import { createSlice } from "@reduxjs/toolkit";

const initialThemeState = {theme: "white"};

const Theme=createSlice({
    name:"Theme",
    initialState:initialThemeState,
    reducers:{
        changeTheme(state){
            state.theme= (state.theme=="white")? "black" : "white";
        }
    }
});

export const themeActions=Theme.actions;

export default Theme.reducer;