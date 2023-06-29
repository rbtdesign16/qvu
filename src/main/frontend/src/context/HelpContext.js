import React, { createContext, useState, useContext } from "react";

export const HelpContext = createContext();

export const HelpProvider = ({ children }) => {
    const [helpInfo, setHelpInfo] = useState({show: false});
    const hideHelp = () => {
        if (helpInfo.show) {
            setHelpInfo({show: false});
        }
    };
    
    const showHelp = (message) => {
        setHelpInfo({show: true, message: message});
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
