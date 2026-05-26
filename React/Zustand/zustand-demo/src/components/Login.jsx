import React from "react";
import { useAuthStore } from "../contexts/store";

const Login = () => {

  const {isLogged,logIn} = useAuthStore();

  return (
    <div>
        {!isLogged &&
        <form action={()=>logIn()}>
        <h2>Login</h2>

        <input
            type="text"
            placeholder="Username"
        />

        <input
            type="password"
            placeholder="Password"
        />

        <button type="submit" >
            Login
        </button>

        </form>
    }
    </div>
  );
};

export default Login;