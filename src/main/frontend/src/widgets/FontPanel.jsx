import React, { useState } from 'react';
import useMessage from "../context/MessageContext";
import useLang from "../context/LangContext";
import PropTypes from "prop-types";


const FontPanel = (props) => {
    const {reportSettings, fontSettings} = props;
    const {getText} = useLang();
    const defaultStyle = getComputedStyle(document.documentElement);

    const onChange = (e) => {
        switch (e.target.name) {
            case "font":
            case "size":
                fontSettings[e.target.name] = e.target.options[e.target.selectedIndex].value;
                break;
            case "bold":
            case "italic":
            case "underline":
                fontSettings[e.target.name] = e.target.checked;
                break;
        }
    };
    
    const getFonts = () => {
        let fs = defaultStyle.getPropertyValue('--default-title-font-size');
            reportSettings.defaultFonts.map(f => {
            if (fontSettings.font === f) {
                return <option style={{font: f, fontSize: fs}} value={f} selected>{f}</option>;
            } else {
                return <option style={{font: f, fontSize: fs}} value={f}>{f}</option>;
            }  
        });
    };
    
    const getFontSizes = () => {
        return reportSettings.defaultFontSizes.map(fs => {
            if (fontSettings.size === fs) {
                return <option value={fs} selected>{fs}</option>;
            } else {
                return <option value={fs}>{fs}</option>;
            }  
        });
    };

    
    if (fontSettings && reportSettings) {
        return (<div className="entrygrid-100-150">
                <div className="label">{getText("Font:")}</div><div><select name="font" onChange={e => onChange(e)}>{getFonts()}</select></div>
                <div className="label">{getText("Size:")}</div><div><select name="size" onChange={e => onChange(e)}>{getFontSizes()}</select></div>
                <div></div><div><input name="bold" type="checkbox" defaultChecked={fontSettings.bold} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="bold">{getText("Bold")}</label></div>
                <div></div><div><input name="italic" type="checkbox" defaultChecked={fontSettings.italic} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="italic">{getText("Italic")}</label></div>
                <div></div><div><input name="underline" type="checkbox" defaultChecked={fontSettings.underline} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="underline">{getText("Underline")}</label></div>
            </div>
             );
    } else {
        return "";
    }
};

FontPanel.propTypes = {
    fontSettings: PropTypes.object.isRequired,
    reportSettings: PropTypes.object.isRequired
    
};

export default FontPanel;
