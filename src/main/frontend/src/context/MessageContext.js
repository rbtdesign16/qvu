import React, { createContext, useState, useContext } from "react";
import {SUCCESS} from "../utils/helper";

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [messageInfo, setMessageInfo] = useState({show: false});
    const hideMessage = () => {
        if (messageInfo.show) {
            setMessageInfo({show: false});
        }
    }
    
    const showMessage = (type, message, title = null, showSpinner = false, withBackdrop = false) => {
        if (type === SUCCESS) {
            setTimeout(hideMessage(), 5000);
        }
        setMessageInfo({show: true, type: type, message: message, title: title, showSpinner: showSpinner, backdrop: withBackdrop});
    }

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
