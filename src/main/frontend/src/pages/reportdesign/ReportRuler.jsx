import React from "react";
import PropTypes from "prop-types";
import {
    HORIZONTAL_KEY,
    VERTICAL_KEY} from "../../utils/helper";

const ReportRuler = (props) => {
    const {report, height, width, type} = props;
    
    const buildRuler = () => {
        let myStyle = {
            height: height + "px",
            width: width + "px"
        };
        
        return <canvas style={myStyle} className="ruler">ruler</canvas>;
    };
    
    return buildRuler();
};


ReportRuler.propTypes = {
    report: PropTypes.object.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired
};

export default ReportRuler;