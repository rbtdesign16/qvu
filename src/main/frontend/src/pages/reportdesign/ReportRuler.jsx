import React from "react";
import PropTypes from "prop-types";

const ReportRuler = (props) => {
    const {report, position} = props;
    
    const buildRuler = () => {
        return <div>ruler</div>;
    };
    
    return buildRuler();
};


ReportRuler.propTypes = {
    report: PropTypes.object.isRequired,
    position: PropTypes.string.isRequired
};

export default ReportRuler;