import React, { createContext, useState, useContext } from "react";
import {
ESCAPE_KEY_CODE,
} from "../utils/helper";
import useLang from "./LangContext";

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
    const [menuConfig, setMenuConfig] = useState({show: false});

    const handleKeyDown = (e) => {
        if (e.keyCode === ESCAPE_KEY_CODE) {
            hideMenu(e);
        }
    };

    const showMenu = (mc) => {
        window.addEventListener('keydown', handleKeyDown);
        setMenuConfig(mc);
    };

    const hideMenu = (e) => {
        if (e) {
            e.preventDefault();
        }
        window.removeEventListener('keydown', handleKeyDown);
        setMenuConfig({show: false});
    };

    return (
            <MenuContext.Provider
                value={{
                    showMenu,
                    hideMenu,
                    menuConfig}}>
                {children}
            </MenuContext.Provider>
            );
};

const useMenu = () => {
    const context = useContext(MenuContext);

    if (context === undefined) {
        throw new Error("useMenu must be used within an MenuProvider");
    }
    return context;
};


export default useMenu;
