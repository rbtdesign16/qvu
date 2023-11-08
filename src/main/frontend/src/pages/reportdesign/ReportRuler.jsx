import React from "react";
import PropTypes from "prop-types";
import {
    PIXELS_PER_INCH,
    PIXELS_PER_MM,
    PIXELS_PER_POINT,
    HORIZONTAL_KEY,
    VERTICAL_KEY,
    getReportWidth,
    getReportHeight} from "../../utils/helper";

const ReportRuler = (props) => {
    const {report, reportSettings, type} = props;
    
    const buildRuler = () => {
        let myStyle = {};
        
        if (type === HORIZONTAL_KEY) {
            myStyle.height = "30px";
            myStyle.width = getReportWidth(report, reportSettings) + "px";
            myStyle.top = "0";
        } else {
            myStyle.width = "30px";
            myStyle.top = "30px";
            myStyle.height = getReportHeight(report, reportSettings) + "px";
        }
        return <canvas style={myStyle} className="ruler">ruler</canvas>;
    };
    
    return buildRuler();
};


ReportRuler.propTypes = {
    report: PropTypes.object.isRequired,
    reportSettings: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired
};

export default ReportRuler;