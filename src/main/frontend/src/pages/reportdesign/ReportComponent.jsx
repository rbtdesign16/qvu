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
    onComponentClick,
    COMPONENT_DRAG_DATA,
    COMPONENT_ID_PREFIX,
    isDataGridComponent,
    RESIZER_ID_PREFIX,
    isTabularDataGridComponent
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
        setLastSelectedIndex,
        clearSelectedComponents,
        lastSelectedSubIndex, 
        setLastSelectedSubIndex,
        deselectAllSubComponents,
        componentHasSelectedSubComponents
    } = useReportDesign();
    
    const getVerticalResizerIfRequired = () => {
        if (isTabularDataGridComponent(component)) {
            return <div id={RESIZER_ID_PREFIX + COMPONENT_ID_PREFIX + "ver-" + componentIndex} className="grid-resizer-ver"></div>;
        } else {
            return "";
        }
    };
    
    const getHorizontalResizerIfRequired = () => {
        if (isDataGridComponent(component.type)) {
            return <div id={RESIZER_ID_PREFIX + COMPONENT_ID_PREFIX + "hor-" + componentIndex} className="grid-resizer-hor"></div>;
        } else {
            return "";
        }
    };

    return <div 
        id={COMPONENT_ID_PREFIX + componentIndex}
        className={getComponentClassName(component)}
        draggable={true} 
        style={getComponentStyle(currentReport, component)}
        onContextMenu={e => onContextMenu(e, componentIndex, component.section)} 
        onClick={e => onComponentClick(e, 
            currentReport, 
            setCurrentReport, 
            componentIndex, 
            lastSelectedIndex, 
            setLastSelectedIndex,
            lastSelectedSubIndex, 
            setLastSelectedSubIndex,
            deselectAllSubComponents,
            componentHasSelectedSubComponents)} 
        onDragOver={e => handleComponentDragOver(e)}
        onDragStart={e => handleComponentDragStart(e, COMPONENT_DRAG_DATA, componentIndex)}>
        <SizingControl type={COMPONENT_DRAG_DATA} corner={TOP_LEFT} componentIndex={componentIndex} component={component}/>
        <SizingControl type={COMPONENT_DRAG_DATA} corner={TOP_RIGHT} componentIndex={componentIndex} component={component}/>
        <SizingControl type={COMPONENT_DRAG_DATA} corner={BOTTOM_LEFT} componentIndex={componentIndex} component={component}/>
        <SizingControl type={COMPONENT_DRAG_DATA} corner={BOTTOM_RIGHT} componentIndex={componentIndex} component={component}/>
        {getVerticalResizerIfRequired()}
        {getHorizontalResizerIfRequired()}
        {getComponentValue(reportSettings, currentReport, component, componentIndex)}
    </div>; 
};

export default ReportComponent;