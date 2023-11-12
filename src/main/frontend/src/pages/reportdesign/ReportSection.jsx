import React from "react";
import { Splitter, SplitterPanel } from 'primereact/splitter';
import PropTypes from "prop-types";
import {
    REPORT_SECTION_HEADER,
    REPORT_SECTION_BODY,
    REPORT_SECTION_FOOTER,
    REPORT_UNITS_INCH,
    REPORT_UNITS_MM,
    REPORT_SECTION_BORDER,
    reportUnitsToPixels,
    pixelsToReportUnits
    } from "../../utils/helper";

const ReportSection = (props) => {
    const {report, section, width, height} = props;

    const getStyle = () => {
        let retval = {
            position: "relative",
            overflow: "hidden"
        };
        
        let units = "in";
        
        if (report.pageUnits === REPORT_UNITS_MM) {
            units = "mm";
        }
        
        
        
        switch (section) {
            case REPORT_SECTION_HEADER:
                retval.margin = report.pageBorder[1] + units + " " + report.pageBorder[2] + units + " 0 " + report.pageBorder[0] + units;
                retval.width = width - (report.pageBorder[0] + report.pageBorder[2]) + units;
                retval.height = height - report.pageBorder[1] + units;
                retval.borderLeft = REPORT_SECTION_BORDER;
                retval.borderTop = REPORT_SECTION_BORDER;
                retval.borderRight = REPORT_SECTION_BORDER;
                break;
            case REPORT_SECTION_BODY:
                retval.margin =  "0 " + report.pageBorder[2] + units + " 0 " + report.pageBorder[0] + units;
                retval.width = width - (report.pageBorder[0] + report.pageBorder[2]) + units;
                retval.height = height + units;
                retval.borderLeft = REPORT_SECTION_BORDER;
                retval.borderRight = REPORT_SECTION_BORDER;
                break;
            case REPORT_SECTION_FOOTER:
                retval.margin = "0 " + report.pageBorder[2] + units + " " + report.pageBorder[3] + units + " " + report.pageBorder[0] + units;
                retval.borderBottom= REPORT_SECTION_BORDER;
                retval.borderLeft = REPORT_SECTION_BORDER;
                retval.borderRight = REPORT_SECTION_BORDER;
                retval.width = width - (report.pageBorder[0] + report.pageBorder[2]) + units;
                retval.height = height - report.pageBorder[3] + units;
                break;
        }
        
        return retval;
    };
    
    
    return <div style={getStyle()}></div>;
};


ReportSection.propTypes = {
    report: PropTypes.object.isRequired,
    section: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
};


export default ReportSection;