import React, { useState } from 'react';
import useMessage from "../context/MessageContext";
import useReportDesign from "../context/ReportDesignContext";
import useLang from "../context/LangContext";
import {getUUID} from "../utils/helper"
import {BOLD_FONT_WEIGHT, STANDARD_FONT_WEIGHT} from "../utils/reportHelper"

const FontPanel = (props) => {
    const {getText} = useLang();
    const {currentReport, 
        reportSettings, 
        currentComponent, 
        setCurrentComponent, 
        getNewComponent} = useReportDesign();

    const onChange = (e) => {
        let c = {...currentComponent};
        switch (e.target.name) {
            case "font":
            case "size":
                c.fontSettings[e.target.name] = e.target.options[e.target.selectedIndex].value;
                break;
            case "bold":
            case "italic":
            case "underline":
                c.fontSettings[e.target.name] = e.target.checked;
                break;
        }
        
        setCurrentComponent(c);
    };
    
    const getFonts = () => {
        return reportSettings.defaultFonts.map(f => {
            if (currentComponent.fontSettings.font === f) {
                return <option style={{fontFamily: f}} value={f} selected>{f}</option>;
            } else {
                return <option style={{fontFamily: f}} value={f}>{f}</option>;
            }  
        });
    };
    
    const getFontSizes = () => {
        return reportSettings.defaultFontSizes.map(fs => {
            if (currentComponent.fontSettings.size == fs) {
                return <option value={fs} selected>{fs}</option>;
            } else {
                return <option value={fs}>{fs}</option>;
            }  
        });
    };

    const getExampleStyle = () => {
        return {
            fontFamily: currentComponent.fontSettings.font, 
            fontSize: currentComponent.fontSettings.size + "pt",
            fontWeight: currentComponent.fontSettings.bold ? BOLD_FONT_WEIGHT : STANDARD_FONT_WEIGHT,
            fontStyle: currentComponent.fontSettings.italic ? "italic" : "none",
            textDecoration: currentComponent.fontSettings.underline ? "underline" : "none"
        };
    };
    
    if (currentComponent && reportSettings) {
        return (<div className="entrygrid-100-150">
                <div className="label">{getText("Font:")}</div><div><select name="font" onChange={e => onChange(e)}>{getFonts()}</select></div>
                <div className="label">{getText("Size:")}</div><div><select name="size" onChange={e => onChange(e)}>{getFontSizes()}</select></div>
                <div></div><div><input key={getUUID()} name="bold" type="checkbox" checked={currentComponent.fontSettings.bold} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="bold">{getText("Bold")}</label></div>
                <div></div><div><input key={getUUID()} name="italic" type="checkbox" checked={currentComponent.fontSettings.italic} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="italic">{getText("Italic")}</label></div>
                <div></div><div><input key={getUUID()} name="underline" type="checkbox" checked={currentComponent.fontSettings.underline} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="underline">{getText("Underline")}</label></div>
                <div className="label">{getText("Example:")}</div><div style={getExampleStyle()}>Abc</div>
            </div>
             );
    } else {
        return "";
    }
};

export default FontPanel;
