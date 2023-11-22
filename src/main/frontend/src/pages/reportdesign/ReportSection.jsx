import React from "react";
import { Splitter, SplitterPanel } from 'primereact/splitter';
import useReportDesign from "../../context/ReportDesignContext";
import ReportComponent from "./ReportComponent";
import ReportContent from "./ReportContent";
import PropTypes from "prop-types";
import {
    isNotEmpty,
    copyObject,
    intersectRect
} from "../../utils/helper";

import {
    MIN_LASSO_CHANGE,
    REPORT_SECTION_HEADER,
    REPORT_SECTION_BODY,
    REPORT_SECTION_FOOTER,
    REPORT_SECTION_BORDER,
    pixelsToReportUnits,
    reportUnitsToPixels,
    getReportWidth,
    getReportHeight,
    MOVE_DROP_EFFECT,
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT,
    getSizer,
    pixelPosToNumber,
    COMPONENT_DRAG_DATA
} from "../../utils/reportHelper";

const ReportSection = (props) => {
    const {
        reportSettings,
        currentReport,
        setCurrentReport,
        setLastSelectedIndex,
        lastSelectedIndex
    } = useReportDesign();

    const {section, onContextMenu} = props;
    const reportWidth = getReportWidth(currentReport, reportSettings);
    const reportHeight = getReportHeight(currentReport, reportSettings);


     const getSectionHeight = () => {
        switch (section) {
            case REPORT_SECTION_HEADER:
                return currentReport.headerHeight;
                break;
            case REPORT_SECTION_BODY:
                return reportHeight - (currentReport.headerHeight + currentReport.footerHeight);
                break;
            case REPORT_SECTION_FOOTER:
                return currentReport.footerHeight;
                break;
        }
    };

    const getStyle = () => {
        let retval = {
            position: "relative",
            overflow: "hidden"
        };

        let units = currentReport.pageUnits.substring(0, 2);
        let height = getSectionHeight();

        switch (section) {
            case REPORT_SECTION_HEADER:
                retval.margin = currentReport.pageBorder[1] + units + " " + currentReport.pageBorder[2] + units + " 0 " + currentReport.pageBorder[0] + units;
                retval.width = reportWidth - (currentReport.pageBorder[0] + currentReport.pageBorder[2]) + units;
                retval.height = height - currentReport.pageBorder[1] + units;
                retval.borderLeft = REPORT_SECTION_BORDER;
                retval.borderTop = REPORT_SECTION_BORDER;
                retval.borderRight = REPORT_SECTION_BORDER;
                break;
            case REPORT_SECTION_BODY:
                retval.margin = "0 " + currentReport.pageBorder[2] + units + " 0 " + currentReport.pageBorder[3] + units;
                retval.width = reportWidth - (currentReport.pageBorder[0] + currentReport.pageBorder[2]) + units;
                retval.height = height + units;
                retval.borderLeft = REPORT_SECTION_BORDER;
                retval.borderRight = REPORT_SECTION_BORDER;
                break;
            case REPORT_SECTION_FOOTER:
                retval.margin = "0 " + currentReport.pageBorder[2] + units + " " + currentReport.pageBorder[3] + units + " " + currentReport.pageBorder[0] + units;
                retval.borderBottom = REPORT_SECTION_BORDER;
                retval.borderLeft = REPORT_SECTION_BORDER;
                retval.borderRight = REPORT_SECTION_BORDER;
                retval.width = reportWidth - (currentReport.pageBorder[0] + currentReport.pageBorder[2]) + units;
                retval.height = height - currentReport.pageBorder[3] + units;
                break;
        }

        return retval;
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = MOVE_DROP_EFFECT;
    };

    const isDropTargetSection = (tid) => {
        return ((tid === REPORT_SECTION_BODY)
        || (tid === REPORT_SECTION_HEADER)
        || (tid === REPORT_SECTION_FOOTER));
    };
    
    const handleDrop = (e) => {
        if (e.dataTransfer.getData(COMPONENT_DRAG_DATA)) {
            e.preventDefault();
            let cr = copyObject(currentReport);
            let cinfo = JSON.parse(e.dataTransfer.getData(COMPONENT_DRAG_DATA));
            let c = cr.reportComponents[cinfo.index];

            let rect;
            // if we are dropping on a section
            if (isDropTargetSection(e.target.id)) {
                rect = e.target.getBoundingClientRect();
            } else { // else dropping on a component
                rect = e.target.parentElement.getBoundingClientRect();
            }

            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;
            c.section = section;
            c.left = pixelsToReportUnits(currentReport.pageUnits, x - cinfo.left);
            c.top = pixelsToReportUnits(currentReport.pageUnits, y - cinfo.top);

            setCurrentReport(cr);
        }
    };

    const loadComponents = () => {
        if (currentReport.reportComponents && (currentReport.reportComponents.length > 0)) {
            return currentReport.reportComponents.map((o, indx) => {
                if (o.section === section) {
                    return <ReportComponent 
                        component={o} 
                        componentIndex={indx}
                        onContextMenu={onContextMenu}/>;
                } else {
                    return "";
                }
            });
        } else {
            return "";
        }
    };

    const onHandleLasso = (e) => {
        e.preventDefault();
        let sz = getSizer(section);

        let top;
        let left;
        let width;
        let height;

        let rc = document.getElementById(section).getBoundingClientRect();

        if ((e.clientX - rc.left) >= sz.startX) {
            left = sz.startX + "px";
            width = ((e.clientX - rc.left) - sz.startX) + "px";;
            
        } else {
            left = (e.clientX - rc.left) + "px";
            width = (sz.startX - (e.clientX - rc.left)) + "px";
        }
        
        if ((e.clientY - rc.top) >= sz.startY) {
            top = sz.startY + "px";
            height = ((e.clientY - rc.top) - sz.startY) + "px";
        } else {
            top = (e.clientY - rc.top) + "px";
            height = (sz.startY - (e.clientY - rc.top)) + "px";
        }
        
        sz.style.left = left;
        sz.style.top = top;
        sz.style.width = width;
        sz.style.height = height;

    };
    
    const onStopLasso = (e) => {
        e.preventDefault();
        let sz = getSizer(section);
        
        let width = pixelPosToNumber(sz.style.width);
        let height =  pixelPosToNumber(sz.style.height);

        let sec = document.getElementById(section);
        sec.style.cursor = "default";
        sec.removeEventListener("mousemove", onHandleLasso);
        sec.removeEventListener("mouseup", onStopLasso);

        if ((width >= MIN_LASSO_CHANGE) || (height >= MIN_LASSO_CHANGE)) {
            let cr = copyObject(currentReport);
 
            let rc1 = {left: pixelPosToNumber(sz.style.left), 
                top: pixelPosToNumber(sz.style.top), 
                right: pixelPosToNumber(sz.style.left) + width, 
                bottom: pixelPosToNumber(sz.style.top) +height};

            for (let i = 0; i < cr.reportComponents.length; ++i) {
                let c = cr.reportComponents[i];
                if (c.section === section) {
                    let rc2 = {
                        left: reportUnitsToPixels(cr.pageUnits, c.left), 
                        top: reportUnitsToPixels(cr.pageUnits, c.top), 
                        right: reportUnitsToPixels(cr.pageUnits, c.left + c.width), 
                        bottom: reportUnitsToPixels(cr.pageUnits, c.top + c.height)};
                        c.selected = intersectRect(rc1, rc2);
                 } else {
                    c.selected = false;
                 }
            }  


            let lastSelected = -1;
            for (let i = 0; i < cr.reportComponents.length; ++i) {
                let c = cr.reportComponents[i];

                if (c.selected) {
                    if (i === lastSelectedIndex) {
                        lastSelected = setLastSelectedIndex;
                        break;
                    } else {
                        lastSelected = i;
                    }
                }
            }

            setLastSelectedIndex(lastSelected);
            setCurrentReport(cr);
        }
        
        sz.style.display = "";
        sz.style.border = "";

        sz.style.left = sz.style.top = sz.style.width = sz.style.height = 0;
        sz.startX = "";
        sz.startY = "";

     };

    const onMouseDown = (e) => {
        if (e.target.id && (e.target.id === section)) {
            let sz = getSizer(section);
            let sec = document.getElementById(section);
            let rc = sec.getBoundingClientRect();
            sec.style.cursor = "crosshair";
            sz.startX = e.clientX - rc.left;
            sz.startY =  e.clientY - rc.top;
            
            sz.style.left = sz.startX + "px";
            sz.style.top = sz.startY + "px";
            sz.style.width = sz.style.height = 0;
            sz.style.display = "inline-block";
           
            sec.addEventListener("mousemove", onHandleLasso, true);
            sec.addEventListener("mouseup", onStopLasso, true);
        }
    };

    return <div id={section} 
         onDrop={e => handleDrop(e)} 
         onDragOver={e => handleDragOver(e)}
         onMouseDown={e => onMouseDown(e)}
         onContextMenu={e => onContextMenu(e, -1, section)} 
         style={getStyle()}>
             <div id={"sz-" + section} className="resizer"></div>
            {loadComponents()}
        </div>;
};

ReportSection.propTypes = {
    section: PropTypes.string.isRequired
};

export default ReportSection;