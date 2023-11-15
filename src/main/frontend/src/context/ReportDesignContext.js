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
    
    const haveSelectedComponents = () => {
        if (currentReport && currentReport.reportComponents) {
            for (let i = 0; i <  currentReport.reportComponents.length; ++i) {
                if (currentReport.reportComponents[i].selected) {
                    return true;
                }
            }
        }
    };
    
    const getNewFontSettings = () => {
        return {
            font: reportSettings.defaultFont,
            size: reportSettings.defaultFontSize,
            bold: false,
            italic: false,
            underline: false
        };
    };
    
    const getNewBorderSettings = () => {
        return {
            border: reportSettings.defaultBorderStyle,
            width: reportSettings.defaultBorderWidth,
            left: true,
            top: true,
            right: true,
            bottom: true,
            rounded: false,
            color: reportSettings.defaultBorderColor
        };
    };

    const getNewComponent = (section, type, value) => {
        return {
            type: type,
            align: "center",
            foregroundColor: reportSettings.defaultForegroundColor,
            backgroundColor: reportSettings.defaultBackgroundColor,
            fontSettings: getNewFontSettings(),
            value: value,
            left: 0.5,
            top: 0.5,
            width: 1.0,
            height: 0.5,
            section: section,
            selected: false
        };
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
            reportComponents: []
         };
    }
    const setNewReport = (settings) => {
        setCurrentReport(getNewDocument(settings));
    };

    return (
            <ReportDesignContext.Provider
                value={{
                    currentReport, 
                    setCurrentReport, 
                    reportSettings, 
                    initializeReportSettings, 
                    setNewReport,
                    getNewComponent,
                    haveSelectedComponents,
                    getNewFontSettings,
                    getNewBorderSettings}}>
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
