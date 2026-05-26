import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../contexts/AuthReducer";

const Login = () => {

  const {isLogged} = useSelector(state => state.auth);
  const dispatch=useDispatch();

  const handleLogin = (e) => {
    dispatch(authActions.logIn());
  };

  return (
    <div>
        {!isLogged &&
        <form action={handleLogin}>
        <h2>Login</h2>

        <input
            type="text"
            placeholder="Username"
        />

        <input
            type="password"
            placeholder="Password"
        />

        <button type="submit">
            Login
        </button>

        </form>
    }
    </div>
  );
};

export default Login;