import React, { createContext, useState, useContext } from "react";
import useLang from "./LangContext";
import {
    SUCCESS,
    WARN,
    ERROR,
    DEFAULT_SUCCESS_TITLE,
    DEFAULT_WARN_TITLE,
    DEFAULT_ERROR_TITLE,
    SUCCESS_MESSAGE_TIMEOUT} from "../utils/helper";
 
export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const {getText} = useLang();
    const [messageInfo, setMessageInfo] = useState({show: false});
    const hideMessage = () => {
        clearTimeout(timeout);
        timeout = null;
        setMessageInfo({show: false});
    };
    
    let timeout = null;
    
    const showMessage = (type, message, title = null, showSpinner = false, withBackdrop = false) => {
        if (!title) {
            switch(type) {
                case SUCCESS:
                    title = getText(DEFAULT_SUCCESS_TITLE);
                    break;
                case WARN: 
                    title = getText(DEFAULT_WARN_TITLE);
                    break;
                case ERROR: 
                    title = getText(DEFAULT_ERROR_TITLE);
                    break;
            }
        }
        
        if (type === SUCCESS) {
            timeout = setTimeout(hideMessage, SUCCESS_MESSAGE_TIMEOUT);
        }
        
        setMessageInfo({show: true, type: type, message: message, title: title, showSpinner: showSpinner, backdrop: withBackdrop});
    };

    return (
            <MessageContext.Provider
                value={{messageInfo, showMessage, hideMessage}}>
                {children}
            </MessageContext.Provider>
            );
};

const useMessage = () => {
    const context = useContext(MessageContext);

    if (context === undefined) {
        throw new Error("useMessage must be used within an MessageProvider");
    }
    return context;
};

export default useMessage;
