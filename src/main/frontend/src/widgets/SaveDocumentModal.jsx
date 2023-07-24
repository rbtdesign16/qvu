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
    isAlphanumeric} from "../utils/helper";


const SaveDocumentModal = (props) => {
    const {config} = props;
    const {authData} = useAuth();
    const {setTreeViewData, treeViewData, setDatasource, datasource, selectColumns, filterColumns, baseTable, fromClause} = useQueryDesign();
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage, setMessageInfo} = useMessage();
    const {datasources, documentGroups} = useDataHandler();
    const [documentName, setDocumentName] = useState(null);
    const [groupName, setGroupName] = useState(DEFAULT_DOCUMENT_GROUP);
    
    const getTitle = () => {
        return replaceTokens(getText("Save Document"), [config.type]);
    };
    
    const onHide = () => {
        config.hide();
    }
    
    const loadDocumentGroups = (e) => {
        return documentGroups.map(g => {
            if (groupName === g.name) {
                return <option value={g.name} selected>{g.name}</option>;
            } else {
                return <option value={g.name}>{g.name}</option>;
            }
        });
    };
    
    const setName = (e) => {
        setDocumentName(e.targe.value);
    };
    
    const isValidNameKey = (e) => {
      if (!isAlphanumeric(e.key) || (e.key === "-")) {
          e.preventDefault(e);
      }   
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
                        <div className="entrygrid-100-150">
                            <div className="label">{getText("Name:")}</div><div><TextEntry checkKey={isValidNameKey} onChange={setName} onBlur={e => setDocumentName(e.target.value)}/></div>
                            <div className="label">{getText("Group:")}</div><div><select onChange={e => setGroup(e)}>{ loadDocumentGroups()}</select></div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => onHide() }>Cancel</Button>
                        <Button size="sm" variant="primary" type="submit" onClick={() => config.saveDocument(documentName, groupName)}>{getText("Save")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            );
};

SaveDocumentModal.propTypes = {
    config: PropTypes.object.isRequired,
};

export default SaveDocumentModal;
