import React, { useState } from 'react';
import useMessage from "../context/MessageContext";
import useLang from "../context/LangContext";
import ColorPicker from "./ColorPicker";
import useReportDesign from "../context/ReportDesignContext";
import {getUUID} from "../utils/helper";
import {
    haveAllBorders, 
    haveBorder, 
    getBorderStyleOptions, 
    getBorderWidthOptions} from "../utils/reportHelper";

const BorderPanel = (props) => {
   const {getText} = useLang();
    const {currentReport, 
        reportSettings, 
        currentComponent, 
        setCurrentComponent, 
        getNewComponent} = useReportDesign();

    const onChange = (e) => {
        let c = {...currentComponent};
        switch (e.target.name) {
            case "border":
            case "width":
                c.borderSettings[e.target.name] = e.target.options[e.target.selectedIndex].value;
                break;
            case "left":
            case "top":
            case "right":
            case "bottom":
            case "rounded":
                c.borderSettings[e.target.name] = e.target.checked;
                break;
        }
        
        setCurrentComponent(c);
    };
    
    const getExampleStyle = () => {
        let retval = {
            width: "50px", 
            height: "30px"
        };
        
        if (haveBorder(currentComponent.borderSettings)) {
            retval.width = "50px";
            retval.height = "30px";
            let bdef = currentComponent.borderSettings.border 
                + " " 
                + currentComponent.borderSettings.width 
                + "px " 
                + currentComponent.borderSettings.color;
            if (haveAllBorders(currentComponent.borderSettings)) {
               retval.border = bdef;
            } else {
                if (currentComponent.borderSettings.left) {
                    retval.borderLeft = bdef;
                }

                if (currentComponent.borderSettings.top) {
                    retval.borderTop = bdef;
                }

                if (currentComponent.borderSettings.rightt) {
                    retval.borderRightt = bdef;
                }

                if (currentComponent.borderSettings.bottom) {
                    retval.borderBottom = bdef;
                }
            }
                
            if (currentComponent.borderSettings.rounded) {
                retval.borderRadius = reportSettings.defaultBorderRadius;
            }
        }
        
        return retval;
    };
    
    const setColor = (color) => {
        let c = {...currentComponent};
        c.borderSettings.color = color;
        setCurrentComponent(c);
    };
        
    if (currentComponent) {
        return (<div className="entrygrid-100-150">
                <div className="label">{getText("Border:")}</div><div><select name="border" onChange={e => onChange(e)}>{getBorderStyleOptions(reportSettings, currentComponent.borderSettings)}</select></div>
                <div className="label">{getText("Width:")}</div><div><select name="width" onChange={e => onChange(e)}>{getBorderWidthOptions(reportSettings, currentComponent.borderSettings)}</select></div>
                <div className="label">{getText("Color:")}</div><div><ColorPicker color={currentComponent.borderSettings.color} setColor={setColor}/></div>
                <div></div><div><input key={getUUID()} name="left" type="checkbox" checked={currentComponent.borderSettings.left} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="left">{getText("Left")}</label></div>
                <div></div><div><input key={getUUID()} name="top" type="checkbox" checked={currentComponent.borderSettings.top} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="top">{getText("Top")}</label></div>
                <div></div><div><input key={getUUID()} name="right" type="checkbox" checked={currentComponent.borderSettings.right} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="right">{getText("Right")}</label></div>
                <div></div><div><input key={getUUID()} name="bottom" type="checkbox" checked={currentComponent.borderSettings.bottom} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="bottom">{getText("Bottom")}</label></div>
                <div></div><div><input key={getUUID()} name="rounded" type="checkbox" checked={currentComponent.borderSettings.rounded} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="rounded">{getText("Rounded")}</label></div>
                <div className="label">{getText("Example:")}</div><div style={getExampleStyle()}></div>
            </div>
             );
    } else {
        return "";
    }
};

export default BorderPanel;
