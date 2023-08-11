/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import useMessage from "../context/MessageContext";
import useAuth from "../context/AuthContext";
import useLang from "../context/LangContext";
import PropTypes from "prop-types";
import {
    QUERY_DOCUMENT_TYPE,
    REPORT_DOCUMENT_TYPE,
    MODAL_TITLE_SIZE} from "../utils/helper";


const DocumentSelectModal = (props) => {
    const {config} = props;
    const {authData} = useAuth();
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage, setMessageInfo} = useMessage();
    
    const getTitle = () => {
        switch(config.type) {
            case QUERY_DOCUMENT_TYPE:
                return getText("Select query document");
            case REPORT_DOCUMENT_TYPE:
                return getText("Select report document");
            default:
                return getText("Select document");
        }
    };
    
    const onHide = () => {
        config.hide();
    };
    

    return (
            <div className="static-modal">
                <Modal animation={false} 
                       show={config.show} 
                       onHide={onHide}
                       backdrop={true} 
                       keyboard={true}>
                    <Modal.Header closeButton>
                        <Modal.Title as={MODAL_TITLE_SIZE}>{getTitle()}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <div>test</div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </div>
            );
};

DocumentSelectModal.propTypes = {
    config: PropTypes.object.isRequired
};

export default DocumentSelectModal;
