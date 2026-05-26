import { createSlice } from "@reduxjs/toolkit";

const initialCounterState = {counter: 0, toggle: true};

const Counter=createSlice({
    name:"Counter",
    initialState:initialCounterState,
    reducers:{
        increment(state){
            state.counter+=1;
        },
        decrement(state){
            state.counter-=1;
        },
        increase(state,action){
            state.counter+=action.payload.value;
        },
        toggle(state){
            state.toggle=!state.toggle;
        },
    }
});

export const counterActions=Counter.actions;

export default Counter.reducer;