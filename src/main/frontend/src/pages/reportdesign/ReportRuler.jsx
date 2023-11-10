import React, {useEffect, useRef} from "react";
import PropTypes from "prop-types";
import {
HORIZONTAL_KEY,
        VERTICAL_KEY,
        REPORT_UNITS_MM,
        PIXELS_PER_MM,
        PIXELS_PER_INCH
        } from "../../utils/helper";

const ReportRuler = (props) => {
    const {report, height, width, type} = props;


    const drawRuler = () => {
        let retval = [];
        let unitLength;
        let className;
        if (report.pageUnits === REPORT_UNITS_MM) {
            let inc = PIXELS_PER_MM * 5;
            let curpos = inc;
            unitLength = ["15px", "5px"];

            if (type === HORIZONTAL_KEY) {
                do {
                    retval.push(curpos + "px");
                    curpos += inc;
                } while (curpos < width);

                className = "hrule-unit";
            } else {
                do {
                    retval.push(curpos + "px");
                    curpos += inc;
                } while (curpos < height);

                className = "vrule-unit";
            }
        } else {
            let inc = Number(PIXELS_PER_INCH / 4);
            unitLength = ["15px", "5px", "10px", "5px"];
            let curpos = inc;

            if (type === HORIZONTAL_KEY) {
                do {
                    retval.push(curpos + "px");
                    curpos += inc;
                } while (curpos < width);

                className = "hrule-unit";
            } else {
                do {
                    retval.push(curpos + "px");
                    curpos += inc;
                } while (curpos < height);
                className = "vrule-unit";
            }
        }

        if (retval.length > 0) {
            let num = 1;
            return retval.map((p, indx) => {
                let lpos = ((indx + 1) % unitLength.length);

                if (lpos === 0) {
                    if (type === HORIZONTAL_KEY) {
                        return <div className={className} style={{left: p, height: unitLength[lpos]}}></div>;
                    } else {
                        return <div className={className} style={{top: p, width: unitLength[lpos]}}></div>;
                    }
                } else {
                    if (type === HORIZONTAL_KEY) {
                        return <div className={className} style={{left: p, height: unitLength[lpos]}}></div>;
                    } else {
                        return <div className={className} style={{top: p, width: unitLength[lpos]}}></div>;
                    }
                }
            });
        } else {
            return "";
        }
    };

    const buildRuler = () => {
        let myStyle = {
            height: height + "px",
            width: width + "px"
        };

        if (type === VERTICAL_KEY) {
            myStyle.left = 0;
        } else {
            myStyle.top = 0;
            myStyle.marginLeft = height + "px";
        }

        return <div style={myStyle} className="ruler">{drawRuler()}</div>;
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