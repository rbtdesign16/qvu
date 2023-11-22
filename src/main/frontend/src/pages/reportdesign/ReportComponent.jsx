import React, {useState} from "react";
import { Splitter, SplitterPanel } from "primereact/splitter";
import ReportSection from "./ReportSection";
import SizingControl from "../../widgets/SizingControl"
import useReportDesign from "../../context/ReportDesignContext";
import { copyObject } from "../../utils/helper";

import {
    MOVE_DROP_EFFECT,
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT,
    REPORT_UNITS_INCH,
    REPORT_UNITS_MM,
    REPORT_SECTION_HEADER,
    REPORT_SECTION_BODY,
    REPORT_SECTION_FOOTER,
    REPORT_COMPONENT_CONTAINER_BORDER,
    REPORT_COMPONENT_CONTAINER_BORDER_SELECTED,
    getComponentValue,
    haveAllBorders,
    haveBorder,
    getComponentClassName,
    getComponentStyle,
    handleComponentDragStart,
    handleComponentDragOver,
    onComponentClick
} from "../../utils/reportHelper";

const ReportComponent = (props) => {
    const {component, 
        componentIndex, 
        onContextMenu} = props;
    const {
        reportSettings,
        currentReport,
        setCurrentReport,
        lastSelectedIndex, 
        setLastSelectedIndex
    } = useReportDesign();
    
    return <div 
        className={getComponentClassName(component)}
        draggable={true} 
        style={getComponentStyle(reportSettings, currentReport, component)}
        onContextMenu={e => onContextMenu(e, componentIndex, component.section)} 
        onClick={e => onComponentClick(e, currentReport, component, componentIndex, lastSelectedIndex)} 
        onDragOver={e => handleComponentDragOver(e)}
        onDragStart={e => handleComponentDragStart(e, componentIndex)}>
        <SizingControl corner={TOP_LEFT} componentIndex={componentIndex} component={component}/>
        <SizingControl corner={TOP_RIGHT} componentIndex={componentIndex} component={component}/>
        <SizingControl corner={BOTTOM_LEFT} componentIndex={componentIndex} component={component}/>
        <SizingControl corner={BOTTOM_RIGHT} componentIndex={componentIndex} component={component}/>
        {getComponentValue(component)}
    </div>; 
};

export default ReportComponent;