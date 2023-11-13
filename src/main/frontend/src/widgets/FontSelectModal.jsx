import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import useMessage from "../context/MessageContext";
import useLang from "../context/LangContext";
import PropTypes from "prop-types";
import {MODAL_TITLE_SIZE, AVAILABLE_FONTS, FONT_SIZES} from "../utils/helper";


const FontSelectModal = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const defaultStyle = getComputedStyle(document.documentElement);

    
    const getTitle = () => {
        return getText("Font Select");
    };
    
    const onHide = () => {
        config.hide();
    };
    
    const onChange = (e) => {
        
    };
    
    const getFonts = () => {
        let fs = defaultStyle.getPropertyValue('--default-title-font-size');
            config.reportSettings.defaultFonts.map(f => {
            if (config.component.font === f) {
                return <option style={{font: f, fontSize: fs}} value={f} selected>{f}</option>;
            } else {
                return <option style={{font: f, fontSize: fs}} value="{f}">{f}</option>;
            }  
        });
    };
    
    const getFontSizes = () => {
        return config.reportSettings.defaultFontSizes.map(fs => {
            if (config.component.fontSize === fs) {
                return <option value={fs} selected>{fs}</option>;
            } else {
                return <option value={fs}>{fs}</option>;
            }  
        });
    };

    
    const onShow = () => {
        if (config.component) {
            document.getElementByName("bold")[0].checked = config.fontSettings.font;
            document.getElementById("italic")[0].checked = config.fontSettings.italic;
            document.getElementById("underline")[0].checked = config.fontSettings.underline;
            document.getElementById("color")[0].value = config.fontSettings.color;
        }
    };
    
    if (config && config.reportSettings) {
        return (
            <div className="static-modal">
                <Modal 
                    animation={false} 
                    size="sm"
                    show={config.show} 
                    onHide={onHide}
                    onShow={onShow}
                    backdrop={true} 
                    keyboard={true}>
                    <Modal.Header closeButton>
                        <Modal.Title as={MODAL_TITLE_SIZE}>{getTitle()}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="entrygrid-100-150">
                            <div className="label">{getText("Font:")}</div><div><select name="font" onChange={e => onChange(e)}>{getFonts()}</select></div>
                            <div className="label">{getText("Size:")}</div><div><select name="size" onChange={e => onChange(e)}>{getFontSizes()}</select></div>
                            <div></div><div><input name="bold" type="checkbox" onChange={e => onChange(e)} /><label className="ck-label" htmlFor="bold">{getText("Bold")}</label></div>
                            <div></div><div><input name="italic" type="checkbox" onChange={e => onChange(e)} /><label className="ck-label" htmlFor="italic">{getText("Italic")}</label></div>
                            <div></div><div><input name="underline" type="checkbox" onChange={e => onChange(e)} /><label className="ck-label" htmlFor="underline">{getText("Underline")}</label></div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                        <Button size="sm" variant="primary" disabled={!canSave()}  type="submit" onClick={() => config.saveFont()}>{getText("Save")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            );
    } else {
        return "";
    }
};

FontSelectModal.propTypes = {
    config: PropTypes.object.isRequired
};

export default FontSelectModal;
