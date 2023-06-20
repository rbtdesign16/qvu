import React, { createContext, useReducer } from "react";
import messageReducer from "./messageReducer";

import { SHOW_MESSAGE, HIDE_MESSAGE } from "../types";

export const MessageContext = createContext();
const { Provider } = MessageContext;

const MessageState = ({ children }) => {
    // set up initial state and reducer
    const initialState = {
        currentMessage: {show: false}
    };

    const [state, dispatch] = useReducer(messageReducer, initialState);


    const showMessage = (type, message) => {
        dispatch({type: SHOW_MESSAGE, payload: {show: true, type: type, message: message}});
    }
    
    const hideMessage = () => {
        dispatch({type: HIDE_MESSAGE, payload: {show: false}});
    }
    
    return (
            <Provider
                value={{
                                currentMessage: state.currentMessage,
                                showMessage: showMessage,
                                hideMessage: hideMessage
                            }}
                >
                {children}
            </Provider>
            );
};

export default MessageState;
