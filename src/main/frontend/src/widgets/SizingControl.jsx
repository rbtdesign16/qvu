import React, { useState } from "react";
import PropTypes from "prop-types";
import useReportDesign from "../context/ReportDesignContext";
import {
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT,
    pixelsToReportUnits,
    reportUnitsToPixels,
    copyObject,
    pixelPosToNumber,
    getSizer} from "../utils/helper";
const SizingControl = (props) => {
    const {component, componentIndex, corner} = props;
    const {
        currentReport,
        setCurrentReport
    } = useReportDesign();

    const onHandleSize = (e) => {
        e.preventDefault();
        let sz = getSizer(component.section);

        let xdif = e.pageX - sz.startX;
        let ydif = e.pageY - sz.startY;
        
        sz.startX = e.pageX;
        sz.startY = e.pageY;
        
        let top = pixelPosToNumber(sz.style.top);
        let left = pixelPosToNumber(sz.style.left);
        let width = pixelPosToNumber(sz.style.width);
        let height = pixelPosToNumber(sz.style.height);

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
        let sz = getSizer(component.section);
        sz.style.display = "";
        sz.style.border = "";
        sz.startX = "";
        sz.startY = "";
        
        let cr = copyObject(currentReport);
        let c = cr.reportComponents[componentIndex];
        let units = currentReport.pageUnits.substring(0, 2);
        c.left = pixelsToReportUnits(units, pixelPosToNumber(sz.style.left));
        c.top =  pixelsToReportUnits(units, pixelPosToNumber(sz.style.top));
        c.width =  pixelsToReportUnits(units, pixelPosToNumber(sz.style.width));
        c.height =  pixelsToReportUnits(units, pixelPosToNumber(sz.style.height));
        document.getElementById(component.section).removeEventListener("mousemove", onHandleSize, true);
        document.getElementById(component.section).removeEventListener("mouseup", onStopSize, true);
        setCurrentReport(cr);
    };

    const onMouseDown = (e) => {
        e.preventDefault();
        let units = currentReport.pageUnits.substring(0, 2);
        
        let sz = getSizer(component.section);
        sz.style.left = reportUnitsToPixels(units, component.left) + "px";
        sz.style.top = reportUnitsToPixels(units, component.top) + "px";
        sz.style.width = reportUnitsToPixels(units, component.width) + "px";
        sz.style.height = reportUnitsToPixels(units, component.height) + "px";
        sz.style.display = "inline-block";
        sz.startX = e.pageX;
        sz.startY = e.pageY;
        
        document.getElementById(component.section).addEventListener("mousemove", onHandleSize, true);
        document.getElementById(component.section).addEventListener("mouseup", onStopSize, true);
    };

    return (
            <div 
                onMouseDown={e => onMouseDown(e)}
                className={"sizing-" + corner}></div>
            );
};

SizingControl.propTypes = {
    component: PropTypes.object.isRequired,
    componentIndex: PropTypes.number.isRequired,
    corner: PropTypes.string.isRequired
};

export default SizingControl;
