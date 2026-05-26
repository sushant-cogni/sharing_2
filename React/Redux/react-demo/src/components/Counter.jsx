import React from "react";
import { useSelector,useDispatch } from "react-redux";
import { counterActions } from "../contexts/CounterReducer";

const Counter = () => {
  const CounterObject=useSelector(state => state.counter);

  const dispatch=useDispatch();

  function handleIncrement(){
    dispatch(counterActions.increment());
  }

  function handleDecrement(){
    dispatch(counterActions.decrement());
  }

  function handleIncrease(){
    dispatch(counterActions.increase({value:5}));
  }

  function handleToggle(){
    dispatch(counterActions.toggle());
  }

  return (
    <div>
    
        <div>
            <h2>Counter</h2>

            { CounterObject.toggle && <p>Count: {CounterObject.counter}</p>}

            <button
                onClick={() => {
                handleIncrement()
                }}
            >
                Increment
            </button>

            <button
                onClick={() => {
                handleDecrement()
                }}
            >
                Decrement
            </button>

            <button
                onClick={() => {
                handleIncrease()
                }}
            >
                Increase by 5
            </button>

            <button
                onClick={() => {
                handleToggle()
                }}
            >
                Toggle
            </button>
        </div>
    </div>
  );
};

export default Counter;