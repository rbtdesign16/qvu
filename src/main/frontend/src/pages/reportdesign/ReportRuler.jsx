import React, {useEffect} from "react";
import PropTypes from "prop-types";
import {
    getDigitsCount
} from "../../utils/helper";

import {
    HORIZONTAL_KEY,
    VERTICAL_KEY,
    REPORT_UNITS_MM,
    PIXELS_PER_MM,
    PIXELS_PER_INCH,
    PIXELS_PER_POINT,
    RULER_WIDTH,
    RULER_FONT_SIZE,
} from "../../utils/reportHelper";
const ReportRuler = (props) => {
    const {report, height, width, type} = props;

    const getNumberOffset = (num) => {
        let retval = 0;
        if (type === VERTICAL_KEY) {
            retval = (PIXELS_PER_POINT * RULER_FONT_SIZE) / 2;
        } else {
            let digits = getDigitsCount(num);
            retval = (digits / 2) * (PIXELS_PER_POINT * (RULER_FONT_SIZE / 2));
        }
        
        return Math.floor(retval);
    };

    const getUnitNumber = (pos, len, num) => {
        let numOffset = getNumberOffset(num);
        let digits = getDigitsCount(num);
        let fontHeight = PIXELS_PER_POINT * RULER_FONT_SIZE;
        if (type === HORIZONTAL_KEY) {
            let myStyle = {
                position: "absolute",
                height: fontHeight + "px", 
                width: numOffset + "px", 
                left: (pos - numOffset) + "px", 
                top: 0
            };
            return <div style={myStyle}>{num}</div>;
         } else {
             let myStyle = {
                position: "absolute",
                width: (digits * ((RULER_FONT_SIZE * PIXELS_PER_POINT) / 2)) + "px", 
                height: fontHeight + "px", 
                left: "2px", 
                top: (pos - (numOffset + 2)) + "px" 
            };

            return <div style={myStyle}>{num}</div>;
        }
    };

    const drawRuler = () => {
        let retval = [];
        let pos = [];
        let unitLength;
        let className;
        if (report.pageUnits === REPORT_UNITS_MM) {
            let inc = PIXELS_PER_MM * 5;
            let curpos = inc;
            unitLength = [Math.floor(((RULER_WIDTH / 2) - 1)) + "px", (RULER_WIDTH / 5) + "px"];

            if (type === HORIZONTAL_KEY) {
                do {
                    pos.push(curpos);
                    curpos += inc;
                } while (curpos < width);

                className = "hrule-unit";
            } else {
                do {
                    pos.push(curpos);
                    curpos += inc;
                } while (curpos < height);

                className = "vrule-unit";
            }
        } else {
            let inc = Number(PIXELS_PER_INCH / 4);
            unitLength = [Math.floor(((RULER_WIDTH / 2) - 1)) + "px", (RULER_WIDTH / 5) + "px", (RULER_WIDTH / 3) + "px", (RULER_WIDTH / 5) + "px"];
            let curpos = inc;

            if (type === HORIZONTAL_KEY) {
                do {
                    pos.push(curpos);
                    curpos += inc;
                } while (curpos < width);

                className = "hrule-unit";
            } else {
                do {
                    pos.push(curpos);
                    curpos += inc;
                } while (curpos < height);
                
                className = "vrule-unit";
            }
        }

        if (pos.length > 0) {
            let num = 1;
            for (let i = 0; i < pos.length; ++i) {
                let lpos = ((i+ 1) % unitLength.length);
                if (lpos === 0) {
                    retval.push(getUnitNumber(pos[i], unitLength[lpos], num++));
                }   
                if (type === HORIZONTAL_KEY) {
                    retval.push(<div className={className} style={{left: pos[i], height: unitLength[lpos]}}></div>);
                } else {
                    retval.push(<div className={className} style={{top: pos[i], width: unitLength[lpos]}}></div>);
                }
            }
            
            return retval.map(c => c);
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