import React, { useState } from "react";
import PropTypes from "prop-types";
import useReportDesign from "../context/ReportDesignContext";
import {copyObject} from "../utils/helper";
import {RESIZER_ID_PREFIX} from "../utils/reportHelper";

const GridSizer = (props) => {
    const {type, row, column, component, units} = props;
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

    const getResizer = (e) => {
        let retval = document.createElement("div");
        if (retval) {
            if (type === "width") {
                retval.position = "absolute";
                retval.style.width = "10px";
                retval.style.height = "200px";
                retval.style.left = "100px";
                retval.style.top = "200px";
            } else {
                retval.style.width = "2px";
                retval.style.height = component.height + units;
                retval.style.top = 0;
                retval.style.left = e.clientX + "px";
            }

            retval.style.background = "red";
            retval.display = "inline-block";
            retval.cursor = "pointer";
        }
        
        return retval;
    }
        
    const onMouseDown = (e) => {
        e.preventDefault();

        let sizer = getResizer(e);
        

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
    units: PropTypes.string.isRequired
};

export default GridSizer;
