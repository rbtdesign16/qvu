import React, {useState} from "react";
import { Splitter, SplitterPanel } from "primereact/splitter";
import ReportSection from "./ReportSection";
import useMenu from "../../context/MenuContext";
import useReportDesign from "../../context/ReportDesignContext";
import {
    REPORT_UNITS_INCH,
    REPORT_UNITS_MM,
    REPORT_SECTION_HEADER,
    REPORT_SECTION_BODY,
    REPORT_SECTION_FOOTER,
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
    }
from "../../utils/helper";

const ReportComponent = (props) => {
    const {component, componentIndex, onContextMenu, selectedComponents, setSelectedComponents} = props;
    const {
        reportSettings,
        currentReport,
        setCurrentReport
    } = useReportDesign();
    
    const {menuConfig} = useMenu();
    const onClick = (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            let c = {...component};
            let cr = {...currentReport};
            c.selected = !c.selected;
            cr.reportComponents[componentIndex] = c;
            setCurrentReport(cr);
        } 
    };

    const getStyle = () => {
        let unit = currentReport.pageUnits.substring(0, 2);
        ;
        let retval = {
            width: component.width + unit,
            height: component.height + unit,
            top: component.top + unit,
            left: component.left + unit,
            textAlign: component.align,
            color: component.foregroundColor,
            backgroundColor: component.backgroundColor
        };
        if (component.fontSettings) {
            let fs = component.fontSettings;
            retval.fontFamilty = fs.font;
            retval.fontSize = fs.size + "pt";
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
        
        if (component.borderSettings) {
            let bs = component.borderSettings;
            if (haveBorder(bs)) {
                let bdef = bs.border + " " + bs.width + "px " + bs.color;
                if (haveAllBorders(bs)) {
                    retval.border = bdef;
                } else {
                    if (bs.left) {
                        retval.borderLeft = bdef;
                    }

                    if (bs.top) {
                        retval.borderTop = bdef;
                    }

                    if (bs.rightt) {
                        retval.borderRightt = bdef;
                    }

                    if (bs.bottom) {
                        retval.borderBottom = bdef;
                    }
                }

                if (bs.rounded) {
                    retval.borderRadius = reportSettings.defaultBorderRadius;
                }
            }
        }


        return retval;
    };

    const haveAllBorders = (bs) => {
        return (bs.left && bs.top && bs.right && bs.bottom);
    };
        
    const haveBorder = (bs) => {
        return (bs.left ||  bs.top && bs.right || bs.bottom);
    };

    const getComponentValue = () => {
        switch (component.type) {
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

    const getClassName = () => {
        if (component.selected) {
            return "report-component-sel";
        } else {
            return "report-component";
        }
    };

    const handleDragStart = (e) => {
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        e.dataTransfer.setData("cinfo", JSON.stringify({index: componentIndex, left: x, top: y}));
        e.dataTransfer.effectAllowed = "move";
    };

     return <div 
        className={getClassName()}
        draggable={true} 
        style={getStyle()}
        onContextMenu={e => onContextMenu(e, componentIndex)} 
        onClick={e => onClick(e)} 
        onDragStart={e => handleDragStart(e)}>
        {getComponentValue()}
    </div>;
};

export default ReportComponent;