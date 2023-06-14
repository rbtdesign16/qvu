import React, { createContext, useReducer } from "react";
import authReducer from "./authReducer";
import {
  getServerURL
} from "../../api/api";
import { formatErrorMessage } from "../../utils/helper";
import axios from "axios";

import { SET_AUTHENTICATED_USER, CLEAR_AUTHENTICATED_USER } from "../types";


export const AuthContext = createContext();
const AuthState = ({ children }) => {
  let loginCallback;

  // set up initial state and reducer
  const initialState = {
   authenticatedUser: {}
  };

  const setLoginCallback = (f) => {
    loginCallback = f;
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  const updateAuth = async () => {
    let user = {
         name: "John Doe",
         userId: "123"
    }
    console.log("user: id=" + user.userId + ", name=" + user.name);
    dispatch({ type: SET_CURRENT, payload: user });

    if (loginCallback) {
      loginCallback(true);
    }
  };


  return (
    <Provider
      value={{
        authenticatedUser: state.current,
        setLoginCallback,
      }}
    >
      {children}
    </Provider>
  );
};
export default AuthState;
