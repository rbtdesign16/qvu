import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import useReportDesign from "../context/ReportDesignContext";
import {copyObject} from "../utils/helper";
import {
    RESIZER_ID_PREFIX,
    COMPONENT_ID_PREFIX,
    PIXELS_PER_KEYDOWN_MOVE,
    elementPosToNumber,
    reportUnitsToPixels,
    pixelsToReportUnits
} from "../utils/reportHelper";

const GridSizer = (props) => {
    const {type, row, column, component, componentIndex} = props;
    const [sizeBounds, setSizeBounds] = useState({min: 0, max: 0});
    const [units, setUnits] = useState(null);
    const {
        currentReport,
        setCurrentReport
    } = useReportDesign();

    const onHandleSize = (e) => {
        e.preventDefault();
        showResizer(e);
    };

    const onStopSize = (e) => {
        e.preventDefault();
        let cel = document.getElementById(COMPONENT_ID_PREFIX + componentIndex);
        hideResizer();
        if (cel) {
            cel.removeEventListener("mousemove", onHandleSize, true);
            cel.removeEventListener("mouseup", onStopSize, true);
            let rc = cel.getBoundingClientRect();
            let cr = copyObject(currentReport);
            let c = cr.reportComponents[componentIndex];
            if (type === "width") {
                let newpos = (e.clientX - rc.left);

                let parts = component.value.gridTemplateColumns.split(" ");
                let positions = [];
                let sizes = [];
                let position = 0;
                for (let i = 0; i < parts.length; ++i) {
                    let size = Number(reportUnitsToPixels(units, elementPosToNumber(parts[i])));
                    position += size;
                    sizes.push(size);
                    positions.push(position);
               }
               
               if (newpos > positions[column]) {
                   let diff = (newpos - positions[column]);
                   sizes[column] += diff; 
                   sizes[column + 1] -= diff;
               } else {
                  let diff = (positions[column] - newpos);
                  sizes[column] -= diff;
                  sizes[column + 1] += diff;
               }
               
               let gtl = "";
               for (let i = 0; i < sizes.length; ++i) {
                   gtl += pixelsToReportUnits(units, sizes[i]) + units + " ";
               }
               
               c.value.gridTemplateColumns = gtl.trim();
            } else {
                if (row === "header") {
                    c.value.headerRowHeight = pixelsToReportUnits(units, (e.clientY - rc.top));
                } else {
                   c.value.dataRowHeight =  pixelsToReportUnits(units, (e.clientY - rc.top)) - c.value.headerRowHeight;
                }
            }
            
            setCurrentReport(cr);
        }
    };

    const getSizerElement = (type) => {
        if (type === "width") {
            return document.getElementById(RESIZER_ID_PREFIX + COMPONENT_ID_PREFIX + "ver-" + componentIndex);
        } else {
            return document.getElementById(RESIZER_ID_PREFIX + COMPONENT_ID_PREFIX + "hor-" + componentIndex);
        }
    };

    const hideResizer = () => {
        let el = getSizerElement(type);

        if (el) {
            el.style.cursor = "";
            el.style.display = "";
            if (type === "width") {
                el.style.left = 0;
            } else {
                el.style.top = 0;
            }
        }
    };

    const getComponentElement = () => {
        let cid = COMPONENT_ID_PREFIX + componentIndex;
        return document.getElementById(cid);
        ;
    };

    const updateHorizontalSizeBounds = () => {
        if (component.value && component.value.gridTemplateColumns) {
            let parts = component.value.gridTemplateColumns.split(" ");
            let sizes = [];
            for (let i = 0; i < parts.length; ++i) {
                sizes.push(reportUnitsToPixels(units, elementPosToNumber(parts[i])));
            }

            let min = 0;
            for (let i = 0; i < column; ++i) {
                min += sizes[i];
            }

            setSizeBounds({min: min + PIXELS_PER_KEYDOWN_MOVE, max: (min + sizes[column] + (sizes[column + 1] - PIXELS_PER_KEYDOWN_MOVE))});
        }
    };

    const canResize = (newpos) => {
        return ((newpos > sizeBounds.min) && (newpos < sizeBounds.max));
    };

    const showResizer = (e) => {
        let el = getSizerElement(type);
        let cel = getComponentElement();
        if (el && cel) {
            let rc = cel.getBoundingClientRect();
            let init = !el.style.display;
            el.style.display = "block";
            if (type === "width") {
                el.style.cursor = "col-resize";
                let newpos = (e.clientX - rc.left);
                if (canResize(newpos)) {
                    el.style.left = newpos + "px";
                }
            } else {
                el.style.cursor = "row-resize";
                let newpos = (e.clientY - rc.top);

                if (newpos > PIXELS_PER_KEYDOWN_MOVE) {
                    el.style.top = newpos + "px";
                }
            }

            if (init) {
                cel.addEventListener("mousemove", onHandleSize, true);
                cel.addEventListener("mouseup", onStopSize, true);
            }
        }
    };


    const onMouseDown = (e) => {
        e.preventDefault();
        updateHorizontalSizeBounds();
        showResizer(e);
    };

    const getClass = () => {
        if (type === "width") {
            return "col-sizer";
        } else {
            return "row-sizer";
        }
    };

    const getStyle = () => {
        if (type === "width") {
            return {};
        } else {
            if (row === "header") {
                return {top: component.value.headerRowHeight + units};
            } else {
                return {top: (component.value.headerRowHeight + component.value.dataRowHeight) + units};
            }
        }
    };
    
    useEffect(() => {
        updateHorizontalSizeBounds();
        setUnits(currentReport.pageUnits.substring(0, 2));
    }, [sizeBounds]);

    return <div style={getStyle()} className={getClass()} onMouseDown={e => onMouseDown(e, type)}></div>;
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
