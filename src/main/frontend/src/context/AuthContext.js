import React, { useState, createContext, useContext } from "react";
import {loadAuth} from "../utils/apiHelper";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // set up initial state and reducer
    const [authData, setAuthData] = useState(null);

    const initializeAuth = async () => {
        if (!authData) {
            setAuthData(await loadAuth());
        }
    }

    return (
            <AuthContext.Provider
                value={{authData, initializeAuth}}>
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
