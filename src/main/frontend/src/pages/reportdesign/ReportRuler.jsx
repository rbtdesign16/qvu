import React from "react";
import PropTypes from "prop-types";

const ReportRuler = (props) => {
    const {report, type} = props;
    
    const buildRuler = () => {
        let myStyle = {};
        
        if (type === "hor") {
            myStyle.height = "30px";
            myStyle.top = "0";
        } else {
            myStyle.width = "30px";
            myStyle.top = "30px";
        }
        return <canvas style={myStyle} className="ruler">ruler</canvas>;
    };
    
    return buildRuler();
};


ReportRuler.propTypes = {
    report: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired
};

export default ReportRuler;