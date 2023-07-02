import React, { createContext, useState, useContext } from "react";
import {replaceTokens} from "../utils/helper";

export const HelpContext = createContext();

export const HelpProvider = ({ children }) => {
    const [helpInfo, setHelpInfo] = useState({show: false});
    const hideHelp = () => {
        if (helpInfo.show) {
            setHelpInfo({show: false});
        }
    };
    
    const showHelp = (message, tokens) => {
        if (!tokens) {
            setHelpInfo({show: true, message: message});
        } else {
            setHelpInfo({show: true, message: helper.replaceTokens(message, tokens)});
        }
                
    };

    return (
            <HelpContext.Provider
                value={{helpInfo, showHelp, hideHelp}}>
                {children}
            </HelpContext.Provider>
            );
};

const useHelp = () => {
    const context = useContext(HelpContext);

    if (context === undefined) {
        throw new Error("useHelp must be used within an HelpProvider");
    }
    return context;
};

export default useHelp;
