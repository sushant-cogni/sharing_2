import { createSlice } from "@reduxjs/toolkit";

const initialAuthState = {isLogged: false};

const Auth=createSlice({
    name:"Auth",
    initialState:initialAuthState,
    reducers:{
        logIn(state){
            state.isLogged=true
        },
        logOut(state){
            state.isLogged=false
        }
    }
});

export const authActions=Auth.actions;

export default Auth.reducer;