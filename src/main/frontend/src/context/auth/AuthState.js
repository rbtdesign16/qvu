import React, { createContext, useReducer } from "react";
import authReducer from "./authReducer";

import { SET_AUTHENTICATED_USER, CLEAR_AUTHENTICATED_USER } from "../types";

export const AuthContext = createContext();

const AuthState = ({ children }) => {
    // set up initial state and reducer
    const initialState = {
        authenticatedUser: {},
    };

    const [state, dispatch] = useReducer(authReducer, initialState);


    const hasRole = (system, role) => {
        if (state.authenticatedUser && state.authenticatedUser.roles) {
            for (let i = 0; i < state.authenticatedUser.roles.length; ++i) {
                return (state.authenticatedUser.roles[i].role === role);
            }
        }
    };

    const setAuthenticatedUser = (user) => {
        dispatch({type: SET_AUTHENTICATED_USER, pauyload: user});
    }
    
    const logout = () => {
        dispatch({type: CLEAR_AUTHENTICATED_USER});
    };

    return (
            <AuthContext.Provider
                value={{
                                authenticatedUser: state.authenticatedUser,
                                hasRole,
                                logout,
                                setAuthenticatedUser
                            }}
                >
                {children}
            </AuthContext.Provider>
            );
};

export default AuthState;
