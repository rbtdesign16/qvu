import React from "react";
import { Splitter, SplitterPanel } from "primereact/splitter";
import ReportSection from "./ReportSection";
import useReportDesign from "../../context/ReportDesignContext";
import {
    REPORT_UNITS_INCH,
    REPORT_UNITS_MM,
    REPORT_SECTION_HEADER,
    REPORT_SECTION_BODY,
    REPORT_SECTION_FOOTER,
    reportUnitsToPixels,
    pixelsToReportUnits,
    REPORT_COMPONENT_TYPE_TEXT,
    REPORT_COMPONENT_TYPE_IMAGE,
    REPORT_COMPONENT_TYPE_HYPERLINK,
    REPORT_COMPONENT_TYPE_PAGE_NUMBER,
    REPORT_COMPONENT_TYPE_CURRENT_DATE,
    REPORT_COMPONENT_TYPE_DATA_GRID,
    REPORT_COMPONENT_TYPE_DATA_FIELD,
    REPORT_COMPONENT_TYPE_DATA_RECORD,
    REPORT_COMPONENT_TYPE_GRAPH,
    REPORT_COMPONENT_TYPE_SUBREPORT,
    REPORT_COMPONENT_CONTAINER_BORDER,
    REPORT_COMPONENT_CONTAINER_BORDER_SELECTED

    } from "../../utils/helper";

const ReportComponent = (props) => {
    const {component} = props;
    
    const {
        reportSettings,
        currentReport,
        setCurrentReport
        } = useReportDesign();
        
    const onContextMenu = (e) => {
        alert("-------->xxx");
    };

    const getStyle = () => {
        let unit = "in";
        if (currentReport.pageUnits === REPORT_UNITS_MM) {
            unit = "mm";
        }

        let retval =  {
            position: "relative",
            width: component.width + unit,
            height: component.height + unit,
            top: component.top + unit,
            left: component.left + unit,
            border: REPORT_COMPONENT_CONTAINER_BORDER,
            textAlign: component.align,
            overflow: "hidden"
        };
        
        if (component.fontSettings) {
            let fs = component.fontSettings;
            retval.font = fs.font;
            retval.fontSize = fs.size;
            retval.color = fs.color;
            
            if (fs.italic) {
                retval.fontStyle = "italic";
            }
            
            if (fs.bold) {
                retval.fontWeight = 700;
            }
            
            if (fs.underline) {
                retval.textDecoration = "underline";
            }
        }
        
        return retval;
    };

    const getComponentValue = () => {
        switch(component.type) {
            case REPORT_COMPONENT_TYPE_TEXT:
                return component.value;
            case REPORT_COMPONENT_TYPE_IMAGE:
            case REPORT_COMPONENT_TYPE_HYPERLINK:
            case REPORT_COMPONENT_TYPE_PAGE_NUMBER:
            case REPORT_COMPONENT_TYPE_CURRENT_DATE:
            case REPORT_COMPONENT_TYPE_DATA_GRID:
            case REPORT_COMPONENT_TYPE_DATA_FIELD:
            case REPORT_COMPONENT_TYPE_DATA_RECORD:
            case REPORT_COMPONENT_TYPE_GRAPH:
            case REPORT_COMPONENT_TYPE_SUBREPORT:
               return component.value;
       }
    };
    
    return <div style={getStyle()} 
        onClick={e => onClick(e)} className="report-component"
        onContextMenu={(e) => onContextMenu(e)}>{getComponentValue()}</div>;
};

export default ReportComponent;