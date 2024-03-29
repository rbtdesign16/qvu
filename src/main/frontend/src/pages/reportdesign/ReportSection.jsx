import React from "react";
import { Splitter, SplitterPanel } from 'primereact/splitter';
import useReportDesign from "../../context/ReportDesignContext";
import ReportComponent from "./ReportComponent";
import ReportContent from "./ReportContent";
import PropTypes from "prop-types";
import {
isNotEmpty,
        copyObject,
        intersectRect,
        NONE_SETTING,
        DATA_TYPE,
        LABEL_TYPE
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
    elementPosToNumber,
    COMPONENT_DRAG_DATA,
    SUBCOMPONENT_DRAG_DATA,
    isDataComponent,
    RESIZER_ID_PREFIX,
    COMPONENT_ID_PREFIX,
    DATA_COLUMN_ID_PREFIX,
    FREEFORM_GRID_CONTAINER_ID_PREFIX,
    handleComponentDragOver
    } from "../../utils/reportHelper";

const ReportSection = (props) => {
    const {
        reportSettings,
        currentReport,
        setCurrentReport,
        setLastSelectedIndex,
        lastSelectedIndex,
        componentHasSelectedSubComponents,
        deselectAllSubComponents
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

    const handleDrop = (e) => {
        let el = document.elementFromPoint(e.clientX, e.clientY);

        if (el && (el.id.startsWith(DATA_COLUMN_ID_PREFIX)
            || el.id.startsWith(FREEFORM_GRID_CONTAINER_ID_PREFIX))) {
            e.preventDefault();
            let dataid = e.dataTransfer.types.find((type) => type.startsWith(SUBCOMPONENT_DRAG_DATA));
            if (dataid) {
                // if coming in from subcomponent drag with
                // scinfo prefix - split out parts to build
                // valid data id
                let parts = dataid.split("-");
                let data = e.dataTransfer.getData(dataid);
                if (data) {
                    let scinfo = JSON.parse(data);
                    let cr = copyObject(currentReport);
                    let c = cr.reportComponents[Number(parts[2])];
                    let sc = c.value.dataColumns[scinfo.index];

                    let rect = document.getElementById(sc.parentId).getBoundingClientRect();

                    let x = e.clientX - rect.left;
                    let y = e.clientY - rect.top;

                    if (scinfo.additionalInfo === DATA_TYPE) {
                        sc.dataLeft = pixelsToReportUnits(currentReport.pageUnits, x - scinfo.left);
                        sc.dataTop = pixelsToReportUnits(currentReport.pageUnits, y - scinfo.top);
                    } else {
                        sc.labelLeft = pixelsToReportUnits(currentReport.pageUnits, x - scinfo.left);
                        sc.labelTop = pixelsToReportUnits(currentReport.pageUnits, y - scinfo.top);
                    }

                    setCurrentReport(cr);
                }
            }
        } else if (e.dataTransfer.getData(COMPONENT_DRAG_DATA)) {
            e.preventDefault();
            let cr = copyObject(currentReport);
            let cinfo = JSON.parse(e.dataTransfer.getData(COMPONENT_DRAG_DATA));
            let c = cr.reportComponents[cinfo.index];

            c.section = section;

            let rect = document.getElementById(c.section).getBoundingClientRect();

            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

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
            width = ((e.clientX - rc.left) - sz.startX) + "px";
            ;

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

        let width = elementPosToNumber(sz.style.width);
        let height = elementPosToNumber(sz.style.height);

        let sec = document.getElementById(section);
        sec.style.cursor = "default";
        sec.removeEventListener("mousemove", onHandleLasso, true);
        sec.removeEventListener("mouseup", onStopLasso, true);

        if ((width >= MIN_LASSO_CHANGE) || (height >= MIN_LASSO_CHANGE)) {
            let cr = copyObject(currentReport);

            let rc1 = {left: elementPosToNumber(sz.style.left),
                top: elementPosToNumber(sz.style.top),
                right: elementPosToNumber(sz.style.left) + width,
                bottom: elementPosToNumber(sz.style.top) + height};

            for (let i = 0; i < cr.reportComponents.length; ++i) {
                let c = cr.reportComponents[i];
                if (c.section === section) {
                    let rc2 = {
                        left: reportUnitsToPixels(cr.pageUnits, c.left),
                        top: reportUnitsToPixels(cr.pageUnits, c.top),
                        right: reportUnitsToPixels(cr.pageUnits, c.left + c.width),
                        bottom: reportUnitsToPixels(cr.pageUnits, c.top + c.height)};
                    c.selected = intersectRect(rc1, rc2);
                    
                    if (c.selected && componentHasSelectedSubComponents(c)) {
                        deselectAllSubComponents(c);
                    }
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

            sz.style.left = sz.style.top = sz.style.width = sz.style.height = 0;
            sz.startX = "";
            sz.startY = "";
        }

        sz.style.display = "";
        sz.style.border = "";

    };

    const onMouseDown = (e) => {
        if (e.target.id) {
            if (e.target.id === section) {
                let sz = getSizer(section);
                let sec = document.getElementById(section);
                let rc = sec.getBoundingClientRect();
                sec.style.cursor = "crosshair";
                sz.startX = e.clientX - rc.left;
                sz.startY = e.clientY - rc.top;

                sz.style.left = sz.startX + "px";
                sz.style.top = sz.startY + "px";
                sz.style.width = sz.style.height = 0;
                sz.style.display = "inline-block";

                sec.addEventListener("mousemove", onHandleLasso, true);
                sec.addEventListener("mouseup", onStopLasso, true);
            }
        }
    };

    return <div id={section} 
     onDrop={e => handleDrop(e)} 
     onDragOver={e => handleComponentDragOver(e)}
     onMouseDown={e => onMouseDown(e)}
     onContextMenu={e => onContextMenu(e, -1, section)} 
     style={getStyle()}>
    <div id={RESIZER_ID_PREFIX + section} className="resizer"></div>
    {loadComponents()}
</div>;
};

ReportSection.propTypes = {
    section: PropTypes.string.isRequired
};

export default ReportSection;