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
    isNotEmpty
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
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        let cinfo = JSON.parse(e.dataTransfer.getData("cinfo"));

        let cr = {...currentReport};
        let c = cr.reportComponents[cinfo.index];

        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        c.section = section;
        c.left = pixelsToReportUnits(currentReport.pageUnits.substring(0, 2), x - cinfo.left);
        c.top = pixelsToReportUnits(currentReport.pageUnits.substring(0, 2), y - cinfo.top);

        setCurrentReport(cr);
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