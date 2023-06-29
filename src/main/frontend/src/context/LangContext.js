import React, { createContext, useState, useContext }
from "react";

export const LangContext = createContext();

export const LangProvider = ({ children }
) => {
    const [lang, setLang] = useState({});

    const getText = (textKey, addText = "") => {
        try {
            if (lang && lang[textKey]) {
                return lang[textKey] + addText;
            } else {
                return textKey + addText;
            }
        } catch (e) {
            return textKey;
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
        throw new Error("useLang must be used within an LangProvider");
    }
    return context;
};

export default useLang;
