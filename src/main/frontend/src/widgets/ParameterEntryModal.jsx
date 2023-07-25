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
import useQueryDesign from "../context/QueryDesignContext";
import useDataHandler from "../context/DataHandlerContext";
import TextEntry from "./TextEntry";
import PropTypes from "prop-types";
import {
    replaceTokens, 
    DEFAULT_DOCUMENT_GROUP, 
    MODAL_TITLE_SIZE,
    isValidFilenameKey,
    isNotEmpty} from "../utils/helper";


const ParameterEntryModal = (props) => {
    const {config} = props;
    const {filterColumns} = useQueryDesign();
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage, setMessageInfo} = useMessage();
    
    const getTitle = () => {
        return replaceTokens(getText("Save Document"), [config.type]);
    };
    
    const onHide = () => {
        config.hide();
    };
    
    const canRun = () => {
        return isNotEmpty(documentName) && isNotEmpty(groupName);
    };

    const getParamterInputFields = () =>
        return <div className="entrygrid-100-150">
            return { getInputFields()}
                            <div className="label">{getText("Name:")}</div><div><TextEntry checkKey={isValidNameKey} onChange={e => setDocumentName(e.target.value)}/></div>
                            <div className="label">{getText("Group:")}</div><div><select onChange={e => setGroup(e)}>{ loadDocumentGroups()}</select></div>
        </div>

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
                        <div className="entrygrid-100-150">
                            { getParameterInputFields()}
                            <div className="label">{getText("Name:")}</div><div><TextEntry checkKey={isValidNameKey} onChange={e => setDocumentName(e.target.value)}/></div>
                            <div className="label">{getText("Group:")}</div><div><select onChange={e => setGroup(e)}>{ loadDocumentGroups()}</select></div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => onHide() }>Cancel</Button>
                        <Button size="sm" variant="primary" disabled={!canSave()}  type="submit" onClick={() => config.saveDocument(documentName, groupName)}>{getText("Save")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            );
};

SaveDocumentModal.propTypes = {
    config: PropTypes.object.isRequired,
};

export default SaveDocumentModal;
