// import Redux from 'redux';

const Redux = require('redux');

// Reducer is the function which is required to perform saveral state action based on dispatch actions
function demoReducer(state = {count:0} , action){
    switch(action.type){
        case "increment":
            return {...state,count : state.count + 1};
            break;
        case "decrement":
            return {...state,count : state.count - 1};
            break;
        default:
            return state;
    }    
}

// Subscriber function is required to notify component that anything changed in state and render it again.
const demoSubscriber = () =>{
    const state=store.getState();
    console.log(state);
}

// Redux store creation with attaching the Reducer
const store = Redux.createStore(demoReducer);

// Redux subscribed to the function to fetch the changes in the state
store.subscribe(demoSubscriber);

// Redux dispatch it the method to change the state based on the provided action object
store.dispatch({type: "increment"});
store.dispatch({type: "decrement"});