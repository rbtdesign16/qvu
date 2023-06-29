import React, { createContext, useState, useContext } from "react";

export const LangContext = createContext();

export const LangProvider = ({ children }) => {
    const [lang, setLang] = useState({});

    const getText = (textKey, addText = "") => {
        if (lang[navigator.language] && lang[navigator.language][textKey]) {
            return lang[navigator.language][textKey] + addText;
        } else {
            return textKey + addText;
        }
    };
    
    return (
            <LangContext.Provider
                value={{lang, setLang, getText}}>
                {children}
            </LangContext.Provider>
            );
};


const useLang = () => {
    const context = useContext(LangContext);

    if (context === undefined) {
        throw new Error("useMessage must be used within an MessageProvider");
    }
    return context;
};

export default useLang;
