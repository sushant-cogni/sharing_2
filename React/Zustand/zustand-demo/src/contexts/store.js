import { create } from "zustand";
import { persist } from "zustand/middleware";

// const CounterState={
//     counter: 0, 
//     toggle: true
// }

export const useCounterStore= create(persist((set)=>({
    counter: 0,
    toggle: true,
    increment: ()=> set(state => ({counter: state.counter+=1 })),
    decrement: ()=> set(state => ({counter: state.counter-=1})),
    increase: (value)=> set(state => ({counter: state.counter+=value})),
    toggleCounter: ()=> set(state => ({toggle: !state.toggle}))
}),{
    name:"CounterState"
}))

export const useThemeStore= create(persist((set)=>({
    theme:"white",
    changeTheme: ()=> set(state=>({theme : (state.theme==="white")? "black" : "white"})),
}),{
    name:"ThemeState"
}))


export const useAuthStore= create(persist((set)=> ({
    isLogged:false,
    logIn: ()=> set(state => ({isLogged:true})),
    logOut: ()=> set(state => ({isLogged:false}))
}),{
    name:"AuthState"
}))
