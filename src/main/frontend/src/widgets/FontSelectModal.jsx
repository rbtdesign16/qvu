import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import useMessage from "../context/MessageContext";
import useLang from "../context/LangContext";
import FontPanel from "./FontPanel";
import useReportDesign from "../context/ReportDesignContext";
import PropTypes from "prop-types";
import {MODAL_TITLE_SIZE, REPORT_SECTION_BODY} from "../utils/helper";


const FontSelectModal = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const {
        currentComponent,
        setCurrentComponent,
        getNewComponent
    } = useReportDesign();
    
    const getTitle = () => {
        return getText("Font Select");
    };
    
    const onHide = () => {
        config.hide();
    };
    
    const onShow = () => {
        setCurrentComponent(getNewComponent(REPORT_SECTION_BODY, "text"));
    };
    
    if (config) {
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
                        <FontPanel />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                        <Button size="sm" variant="primary" type="submit" onClick={() => config.save({...currentComponent.fontSettings})}>{getText("Save")}</Button>
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
