import React, { createContext, useState, useContext, useEffect } from "react";
import NumberEntry from "../widgets/NumberEntry";
import useLang from "./LangContext";
import {
    isEmpty,
    DEFAULT_NEW_DOCUMENT_NAME,
    DEFAULT_DOCUMENT_GROUP,
    COLOR_BLACK,
    copyObject
} from "../utils/helper";
import {
    COMPONENT_TYPE_TEXT,  
    COMPONENT_TYPE_IMAGE, 
    COMPONENT_TYPE_SHAPE,
    COMPONENT_TYPE_EMAIL, 
    COMPONENT_TYPE_HYPERLINK,
    COMPONENT_TYPE_PAGENUMBER,
    COMPONENT_TYPE_CURRENTDATE,
    COMPONENT_TYPE_DATAFIELD,
    COMPONENT_TYPE_DATAGRID,
    COMPONENT_TYPE_DATARECORD,
    COMPONENT_TYPE_CHART,
    COMPONENT_TYPE_SUBREPORT,
    MAX_UNDOS,
    REPORT_UNITS_MM,
    DEFAULT_MM_COMPONENT_POS,
    DEFAULT_INCH_COMPONENT_POS,
    DEFAULT_PAGE_NUMBER_FORMAT,
    DEFAULT_CURRENT_DATE_FORMAT,
    GRID_LAYOUT_TABULAR,
    GRID_LAYOUT_FREEFORM,
    getReportWidth,
    getReportHeight
    } from "../utils/reportHelper";

export const ReportDesignContext = createContext();

