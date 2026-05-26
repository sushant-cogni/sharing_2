// Navbar.jsx
import React from "react";
import { useAuthStore, useThemeStore } from "../contexts/store";

const Navbar = () => {

    const Theme = useThemeStore();

    const {isLogged,logOut} = useAuthStore();

  return (
    <div>
        {isLogged &&
        <nav>
            <button>Home</button>
            <button>Profile</button>
            <button>Settings</button>

            <button
                onClick={() => {
                    Theme.changeTheme()
                }}
            >
                Toggle Theme
            </button>

            <button
                onClick={() => {
                    logOut();
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