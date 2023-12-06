import React, { useState } from "react";
import PropTypes from "prop-types";
import useReportDesign from "../context/ReportDesignContext";
import {copyObject} from "../utils/helper";
import {
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT,
    pixelsToReportUnits,
    reportUnitsToPixels,
    elementPosToNumber,
    reformatDataComponent,
    isDataComponent,
    getSizer,
    SUBCOMPONENT_DRAG_DATA,
    COMPONENT_DRAG_DATA,
    COMPONENT_ID_PREFIX} from "../utils/reportHelper";

const SizingControl = (props) => {
    const {type, subType, component, componentIndex, corner} = props;
    const {
        currentReport,
        setCurrentReport
    } = useReportDesign();

    const getCurrentSizer = () => {
        if (type === COMPONENT_DRAG_DATA) {
            return getSizer(component.section);
        } else {
            console.log("---------->" + component.parentId);
            return getSizer(component.parentId);
        }
    };
    
    const onHandleSize = (e) => {
        e.preventDefault();
        let sz = getCurrentSizer();
        
        let xdif = e.pageX - sz.startX;
        let ydif = e.pageY - sz.startY;

        sz.startX = e.pageX;
        sz.startY = e.pageY;


        let top = elementPosToNumber(sz.style.top);
        let left = elementPosToNumber(sz.style.left);
        let width = elementPosToNumber(sz.style.width);
        let height = elementPosToNumber(sz.style.height);

        switch (corner) {
            case TOP_LEFT:
                top += ydif;
                left += xdif;
                width -= xdif;
                height -= ydif;
                break;
            case TOP_RIGHT:
                top += ydif;
                height -= ydif;
                width += xdif;
                break;
            case BOTTOM_LEFT:
                left += xdif;
                height += ydif;
                width -= xdif;
                break;
            case BOTTOM_RIGHT:
                height += ydif;
                width += xdif;
                break;
        }

        if ((width > 0) && (height > 0)) {
            sz.style.left = left + "px";
            sz.style.top = top + "px";
            sz.style.width = width + "px";
            sz.style.height = height + "px";
        }
    };

    const onStopSize = (e) => {
        e.preventDefault();
        let sz = getCurrentSizer();
        sz.style.display = "";
        sz.style.border = "";
        sz.startX = "";
        sz.startY = "";

        let cr = copyObject(currentReport);
        let c;
                 
        let units = currentReport.pageUnits.substring(0, 2);

        if (type === SUBCOMPONENT_DRAG_DATA) {
            let pc = cr.reportComponents[Number(component.parentId.replace(COMPONENT_ID_PREFIX, ""))];
             c = pc.value.dataColumns[componentIndex];
            c[subType + "Left"] = pixelsToReportUnits(units, elementPosToNumber(sz.style.left));
            c[subType + "Top"] = pixelsToReportUnits(units, elementPosToNumber(sz.style.top));
            c[subType + "Width"] = pixelsToReportUnits(units, elementPosToNumber(sz.style.width));
            c[subType + "Height"] = pixelsToReportUnits(units, elementPosToNumber(sz.style.height));
        } else {
            let c = cr.reportComponents[componentIndex];
            c.left = pixelsToReportUnits(units, elementPosToNumber(sz.style.left));
            c.top = pixelsToReportUnits(units, elementPosToNumber(sz.style.top));
            c.width = pixelsToReportUnits(units, elementPosToNumber(sz.style.width));
            c.height = pixelsToReportUnits(units, elementPosToNumber(sz.style.height));
            if (isDataComponent(type)) {
                reformatDataComponent(currentReport, c);
            }
        }
        
        let p = getParent();
        p.style.cursor = "";
        p.removeEventListener("mousemove", onHandleSize, true);
        p.removeEventListener("mouseup", onStopSize, true);
        setCurrentReport(cr);
    };

    const getParent = () => {
        if (type === COMPONENT_DRAG_DATA) {
            return document.getElementById(component.section);
        } else {
            return document.getElementById(component.parentId);
        }
    };
    
    const onMouseDown = (e, type) => {
        e.preventDefault();
        let units = currentReport.pageUnits.substring(0, 2);
        let sz = getCurrentSizer();
        if (type && (type === SUBCOMPONENT_DRAG_DATA)) {
            sz.style.left = reportUnitsToPixels(units, component[subType + "Left"]) + "px";
            sz.style.top = reportUnitsToPixels(units, component[subType + "Top"]) + "px";
            sz.style.width = reportUnitsToPixels(units, component[subType + "Width"]) + "px";
            sz.style.height = reportUnitsToPixels(units, component[subType + "Height"]) + "px";
        } else {
            sz.style.left = reportUnitsToPixels(units, component.left) + "px";
            sz.style.top = reportUnitsToPixels(units, component.top) + "px";
            sz.style.width = reportUnitsToPixels(units, component.width) + "px";
            sz.style.height = reportUnitsToPixels(units, component.height) + "px";
        }
        sz.style.display = "inline-block";
        sz.startX = e.pageX;
        sz.startY = e.pageY;


        let p = getParent();
        p.style.cursor = "crosshair";
        p.addEventListener("mousemove", onHandleSize, true);
        p.addEventListener("mouseup", onStopSize, true);
    };

    const getStyle = () => {
        if (type === COMPONENT_DRAG_DATA) {
            return {zIndex: 10};
        } else {
            return {};
        }
    };

    return (
            <div 
                style={getStyle()}
                onMouseDown={e => onMouseDown(e, type)}
                className={"sizing-" + corner}></div>
            );
};

SizingControl.propTypes = {
    type:  PropTypes.string.isRequired,
    subType: PropTypes.string,
    component: PropTypes.object.isRequired,
    componentIndex: PropTypes.number.isRequired,
    corner: PropTypes.string.isRequired
};

export default SizingControl;
