import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import useMessage from "../context/MessageContext";
import useLang from "../context/LangContext";
import BorderPanel from "./BorderPanel";
import PropTypes from "prop-types";
import {MODAL_TITLE_SIZE} from "../utils/helper";


const BorderSelectModal = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const defaultStyle = getComputedStyle(document.documentElement);
    
    const getTitle = () => {
        return getText("Border Select");
    };
    
    const onHide = () => {
        config.hide();
    };
    
    if (config && config.reportSettings) {
        return (
            <div className="static-modal">
                <Modal 
                    animation={false} 
                    size="sm"
                    show={config.show} 
                    onHide={onHide}
                    backdrop={true} 
                    keyboard={true}>
                    <Modal.Header closeButton>
                        <Modal.Title as={MODAL_TITLE_SIZE}>{getTitle()}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <BorderPanel borderSettings={config.borderSettings} reportSettings={config.reportSettings}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                        <Button size="sm" variant="primary" type="submit" onClick={() => config.save(config.borderSettings)}>{getText("Save")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            );
    } else {
        return "";
    }
};

BorderSelectModal.propTypes = {
    config: PropTypes.object.isRequired
};

export default BorderSelectModal;
