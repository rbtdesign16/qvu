import React from "react";
import PropTypes from "prop-types";
import { 
    REPORT_ORIENTATION_LANDSCAPE, 
    REPORT_ORIENTATION_PORTRAIT,
    REPORT_UNITS_INCH,
    REPORT_UNITS_MM
} from "../../utils/helper";

const ReportContent = (props) => {
    const {report, reportSettings} = props;
    
    const getStyle = () => {
        let height;
        let width;
        
        let size = reportSettings.pageSizeSettings[report.pageSize];
        
        if (report.pageOrientation === REPORT_ORIENTATION_PORTRAIT) {
            if (report.pageUnits === REPORT_UNITS_INCH) {
                width = size[2] + "in";
                height = size[3] + "in";
            } else {
                width = size[0] + "mm";
                height = size[1] + "mm";
            }   
        } else {
            if (report.pageUnits === REPORT_UNITS_INCH) {
                width = size[3] + "in";
                height = size[2] + "in";
            } else {
                width = size[1] + "mm";
                height = size[0] + "mm";
            }   
        }
        
        
        return {
            width: width,
            height: height,
            top: "-" + height
        };
    };
    
    return <div style={getStyle()} className="report-content"></div>;
};


ReportContent.propTypes = {
    report: PropTypes.object.isRequired,
    reportSettings: PropTypes.object.isRequired
};


export default ReportContent;