export const ReportDesignProvider = ({ children }) => {
    const {getText} = useLang();
    const [reportSettings, setReportSettings] = useState(null);
    const [currentComponent, setCurrentComponent] = useState(null);
    const [currentReport, setReport] = useState(null);
    const [currentQuery, setCurrentQuery] = useState(null);
    const [saveReports, setSaveReports] = useState({reports: [], lastSelectedIndex: -1});
    const [lastSelectedIndex, setLastSelectedIndex] = useState(-1);
    const [lastSelectedSubIndex, setLastSelectedSubIndex] = useState(-1);
    
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
    
    const haveSelectedSubComponents = () => {
        for (let i = 0; i < currentReport.reportComponents.length; ++i) {
            if ((currentReport.reportComponents[i].type === COMPONENT_TYPE_DATAGRID)
                && (currentReport.reportComponents[i].value.gridLayout === GRID_LAYOUT_FREEFORM)) {
                let dcols = currentReport.reportComponents[i].value.dataColumns;
                let dcindex = dcols.findIndex(dc => (dc.dataSelected || dc.labelSelected));
                
                if (dcindex > -1) {
                    return true;
                }
             }
        }
        
        return false; 
    };
    
    const componentHasSelectedSubComponents = (c) => {
        if (c.value && c.value.dataColumns) {
            return (c.value.dataColumns.findIndex(dc => (dc.dataSelected || dc.labelSelected)) > -1);
        }
        
        return false;
    };
    
    const deselectAllSubComponents = (c) => {
        if (c && c.value && c.value.dataColumns) {
            for (let i = 0; i < c.value.dataColumns.length; ++i) {
                c.value.dataColumns[i].dataSelected = false;
                c.value.dataColumns[i].labelSelected = false;
            }

            setLastSelectedSubIndex(-1);
        }
    };

    
    const getComponentIndexWithSelectedSubComponents = () => {
        for (let i = 0; i < currentReport.reportComponents.length; ++i) {
            if ((currentReport.reportComponents[i].type === COMPONENT_TYPE_DATAGRID) 
                && (currentReport.reportComponents[i].value.gridLayout === GRID_LAYOUT_FREEFORM)) {
                if (componentHasSelectedSubComponents(currentReport.reportComponents[i])) {
                    return i;
                }
            }
        }
        
        return -1;
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
            color: reportSettings.defaultForegroundColor,
            backgroundColor: "white",
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
    
    const getNewComponentPosition = (type) => {
        let retval;
        switch (type) {
            case COMPONENT_TYPE_DATAGRID:
            case COMPONENT_TYPE_DATARECORD:
                if (currentReport.pageUnits === REPORT_UNITS_MM) {
                    retval = {
                        left: 5, 
                        top: 5, 
                        height: getReportWidth(currentReport, reportSettings) / 4, 
                        width: getReportWidth(currentReport, reportSettings) / 2
                    };
                } else {
                    retval = {
                        left: 0.5, 
                        top: 0.5, 
                        height: getReportWidth(currentReport, reportSettings) / 4, 
                        width: getReportWidth(currentReport, reportSettings) / 2
                    };
                }
                break;
            default: 
                if (currentReport.pageUnits === REPORT_UNITS_MM) {
                    retval = DEFAULT_MM_COMPONENT_POS;
                } else {
                    retval = DEFAULT_INCH_COMPONENT_POS;
                }
                break;
        }
        
        return retval;
};
    
    const getNewComponent = (section, type, value, pos) => {
        
        if (!pos) {
            pos = getNewComponentPosition(type);
        }
        
        let retval =  {
            type: type,
            align: "center",
            fontSettings: getNewFontSettings(),
            borderSettings: getNewBorderSettings(),
            value: value,
            left: pos.left,
            top: pos.top,
            width: pos.width,
            height: pos.height,
            section: section,
            selected: false,
            zindex: 1
        };
        
        switch(type) {
            case COMPONENT_TYPE_TEXT:
                retval.value="new text component";
                break;
            case COMPONENT_TYPE_HYPERLINK:
                retval.fontSettings = {font: reportSettings.defaultFont, fontSize: reportSettings.defaultFontSize, color: reportSettings.defaultForegroundColor, backgroundColor: reportSettings.defaultBackgroundColor};
                retval.value = {
                    url: "http://some.url.com",
                    text: "new hyperlink",
                    underline: true};
                break;
            case COMPONENT_TYPE_IMAGE:
                retval.value = {
                    url: "",
                    alttext: "",
                    linkurl: "",
                    sizetofit: false
                };
                break;
            case COMPONENT_TYPE_EMAIL:
                retval.value = {
                    to: "to@email.com",
                    text: "new email",
                    subject: "my subject",
                    underline: false
                };
                break;
            case COMPONENT_TYPE_SHAPE:
                retval.value = {
                    shape: "",
                    wantborder: true,
                    border: "solid",
                    bordercolor: COLOR_BLACK,
                    opacity: 1,
                    fillcolor: "",
                    size: 1,
                    wantfilled: false
                };
                break;
            case COMPONENT_TYPE_PAGENUMBER:
                retval.value = {
                    format: DEFAULT_PAGE_NUMBER_FORMAT
                };
                break;
            case COMPONENT_TYPE_CURRENTDATE:
                retval.value = {
                    format: DEFAULT_CURRENT_DATE_FORMAT
                };
                break;
            case COMPONENT_TYPE_DATAFIELD:
                retval.align="center";
                retval.value = {
                    dataColumns: []
                };
                break;
            case COMPONENT_TYPE_DATAGRID:
                retval.fontSettings2 = getNewFontSettings();
                retval.borderSettings2 = getNewBorderSettings();
                retval.value = {dataColumns: [], gridLayout: GRID_LAYOUT_TABULAR};
                break;
            case COMPONENT_TYPE_DATARECORD:
                retval.align="left";
                retval.fontSettings2 = getNewFontSettings();
                retval.borderSettings2 = getNewBorderSettings();
                retval.value = {dataColumns: [], rowGap: 0};
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
        setCurrentQuery(null);
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
                    haveSelectedSubComponents,
                    getNewFontSettings,
                    getNewBorderSettings,
                    lastSelectedIndex, 
                    setLastSelectedIndex,
                    undo,
                    canUndo,
                    currentComponent,
                    setCurrentComponent,
                    setCurrentQuery,
                    currentQuery,
                    lastSelectedSubIndex, 
                    setLastSelectedSubIndex,
                    getComponentIndexWithSelectedSubComponents,
                    componentHasSelectedSubComponents,
                    deselectAllSubComponents
                }}>
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
