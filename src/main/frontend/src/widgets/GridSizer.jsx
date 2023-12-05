import React, { useState } from "react";
import PropTypes from "prop-types";
import useReportDesign from "../context/ReportDesignContext";
import {copyObject} from "../utils/helper";
import {RESIZER_ID_PREFIX, COMPONENT_ID_PREFIX} from "../utils/reportHelper";

const GridSizer = (props) => {
    const {type, row, column, component, componentIndex, units} = props;
    const {
        currentReport,
        setCurrentReport
    } = useReportDesign();

    const onHandleSize = (e) => {
        e.preventDefault();
    };

    const onStopSize = (e) => {
        e.preventDefault();
    };

    const showResizer = (e) => {
        if (type === "width") {
            let el = document.getElementById(RESIZER_ID_PREFIX + COMPONENT_ID_PREFIX + "ver-" + componentIndex);
            el.style.display = "block";
            el.style.left = e.clientX;
        } else {
            let el = document.getElementById(RESIZER_ID_PREFIX + COMPONENT_ID_PREFIX + "hor-" + componentIndex);
            el.style.display = "block";
            el.style.top = e.clienty;
        }
    };
        
    const onMouseDown = (e) => {
        e.preventDefault();

        showResizer(e);
        

    };

    const getClass = () => {
        if (type === "width") {
            return "col-sizer";
        } else {
            return "row-sizer";
        }
    };
    
    return (
            <div className={getClass()} onMouseDown={e => onMouseDown(e, type)}></div>
            );
};

GridSizer.propTypes = {
    type: PropTypes.string.isRequired,
    row: PropTypes.string.isRequired,
    column: PropTypes.number.isRequired,
    component: PropTypes.object.isRequired,
    componentIndex: PropTypes.number.isRequired,
    units: PropTypes.string.isRequired
};

export default GridSizer;
