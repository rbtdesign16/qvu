import React, { useState, createContext, useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // set up initial state and reducer
    const [authenticatedUser, setAuthenticatedUser] = useState({});


    return (
            <AuthContext.Provider
                value={{authenticatedUser, setAuthenticatedUser}}>
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
