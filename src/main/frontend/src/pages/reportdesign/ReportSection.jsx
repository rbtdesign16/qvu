import React from "react";
import { Splitter, SplitterPanel } from 'primereact/splitter';
import useReportDesign from "../../context/ReportDesignContext";
import ReportComponent from "./ReportComponent";
import PropTypes from "prop-types";
import {
    REPORT_SECTION_HEADER,
    REPORT_SECTION_BODY,
    REPORT_SECTION_FOOTER,
    REPORT_UNITS_INCH,
    REPORT_UNITS_MM,
    REPORT_SECTION_BORDER,
    reportUnitsToPixels,
    pixelsToReportUnits,
    getReportWidth,
    getReportHeight
} from "../../utils/helper";

const ReportSection = (props) => {
    const {
        reportSettings,
        currentReport,
        setCurrentReport
    } = useReportDesign();
    
    const {section} = props;
    const reportWidth = getReportWidth(currentReport, reportSettings);
    const reportHeight = getReportHeight(currentReport, reportSettings);
     
    const getSectionHeight = () => {
        switch(section) {
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

        let units = "in";
        let height = getSectionHeight();

        if (currentReport.pageUnits === REPORT_UNITS_MM) {
            units = "mm";
        }

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

    const loadComponents = () => {
        if (currentReport.reportObjects && (currentReport.reportObjects.length > 0)) {
            return currentReport.reportObjects.map(o => {
                return <ReportComponent component={o}/>;
            });
        } else {
            return "";
        }
    };

    return <div style={getStyle()}>{loadComponents()}</div>;
};


ReportSection.propTypes = {
    section: PropTypes.string.isRequired
};


export default ReportSection;