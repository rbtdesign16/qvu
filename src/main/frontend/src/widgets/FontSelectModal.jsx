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
        AVAILABLE_FONTS.map(f => {
            if (config.component.font === f) {
                return <option style={{font: f, fontSize: fs}} value={f} selected>{f}</option>;
            } else {
                return <option style={{font: f, fontSize: fs}} value="{f}">{f}</option>;
            }  
        });
    };
    
    const getFontSizes = () => {
        return FONT_SIZES.map(fs => {
            if (config.component.font === f) {
                return <option value={fs} selected>{fs}</option>;
            } else {
                return <option value={fs}>{fs}</option>;
            }  
        });
    };

    
    const onShow = () => {
        if (config.component) {
            document.getElementByName("fontBold")[0].checked = config.component.fontBold;
            document.getElementById("fontItalix")[0].checked = config.component.fontItalic;
            document.getElementById("fontUnderline")[0].checked = config.component.fontUnderline;
            document.getElementById("fontColor")[0].value = config.component.fontColor;
        }
    };
    
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
                            <div className="label">{getText("Size:")}</div><div><select name="fontSize" onChange={e => onChange(e)}>{getFontSizes()}</select></div>
                            <div className="label">{getText("Color:")}</div><div><input name="fontColor" type="color" onChange={e => onChange(e)} /></div>
                            <div></div><div><input name="fontBold" type="checkbox" onChange={e => onChange(e)} /><label className="ck-label" htmlFor="bold">{getText("Bold")}</label></div>
                            <div></div><div><input name="fontItalic" type="checkbox" onChange={e => onChange(e)} /><label className="ck-label" htmlFor="italic">{getText("Italic")}</label></div>
                            <div></div><div><input name="fontUnderline" type="checkbox" onChange={e => onChange(e)} /><label className="ck-label" htmlFor="underline">{getText("Underline")}</label></div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                        <Button size="sm" variant="primary" disabled={!canSave()}  type="submit" onClick={() => config.saveFont()}>{getText("Save")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            );
};

FontSelectModal.propTypes = {
    config: PropTypes.object.isRequired,
};

export default FontSelectModal;
