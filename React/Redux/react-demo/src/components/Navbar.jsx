// Navbar.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../contexts/AuthReducer";
import { themeActions } from "../contexts/ThemeReducer";

const Navbar = () => {

    const {isLogged} = useSelector(state => state.auth);
    const dispatch=useDispatch();

    const {theme} = useSelector(state => state.theme);

  return (
    <div>
        {isLogged &&
        <nav>
            <button>Home</button>
            <button>Profile</button>
            <button>Settings</button>

            <button
                onClick={() => {
                    dispatch(themeActions.changeTheme());
                }}
            >
                Toggle Theme
            </button>

            <button
                onClick={() => {
                    dispatch(authActions.logOut());
                }}
            >
                Logout
            </button>
            </nav>
    }
    </div>
  );
};

export default Navbar;