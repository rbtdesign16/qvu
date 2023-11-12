import React, { createContext, useState, useContext, useEffect } from "react";
import {
    isEmpty,
    DEFAULT_NEW_DOCUMENT_NAME,
    DEFAULT_DOCUMENT_GROUP,
} from "../utils/helper";
import NumberEntry from "../widgets/NumberEntry";
import useLang from "./LangContext";

export const ReportDesignContext = createContext();

export const ReportDesignProvider = ({ children }) => {
    const {getText} = useLang();
    const [reportSettings, setReportSettings] = useState(null);
    const [currentReport, setCurrentReport] = useState(null);
    
    const initializeReportSettings = async (settings) => {
        setReportSettings(settings);
        setNewReport(settings);
    };
    
    const getNewDocument = (settings) => {
        return {
            name: getText(DEFAULT_NEW_DOCUMENT_NAME),
            group: DEFAULT_DOCUMENT_GROUP, 
            newRecord: true,
            pageSize: settings ? settings.defaultPageSize : reportSettings.defaultPageSize,
            pageOrientation: settings ? settings.defaultPageOrientation :  reportSettings.defaultPageOrientation,
            pageUnits: settings ? settings.defaultPageUnits : reportSettings.defaultPageUnits,
            pageBorder: settings ? settings.defaultPageBorder : reportSettings.defaultPageBorder,
            headerHeight: settings ? settings.defaultHeaderHeight : reportSettings.defaultHeaderHeight,
            footerHeight: settings ? settings.defaultFooterHeight : reportSettings.defaultFooterHeight,
            reportObjects: []
        };
    }
    const setNewReport = (settings) => {
        setCurrentReport(getNewDocument(settings));
    };

    return (
            <ReportDesignContext.Provider
                value={{currentReport, setCurrentReport, reportSettings, initializeReportSettings, setNewReport}}>
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
