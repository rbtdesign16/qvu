import React, {useState} from "react";
import { Splitter, SplitterPanel } from "primereact/splitter";
import ReportSection from "./ReportSection";
import SizingControl from "../../widgets/SizingControl"
import PropTypes from "prop-types";
import useReportDesign from "../../context/ReportDesignContext";
import { 
    copyObject,
    DATA_TYPE,
    LABEL_TYPE,
    isNotEmpty
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
    PIXELS_PER_POINT,
    pixelsToReportUnits,
    updateComponentFontSettings,
    updateComponentBorderSettings,
    getQueryDataColumnDisplay,
    SUBCOMPONENT_DRAG_DATA,
    DATA_COLUMN_ID_PREFIX,
    onSubComponentClick,
    getSubComponentClassName
} from "../../utils/reportHelper";

const SubComponent = (props) => {
    const {component, componentIndex, dataColumn, dataColumnIndex, type, units, row} = props;
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
    
    const getStyle = () => {
        let gstyle = getComputedStyle(document.documentElement);

        let retval = {
            position: "absolute",
            left: dataColumn[type + "Left"] + units,
            top: ((component.value.dataRowHeight * row) + dataColumn[type + "Top"]) + units,
            width: dataColumn[type + "Width"] + units,
            height: dataColumn[type + "Height"] + units,
            background: "transparent"
        };

        if (isNotEmpty(dataColumn[type + "Zindex"])) {
            retval.zIndex = dataColumn[type + "Zindex"];
        }

        if (type === LABEL_TYPE) {
            if (!dataColumn[type + "Selected"]) {
                retval.outline = gstyle.getPropertyValue('--data-grid-label-border');
            }
            retval.textAlign = dataColumn.headerTextAlign;
            updateComponentFontSettings(component, "fontSettings", retval);
            updateComponentBorderSettings(component, "borderSettings", retval);
        } else {
            if (!dataColumn[type + "Selected"]) {
                retval.outline = gstyle.getPropertyValue('--data-grid-data-border');
            }
            retval.textAlign = dataColumn.dataTextAlign;
            updateComponentFontSettings(component, "fontSettings2", retval);
            updateComponentBorderSettings(component, "borderSettings2", retval);
        }  
        
       
        return retval;
    };

    if (row > 0) {
        return <div className={getSubComponentClassName(dataColumn, type)} style={getStyle()}>
            {getValue()}
        </div>; 
    } else {
        return <div 
            className={getSubComponentClassName(dataColumn, type)}
            id={DATA_COLUMN_ID_PREFIX + dataColumn.parentId + "-" + dataColumnIndex + "-" + type}
            style={getStyle()}
            draggable={true} 
            onDragStart={e => handleComponentDragStart(e, SUBCOMPONENT_DRAG_DATA + "-" + dataColumn.parentId, dataColumnIndex, type)}>
            <SizingControl type={SUBCOMPONENT_DRAG_DATA} subType={type} corner={TOP_LEFT} componentIndex={dataColumnIndex} component={dataColumn}/>
            <SizingControl type={SUBCOMPONENT_DRAG_DATA} subType={type} corner={TOP_RIGHT} componentIndex={dataColumnIndex} component={dataColumn}/>
            <SizingControl type={SUBCOMPONENT_DRAG_DATA} subType={type} corner={BOTTOM_LEFT} componentIndex={dataColumnIndex} component={dataColumn}/>
            <SizingControl type={SUBCOMPONENT_DRAG_DATA} subType={type} corner={BOTTOM_RIGHT} componentIndex={dataColumnIndex} component={dataColumn}/>
            {getValue()}
        </div>; 
    }
};

SubComponent.propTypes = {
    type: PropTypes.string.isRequired,
    row: PropTypes.number.isRequired,
    component: PropTypes.object.isRequired,
    componentIndex: PropTypes.number.isRequired,
    dataColumn: PropTypes.object.isRequired,
    dataColumnIndex: PropTypes.number.isRequired,
    units: PropTypes.string.isRequired
};

export default SubComponent;