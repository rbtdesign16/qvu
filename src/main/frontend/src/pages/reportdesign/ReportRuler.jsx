import React from "react";
import PropTypes from "prop-types";

const ReportRuler = () => {
    return (
            <div>
                report ruler
            </div>
            );
};

ReportRuler.propTypes = {
    report: PropTypes.object.isRequired,
    position: PropTypes.string.isRequired
};

export default ReportRuler;