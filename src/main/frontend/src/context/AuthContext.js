import React, { useState, createContext, useContext } from "react";
import useLang from "./LangContext";
import {loadAuth, loadLang} from "../utils/apiHelper";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // set up initial state and reducer
    const [authData, setAuthData] = useState(null);
    const {setLang} = useLang();
    
    const initializeAuth = async () => {
        if (!authData) {
            // load the lnguare resource
            setLang(await loadLang());
            setAuthData(await loadAuth());
        }
    }

    return (
            <AuthContext.Provider
                value={{authData, initializeAuth, setAuthData}}>
                {children}
            </AuthContext.Provider>
            );
};

const useAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default useAuth;
