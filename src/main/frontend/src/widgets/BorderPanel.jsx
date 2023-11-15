import React, { useState } from 'react';
import useMessage from "../context/MessageContext";
import useLang from "../context/LangContext";
import PropTypes from "prop-types";

const BorderPanel = (props) => {
    const {reportSettings, borderSettings} = props;
    const [toggle, setToggle] = useState(false);
    const {getText} = useLang();

    const onChange = (e) => {
        switch (e.target.name) {
            case "border":
            case "width":
                borderSettings[e.target.name] = e.target.options[e.target.selectedIndex].value;
                break;
            case "left":
            case "top":
            case "right":
            case "bottom":
            case "rounded":
                borderSettings[e.target.name] = e.target.checked;
                break;
            case "color":
                borderSettings[e.target.name] = e.target.value;
                break;
                
        }
        
        setToggle(!toggle);
    };
    
    const getBorderStyles = () => {
        return reportSettings.borderStyles.map(b => {
            if (borderSettings.border === b) {
                return <option value={b} selected>{b}</option>;
            } else {
                return <option value={b}>{b}</option>;
            }  
        });
    };
    
    const getBorderSizes = () => {
        return reportSettings.borderWidths.map(w => {
            if (borderSettings.width === w) {
                return <option value={w} selected>{w}</option>;
            } else {
                return <option value={w}>{w}</option>;
            }  
        });
    };

    const haveAllBorders = () => {
        return (borderSettings.left && borderSettings.top && borderSettings.right && borderSettings.bottom);
    };
        
    const haveBorder = () => {
        return (borderSettings.left ||  borderSettings.top && borderSettings.right || borderSettings.bottom);
    };
        
    const getExampleStyle = () => {
        let retval = {
            width: "50px", 
            height: "30px"
        };
        
        if (haveBorder()) {
            retval.width = "50px";
            retval.height = "30px";
            let bdef = borderSettings.border + " " + borderSettings.width + "px " + borderSettings.color;
            if (haveAllBorders()) {
               retval.border = bdef;
            } else {
                if (borderSettings.left) {
                    retval.borderLeft = bdef;
                }

                if (borderSettings.top) {
                    retval.borderTop = bdef;
                }

                if (borderSettings.rightt) {
                    retval.borderRightt = bdef;
                }

                if (borderSettings.bottom) {
                    retval.borderBottom = bdef;
                }
            }
                
            if (borderSettings.rounded) {
                retval.borderRadius = reportSettings.defaultBorderRadius;
            }
        }
        
        return retval;
    };
    
    if (borderSettings && reportSettings) {
        return (<div className="entrygrid-100-150">
                <div className="label">{getText("Border:")}</div><div><select name="border" onChange={e => onChange(e)}>{getBorderStyles()}</select></div>
                <div className="label">{getText("Width:")}</div><div><select name="width" onChange={e => onChange(e)}>{getBorderSizes()}</select></div>
                <div className="label">{getText("Color:")}</div><div><input name="color" type="color" onChange={e => onChange(e)} defaultValue={borderSettings.color}/></div>
                <div></div><div><input name="left" type="checkbox" defaultChecked={borderSettings.left} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="left">{getText("Left")}</label></div>
                <div></div><div><input name="top" type="checkbox" defaultChecked={borderSettings.top} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="top">{getText("Top")}</label></div>
                <div></div><div><input name="right" type="checkbox" defaultChecked={borderSettings.right} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="right">{getText("Right")}</label></div>
                <div></div><div><input name="bottom" type="checkbox" defaultChecked={borderSettings.bottom} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="bottom">{getText("Bottom")}</label></div>
                <div></div><div><input name="rounded" type="checkbox" defaultChecked={borderSettings.rounded} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="rounded">{getText("Rounded")}</label></div>
                <div className="label">{getText("Example:")}</div><div style={getExampleStyle()}></div>
            </div>
             );
    } else {
        return "";
    }
};

BorderPanel.propTypes = {
    borderSettings: PropTypes.object.isRequired,
    reportSettings: PropTypes.object.isRequired
    
};

export default BorderPanel;
