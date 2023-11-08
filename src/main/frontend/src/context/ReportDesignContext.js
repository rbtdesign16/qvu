import React, { createContext, useState, useContext, useEffect } from "react";
import {
    isDataTypeString,
    isDataTypeNumeric,
    isDataTypeDateTime,
    isEmpty,
    DEFAULT_NEW_REPORT_NAME,
    DEFAULT_DOCUMENT_GROUP,
} from "../utils/helper";
import NumberEntry from "../widgets/NumberEntry";
import useLang from "./LangContext";

export const ReportDesignContext = createContext();

export const ReportDesignProvider = ({ children }) => {
    const {getText} = useLang();
    const [currentDocument, setCurrentDocument] = useState({
        name: getText(DEFAULT_NEW_REPORT_NAME),
        group: DEFAULT_DOCUMENT_GROUP,
        newdoc: true
    });
    
    const clearData = () => {
    };

    const setNewReport = () => {
        setCurrentDocument({name: getText(DEFAULT_NEW_REPORT_NAME),
            group: DEFAULT_DOCUMENT_GROUP, newdoc: true});
        clearData();
    };

    return (
            <ReportDesignContext.Provider
                value={{currentDocument}}>
                {children}
            </ReportDesignContext.Provider>
            );
};

const useReportDesign = () => {
    const context = useContext(ReportDesignContext);

    if (context === undefined) {
        throw new Error("useReportDesign must be used within an ReportDesignProvider");
    }
    return context;
};

export default useReportDesign;
