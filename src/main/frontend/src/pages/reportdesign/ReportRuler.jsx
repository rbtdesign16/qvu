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
    
 
    const drawUnits = () => {
        let retval = [];
        if (report.pageUnits === REPORT_UNITS_MM) {
            let inc = PIXELS_PER_MM * 5;
            let curpos = inc ;
        } else {
            let inc = Number(PIXELS_PER_INCH / 4);
            
            if (type === HORIZONTAL_KEY) {
                let curpos = inc;
                do {
                    retval.push(curpos + "px");
                    curpos += inc;
                } while (curpos < width);
            } else {
                
            }
        }
        
        if (retval.length > 0) {
            return retval.map((p, indx) => {
                let h;
                switch (indx % 4) {
                    case 0:
                        h = "15px";
                        break;
                    case 1:
                    case 3:
                        h = "5px";
                        break;
                    case 2:
                        h = "10px";
                        break;
                }
                return <span className="ruler-hunit" style={{left: p, height: h}}></span>;
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
        
        return <div style={myStyle} className="ruler"></div>;
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