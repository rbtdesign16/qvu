import React, { useState } from 'react';
import useMessage from "../context/MessageContext";
import useReportDesign from "../context/ReportDesignContext";
import useLang from "../context/LangContext";
import ColorPicker from "./ColorPicker";
import PropTypes from "prop-types";
import {
getUUID,
        NONE_SETTING,
        ITALIC_SETTING,
        UNDERLINE_SETTING} from "../utils/helper"
import {BOLD_FONT_WEIGHT, STANDARD_FONT_WEIGHT} from "../utils/reportHelper"

const FontPanel = (props) => {
    const {name} = props;
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
                c[name][e.target.name] = e.target.options[e.target.selectedIndex].value;
                break;
            case "bold":
            case ITALIC_SETTING:
            case UNDERLINE_SETTING:
                c[name][e.target.name] = e.target.checked;
                break;
        }

        setCurrentComponent(c);
    };

    const getFonts = () => {
        return reportSettings.defaultFonts.map(f => {
            if (currentComponent[name].font === f) {
                return <option style={{fontFamily: f}} value={f} selected>{f}</option>;
            } else {
                return <option style={{fontFamily: f}} value={f}>{f}</option>;
            }
        });
    };

    const getFontSizes = () => {
        return reportSettings.defaultFontSizes.map(fs => {
            if (currentComponent[name].size == fs) {
                return <option value={fs} selected>{fs}</option>;
            } else {
                return <option value={fs}>{fs}</option>;
            }
        });
    };

    const getExampleStyle = () => {
        return {
            fontFamily: currentComponent[name].font,
            fontSize: currentComponent[name].size + "pt",
            fontWeight: currentComponent[name].bold ? BOLD_FONT_WEIGHT : STANDARD_FONT_WEIGHT,
            fontStyle: currentComponent[name].italic ? ITALIC_SETTING : NONE_SETTING,
            textDecoration: currentComponent[name].underline ? UNDERLINE_SETTING : NONE_SETTING,
            color: currentComponent[name].color,
            backgroundColor: currentComponent[name].backgroundColor
            
        };
    };

    const setForegroundColor = (color) => {
        let c = {...currentComponent};
        c[name].color = color;
        setCurrentComponent(c);
    };

    const setBackgroundColor = (color) => {
       let c = {...currentComponent};
        c[name].backgroundColor = color;
        setCurrentComponent(c);
    };

    if (currentComponent && reportSettings) {
             return (<div className="entrygrid-125-150">
                <div className="label">{getText("Font:")}</div><div><select name="font" onChange={e => onChange(e)}>{getFonts()}</select></div>
                <div className="label">{getText("Size:")}</div><div><select name="size" onChange={e => onChange(e)}>{getFontSizes()}</select></div>
                <div className="label">{getText("Foreground:")}</div><ColorPicker name="color" color={currentComponent[name].color} setColor={setForegroundColor}/>
                <div className="label">{getText("Background:")}</div><ColorPicker name="backgroundColor" color={currentComponent[name].backgroundColor} setColor={setBackgroundColor}/>
                <div></div><div><input key={getUUID()} name="bold" type="checkbox" checked={currentComponent[name].bold} onChange={e => onChange(e)} /><label className="ck-label" htmlFor="bold">{getText("Bold")}</label></div>
                <div></div><div><input key={getUUID()} name={ITALIC_SETTING} type="checkbox" checked={currentComponent[name].italic} onChange={e => onChange(e)} /><label className="ck-label" htmlFor={ITALIC_SETTING}>{getText("Italic")}</label></div>
                <div></div><div><input key={getUUID()} name={UNDERLINE_SETTING} type="checkbox" checked={currentComponent[name].underline} onChange={e => onChange(e)} /><label className="ck-label" htmlFor={UNDERLINE_SETTING}>{getText("Underline")}</label></div>
                <div className="label">{getText("Example:")}</div><div style={getExampleStyle()}>Abc</div>
            </div>);
    } else {
        return "";
    }
};

FontPanel.propTypes = {
    name: PropTypes.string.isRequired
};

export default FontPanel;
