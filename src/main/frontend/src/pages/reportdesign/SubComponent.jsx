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
    REPORT_COMPONENT_CONTAINER_BORDER,
    REPORT_COMPONENT_CONTAINER_BORDER_SELECTED,
    handleComponentDragStart,
    handleComponentDragOver,
    onComponentClick,
    PIXELS_PER_POINT,
    pixelsToReportUnits,
    updateComponentFontSettings,
    updateComponentBorderSettings,
    getQueryDataColumnDisplay
} from "../../utils/reportHelper";

const SubComponent = (props) => {
    const {component, dataColumn, dataColumnIndex, type, units} = props;
    const {
        reportSettings,
        currentReport,
        setCurrentReport
     } = useReportDesign();
    
    const getValue = () => {
        if (type === "label") {
            return dataColumn.displayName;
        } else {
            return getQueryDataColumnDisplay(dataColumn);
        }
    };
    
    const getLeftPosition = () => {
        if (dataColumn.left) {
            return dataColumn.left + units;
        } else {
            if (type === "label") {
                return pixelsToReportUnits(units, (5 * dataColumnIndex)) + units;
            } else {
                return pixelsToReportUnits(units, (5 * dataColumnIndex) + 20) + units;
            }
        }
    };
    
    const getTopPosition = () => {
        if (dataColumn.left) {
            return dataColumn.top + units;
        } else {
            if (type === "label") {
                return pixelsToReportUnits(units, (((PIXELS_PER_POINT * component.fontSettings.size)/2) * dataColumnIndex)) + units;
            } else {
                return pixelsToReportUnits(units, (((PIXELS_PER_POINT * component.fontSettings2.size)/2) * dataColumnIndex)) + units;
            }
        }
    };
    
    const getWidth = () => {
        if (dataColumn.left) {
            return dataColumn.height + units;
        } else {
            
            if (type === "label") {
                return 1 + units;
            } else {
                return 1 + units;
            }
        }
    };

    const getHeight = () => {
        if (dataColumn.left) {
            return dataColumn.height + units;
        } else {
            if (type === "label") {
                return pixelsToReportUnits(units, PIXELS_PER_POINT * component.fontSettings.size) + units;
            } else {
                return pixelsToReportUnits(units, PIXELS_PER_POINT * component.fontSettings2.size) + units;
            }
        }
    };
    
    const getStyle = () => {
        let retval = {
            position: "absolute",
            left: getLeftPosition(),
            top: getTopPosition(),
            width: getWidth(),
            height: getHeight()
        };
        
        if (type === "label") {
            retval.textAlign = dataColumn.headerTextAlign;
            updateComponentFontSettings(component, "fontSettings", retval);
            updateComponentBorderSettings(component, "borderSettings", retval);
        } else {
            retval.textAlign = dataColumn.dataTextAlign;
            updateComponentFontSettings(component, "fontSettings2", retval);
            updateComponentBorderSettings(component, "borderSettings2", retval);
        }  
    };
    
    return <div 
        style={getStyle()}
        draggable={true} 
        onDragOver={e => handleComponentDragOver(e)}
        onDragStart={e => handleComponentDragStart(e, dataColumnIndex)}>
        <SizingControl corner={TOP_LEFT} componentIndex={dataColumnIndex} component={dataColumn}/>
        <SizingControl corner={TOP_RIGHT} componentIndex={dataColumnIndex} component={dataColumn}/>
        <SizingControl corner={BOTTOM_LEFT} componentIndex={dataColumnIndex} component={dataColumn}/>
        <SizingControl corner={BOTTOM_RIGHT} componentIndex={dataColumnIndex} component={dataColumn}/>
        {getValue()}
    </div>; 
};

export default SubComponent;