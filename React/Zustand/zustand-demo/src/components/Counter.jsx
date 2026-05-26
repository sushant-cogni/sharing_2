import React from "react";
import {useCounterStore} from "../contexts/store";

const Counter = () => {
  
  const counterStore = useCounterStore();

  return (
    <div>
    
        <div>
            <h2>Counter</h2>

            { counterStore.toggle && <p>Count: {counterStore.counter}</p>}

            <button
                onClick={() => {
                counterStore.increment()
                }}
            >
                Increment
            </button>

            <button
                onClick={() => {
                counterStore.decrement()
                }}
            >
                Decrement
            </button>

            <button
                onClick={() => {
                counterStore.increase(5)
                }}
            >
                Increase by 5
            </button>

            <button
                onClick={() => {
                counterStore.toggleCounter()
                }}
            >
                Toggle
            </button>
        </div>
    </div>
  );
};

export default Counter;