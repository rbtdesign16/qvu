import React, {useState} from "react";
import { Splitter, SplitterPanel } from "primereact/splitter";
import ReportSection from "./ReportSection";
import SizingControl from "../../widgets/SizingControl"
import useReportDesign from "../../context/ReportDesignContext";
import { 
    copyObject,
    DATA_TYPE,
    LABEL_TYPE
} from "../../utils/helper";

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
    getQueryDataColumnDisplay,
    SUBCOMPONENT_DRAG_DATA
} from "../../utils/reportHelper";

const SubComponent = (props) => {
    const {component, componentIndex, dataColumn, dataColumnIndex, type, units} = props;
    const {
        reportSettings,
        currentReport,
        setCurrentReport
     } = useReportDesign();
    
    const getValue = () => {
        if (type === LABEL_TYPE) {
            return dataColumn.displayName;
        } else {
            return getQueryDataColumnDisplay(dataColumn);
        }
    };
    
    const getLeftPosition = () => {
        if (dataColumn[type + "Left"]) {
            return dataColumn[type + "Left"] + units;
        } else {
            if (type === LABEL_TYPE) {
                return pixelsToReportUnits(units, (5 * dataColumnIndex)) + units;
            } else {
                return pixelsToReportUnits(units, (5 * dataColumnIndex) + 100) + units;
            }
        }
    };
    
    const getTopPosition = () => {
        if (dataColumn[type + "Top"]) {
            return dataColumn[type + "Top"] + units;
        } else {
            if (type === LABEL_TYPE) {
                return pixelsToReportUnits(units, (((PIXELS_PER_POINT * component.fontSettings.size)/2) * dataColumnIndex)) + units;
            } else {
                return pixelsToReportUnits(units, (((PIXELS_PER_POINT * component.fontSettings2.size)/2) * (dataColumnIndex + 1.5))) + units;
            }
        }
    };
    
    const getWidth = () => {
        if (dataColumn[type + "Width"]) {
            return dataColumn[type + "Width"] + units;
        } else {
            
            if (type === LABEL_TYPE) {
                return 1 + units;
            } else {
                return 1 + units;
            }
        }
    };

    const getHeight = () => {
        if (dataColumn[type + "Height"]) {
            return dataColumn[type + "Height"] + units;
        } else {
            if (type === LABEL_TYPE) {
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
            height: getHeight(),
            outline: "dashed 1px blue"
        };
        
        if (type === LABEL_TYPE) {
            retval.textAlign = dataColumn.headerTextAlign;
            updateComponentFontSettings(component, "fontSettings", retval);
            updateComponentBorderSettings(component, "borderSettings", retval);
        } else {
            retval.textAlign = dataColumn.dataTextAlign;
            updateComponentFontSettings(component, "fontSettings2", retval);
            updateComponentBorderSettings(component, "borderSettings2", retval);
        }  
        
        return retval;
    };
    
    return <div 
        style={getStyle()}
        draggable={true} 
        onDragOver={e => handleComponentDragOver(e)}
        onDragStart={e => handleComponentDragStart(e, SUBCOMPONENT_DRAG_DATA + "-" + dataColumn.parentId, dataColumnIndex, type)}>
        <SizingControl type={SUBCOMPONENT_DRAG_DATA} subType={type} corner={TOP_LEFT} componentIndex={dataColumnIndex} component={dataColumn}/>
        <SizingControl type={SUBCOMPONENT_DRAG_DATA} subType={type} corner={TOP_RIGHT} componentIndex={dataColumnIndex} component={dataColumn}/>
        <SizingControl type={SUBCOMPONENT_DRAG_DATA} subType={type} corner={BOTTOM_LEFT} componentIndex={dataColumnIndex} component={dataColumn}/>
        <SizingControl type={SUBCOMPONENT_DRAG_DATA} subType={type} corner={BOTTOM_RIGHT} componentIndex={dataColumnIndex} component={dataColumn}/>
        {getValue()}
    </div>; 
};

export default SubComponent;