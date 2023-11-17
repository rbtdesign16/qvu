import React from "react";
import { Splitter, SplitterPanel } from 'primereact/splitter';
import useReportDesign from "../../context/ReportDesignContext";
import ReportComponent from "./ReportComponent";
import PropTypes from "prop-types";
import {
    REPORT_SECTION_HEADER,
    REPORT_SECTION_BODY,
    REPORT_SECTION_FOOTER,
    REPORT_SECTION_BORDER,
    pixelsToReportUnits,
    getReportWidth,
    getReportHeight,
    isNotEmpty,
    copyObject,
    MOVE_DROP_EFFECT,
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT
} from "../../utils/helper";

const ReportSection = (props) => {
    const {
        reportSettings,
        currentReport,
        setCurrentReport
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
        if (e.dataTransfer.getData("szinfo") 
            || e.dataTransfer.getData("cinfo")) {
            e.preventDefault();
            let cr = copyObject(currentReport);
            let units = currentReport.pageUnits.substring(0, 2);
            if (e.dataTransfer.getData("szinfo")) {
                let szinfo = JSON.parse(e.dataTransfer.getData("szinfo"));
                let c = cr.reportComponents[szinfo.index];
                let xdif = pixelsToReportUnits(units, e.pageX - szinfo.x);
                let ydif = pixelsToReportUnits(units, e.pageY - szinfo.y);

                switch(szinfo.corner) {
                    case TOP_LEFT:
                        c.top += ydif;
                        c.left += xdif;
                        c.width -= xdif;
                        c.height -= ydif;
                        break;
                    case TOP_RIGHT:
                        c.top += ydif;
                        c.width += xdif;
                        c.height -= ydif;
                        break;
                    case BOTTOM_RIGHT:
                        c.height += ydif;
                        c.width += xdif;
                        break;
                    case BOTTOM_LEFT:
                        c.left += xdif;
                        c.width -= xdif;
                        c.height += ydif;
                        break;
                }
            } else if (e.dataTransfer.getData("cinfo")) {
                let cinfo = JSON.parse(e.dataTransfer.getData("cinfo"));
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
                c.left = pixelsToReportUnits(units, x - cinfo.left);
                c.top = pixelsToReportUnits(units, y - cinfo.top);
            }

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

    return <div id={section} 
         onDrop={e => handleDrop(e)} 
         onDragOver={e => handleDragOver(e)}
         style={getStyle()}>{loadComponents()}</div>;
};

ReportSection.propTypes = {
    section: PropTypes.string.isRequired
};

export default ReportSection;