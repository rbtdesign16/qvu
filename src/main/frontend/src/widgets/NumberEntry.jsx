import React from "react";
import PropTypes from "prop-types";
import {isAllowedNumericKey, isNumericEntry, isDigit} from "../utils/helper";

const NumberEntry = (props) => {
    const {name, onChange, defaultValue, min, max, id, handleArrowUp, handleArrowDown} = props;

    const onKey = (e) => {
        let ok = isAllowedNumericKey(e);
        if (!ok) {
            e.preventDefault();
        } else if (e.code.toLowerCase() === "arrowup") {
            let val = Number(e.target.value);
            if (!max || (max && (val < max))) {
                e.target.value = val + 1;
                e.preventDefault();
                if (handleArrowUp) {
                    handleArrowUp(e);
                }
            }
        } else if (e.code.toLowerCase() === "arrowdown") {
            let val = Number(e.target.value);
            if (!min || (min && (val > min))) {
                e.target.value = val - 1;
                e.preventDefault();
                if (handleArrowDown) {
                    handleArrowDown(e);
                }
            }
        } else if (isNumericEntry(e)) {
            let pos = e.target.selectionStart;
            let code = "";
            if (isDigit(e)) {
                code = e.key;
            } else if (e.code.toLowerCase() === "minus") {
                code = "-";
            } else if (e.code.toLowerCase() === "period") {
                code = ".";
            }

            if (code) {
                let val = e.target.value;
                if (val) {
                    val = Number(val.substring(0, pos) + code + val.substring(pos));
                    if (min && max) {
                        if ((val < min) || (val > max)) {
                            e.preventDefault();
                        } else if (min) {
                            if (val < min) {
                                e.preventDefault();
                            }
                        } else if (max) {
                            if (val > max) {
                                e.preventDefault();
                            }
                        }
                    }
                }
            }
        }
    };

    return (
            <span>
                <input id={id ? id : "ne"} type="text" min={min} max={max} 
                       name={name} style={{width: "90px"}} onKeyDown={e => onKey(e)} 
                       onBlur={e => onChange(e)} defaultValue={defaultValue}/>
            </span>
            );
};

NumberEntry.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

export default NumberEntry;
