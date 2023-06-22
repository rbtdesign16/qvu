import React, { useState, createContext, useContext } from "react";
import {loadAuth} from "../utils/apiHelper";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // set up initial state and reducer
    const [authData, setAuthData] = useState({});

    const initializeAuth = async () => {
       authData = apiHelper.loadAuth();
        
    }

    return (
            <AuthContext.Provider
                value={{authData}}>
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
