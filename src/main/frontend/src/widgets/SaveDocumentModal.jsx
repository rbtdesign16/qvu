import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import useMessage from "../context/MessageContext";
import useAuth from "../context/AuthContext";
import useLang from "../context/LangContext";
import useDataHandler from "../context/DataHandlerContext";
import TextEntry from "./TextEntry";
import PropTypes from "prop-types";
import {
    replaceTokens, 
    DEFAULT_NEW_DOCUMENT_NAME, 
    DEFAULT_DOCUMENT_GROUP, 
    MODAL_TITLE_SIZE,
    isValidFilenameKey,
    isNotEmpty} from "../utils/helper";


const SaveDocumentModal = (props) => {
    const {config} = props;
    const {authData} = useAuth();
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage, setMessageInfo} = useMessage();
    const {datasources, documentGroups} = useDataHandler();
    const [documentName, setDocumentName] = useState(getText(DEFAULT_NEW_DOCUMENT_NAME));
    const [groupName, setGroupName] = useState(DEFAULT_DOCUMENT_GROUP);
    
    const getTitle = () => {
        return replaceTokens(getText("Save Document"), [config.type]);
    };
    
    const onHide = () => {
        config.hide();
    };
    
    const loadDocumentGroups = (e) => {
        return documentGroups.map(g => {
            if (groupName === g.name) {
                return <option value={g.name} selected>{g.name}</option>;
            } else {
                return <option value={g.name}>{g.name}</option>;
            }
        });
    };
    
    const isValidNameKey = (e) => {
      if (!isValidFilenameKey(e)) {
          e.preventDefault(e);
      }   
    };
    
    const canSave = () => {
        return isNotEmpty(documentName) && isNotEmpty(groupName);
    };
    
    const onShow = () => {
        let el = document.getElementById("docname");
        if (el) {
            el.value = config.currentDocument.name;
        }
        
        if (config.currentDocument && config.currentDocument.name) {
            setDocumentName(config.currentDocument.name);
        }
        
        if (config.currentDocument && config.currentDocument.group) {
            setGroupName(config.currentDocument.group);
        }
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
                        <div className="entrygrid-100-150">
                            <div className="label">{getText("Name:")}</div><div><TextEntry id="docname" checkKey={isValidNameKey} defaultValue={documentName} onChange={e => setDocumentName(e.target.value)}/></div>
                            <div className="label">{getText("Group:")}</div><div><select onChange={e => setGroupName(e.target.value)}>{ loadDocumentGroups()}</select></div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
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
