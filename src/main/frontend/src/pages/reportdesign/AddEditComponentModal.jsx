import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import useLang from "../../context/LangContext";
import { Tabs, Tab } from "react-bootstrap";
import NumberEntry from "../../widgets/NumberEntry";
import BorderPanel from "../../widgets/BorderPanel";
import FontPanel from "../../widgets/FontPanel";
import PropTypes from "prop-types";
import ColorPicker from "../../widgets/ColorPicker"
import useReportDesign from "../../context/ReportDesignContext";
import {MODAL_TITLE_SIZE, 
    pixelsToReportUnits, 
    copyObject,
    TEXT_ALIGN_OPTIONS,
    getComponentTypeDisplayText} from "../../utils/helper";

const AddEditComponentModal = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const [typeDisplay, setTypeDisplay] = useState("");
    const {currentReport, 
        reportSettings, 
        currentComponent, 
        setCurrentComponent, 
        getNewComponent} = useReportDesign();
    
    const settings = {
        fontSettings: {},
        borderSettings: {}
    };
    
    const getTitle = () => {
        if (currentComponent) {
            if (config.edit) {
                return getText("Edit " + typeDisplay + " Component");
            } else {
                return getText("Add " + typeDisplay + " Component");
            }
        } else {
            return "";
        }
    };

    const onHide = () => {
        config.hide();
    };

    const onShow = () => {
        setTypeDisplay(getText(getComponentTypeDisplayText(currentComponent.type)));
    };

    const setForegroundColor = (color) => {
        let c = {...currentComponent};
        c.foregroundColor = color;
        setComponent(c);
    };


    const setBackgroundColor = (color) => {
        let c = {...currentComponent};
        c.backgroundColor = color;
        setComponent(c);
    };

    const setValue = (e) => {
        let c = {...currentComponent};
        c.value = e.target.value;
        setComponent(c);
     };

    const loadTextAlignOptions = () => {
         return TEXT_ALIGN_OPTIONS.map(ta => {
             if (ta === currentComponent.align) {
                 return <option value={ta} selected>{getText(ta)}</option>;
             } else {
                 return <option value={ta}>{getText(ta)}</option>;
             }
         });
    };

    const setTextAlign = (e) => {
        let c = {...currentComponent};
        c.align = e.target.options[e.target.selectedIndex].value;
        setComponent(c);
    };
    
    const getTextEntry = () => {
        return <div className="entrygrid-100-150">
            <div className="label">{getText("Text:")}</div>
            <div><textarea cols={40} rows={2} onChange={e => setValue(e)} value={currentComponent.value}/></div>
            <div className="label">{getText("Text Align:")}</div><div><select onChange={e => setTextAlign(e)}>{loadTextAlignOptions()}</select></div>
            <div className="label">{getText("Foreground:")}</div><div><ColorPicker color={currentComponent.foregroundColor} setColor={setForegroundColor}/></div>
            <div className="label">{getText("Background:")}</div><div><ColorPicker color={currentComponent.backgroundColor} setColor={setBackgroundColor}/></div>
        </div>;
    };
    
    const getComponentPanel = () => {
        if (currentComponent) {
            switch (currentComponent.type) {
                case "text":
                    return getTextEntry();
            }
        }
    };
    
    const getTabs = () => {
        if (currentComponent) {
                return <Tabs id="t1" className="mb-3">
                <Tab eventKey="detail" title={typeDisplay + " " + getText("Detail")}>
                    {getComponentPanel()}
                </Tab>
                <Tab eventKey="font" title={getText("Font")}>
                    <FontPanel />
                </Tab>
                <Tab eventKey="border" title={getText("Border")}>
                    <BorderPanel />
                </Tab>
            </Tabs>;
        } else {
            return "";
        }
    };
    
    const saveComponent = () => {
        config.saveComponent(currentComponent, config.componentIndex);
    };
    
    return (
        <div className="static-modal">
            <Modal animation={false} 
                   show={config.show} 
                   onShow={onShow}
                   onHide={onHide}
                   backdrop={true} 
                   keyboard={true}>
                <Modal.Header closeButton>
                    <Modal.Title as={MODAL_TITLE_SIZE}>{getTitle()}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        {getTabs()}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                    <Button size="sm" variant="primary" type="submit" onClick={() => saveComponent()}>{getText("Save")}</Button>
                </Modal.Footer>
            </Modal>
        </div>
        );
};

AddEditComponentModal.propTypes = {
    config: PropTypes.object.isRequired
};

export default AddEditComponentModal;
