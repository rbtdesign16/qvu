import React, { createContext, useState, useContext, useEffect } from "react";
import {
    isEmpty,
    DEFAULT_NEW_DOCUMENT_NAME,
    DEFAULT_DOCUMENT_GROUP,
    MAX_UNDOS,
    REPORT_UNITS_MM,
    DEFAULT_MM_COMPONENT_POS,
    DEFAULT_INCH_COMPONENT_POS
} from "../utils/helper";
import NumberEntry from "../widgets/NumberEntry";
import useLang from "./LangContext";

export const ReportDesignContext = createContext();

export const ReportDesignProvider = ({ children }) => {
    const {getText} = useLang();
    const [reportSettings, setReportSettings] = useState(null);
    const [currentComponent, setCurrentComponent] = useState(null);
    const [currentReport, setReport] = useState(null);
    const [saveReports, setSaveReports] = useState({reports: [], lastSelectedIndex: -1});
    const [lastSelectedIndex, setLastSelectedIndex] = useState(-1);
    
    const initializeReportSettings = async (settings) => {
        setReportSettings(settings);
        setNewReport(settings);
    };
    
    const setCurrentReport = (report) => {
        if (currentReport && (saveReports.reports.length < MAX_UNDOS)) {
           let sr = {...saveReports};
           sr.reports.unshift(currentReport);
           sr.lastSelectedIndex = lastSelectedIndex;
           setSaveReports(sr);
        } 
        
        setReport(report);
    };  
    
    const haveSelectedComponents = () => {
        if (currentReport && currentReport.reportComponents) {
            return (currentReport.reportComponents.findIndex((r) => r.selected) > -1);
        }
    };
    
    const canUndo = () => {
        return (saveReports.reports.length > 0);
    };
    
    const undo = () => {
        if (canUndo()) {
            let sr = {...saveReports};
            setSaveReports(sr);
            setReport(sr.reports.shift());
            setLastSelectedIndex(sr.lastSelectedIndex);
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
    
    const getNewComponentPosition = () => {
        if (currentReport.pageUnits === REPORT_UNITS_MM) {
            return DEFAULT_MM_COMPONENT_POS;
        } else {
            return DEFAULT_INCH_COMPONENT_POS;
        }
    };
    
    const getNewComponent = (section, type, value, pos) => {
        
        if (!pos) {
            pos = getNewComponentPosition();
        }
        
        let retval =  {
            type: type,
            align: "center",
            foregroundColor: reportSettings.defaultForegroundColor,
            backgroundColor: reportSettings.defaultBackgroundColor,
            fontSettings: getNewFontSettings(),
            borderSettings: getNewBorderSettings(),
            left: pos.left,
            top: pos.top,
            width: pos.width,
            height: pos.height,
            section: section,
            selected: false,
            zindex: 1
        };
        
        switch(type) {
            case "text":
                retval.value="new text component";
                break;
            case "hyperlink":
                retval.value = {
                    url: "http://some.url.com",
                    text: "new hyperlink",
                    underline: true};
                break;
            case "image":
                retval.value = {
                    url: "",
                    alttext: "",
                    linkurl: "",
                    sizetofit: false
                };
                break;
            case "email":
                retval.value = {
                    to: "to@email.com",
                    text: "new email",
                    subject: "my subject",
                    underline: false
                };
                break;
        }
        
        return retval;
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
    };
    
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
                    getNewBorderSettings,
                    lastSelectedIndex, 
                    setLastSelectedIndex,
                    undo,
                    canUndo,
                    currentComponent,
                    setCurrentComponent}}>
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
