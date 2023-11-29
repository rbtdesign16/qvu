import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import TreeView from "react-accessible-treeview";
import useMessage from "../context/MessageContext";
import useLang from "../context/LangContext";
import TreeArrowIcon from "../widgets/TreeArrowIcon"
import { FcFolder, FcDocument } from  "react-icons/fc";
import PropTypes from "prop-types";
import {
    QUERY_DOCUMENT_TYPE,
    SMALL_ICON_SIZE,
    REPORT_DOCUMENT_TYPE,
    MODAL_TITLE_SIZE} from "../utils/helper";

const DocumentSelectModal = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const {showMessage, hideMessage} = useMessage();
    const [docData, setDocData] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    
    const getTitle = () => {
        switch (config.type) {
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

    const onShow = () => {
         setDocData(config.treeRoot);
    };
    
    const onClick = (element) => {
        config.loadDocument(element.metadata.group, element.name);
    };
    
    const getNode = (element, isBranch, isExpanded) => {
        if (isBranch) {
            return <span><TreeArrowIcon isOpen={isExpanded}/><span className="name"><FcFolder className="icon" size={SMALL_ICON_SIZE}/>&nbsp;{element.name}</span></span>;
        } else {
            return <span style={{cursor: "pointer"}} className="name" onClick={(e) => onClick(element)}><FcDocument className="icon" size={SMALL_ICON_SIZE}/>&nbsp;{element.name}</span>;
        }
    };

     const nodeRenderer = (p) => {
        const {element,
            isBranch,
            isExpanded,
            isSelected,
            getNodeProps,
            level,
            handleSelect,
            handleExpand} = p;
        return <div
        {...getNodeProps({onClick: handleExpand})}
        style={{marginLeft: 20 * (level - 1)}}
        >
        {getNode(element, isBranch, isExpanded)}
    
    </div>
    };

    return (
            <div className="static-modal">
                <Modal animation={false} 
                      show={config.show} 
                       onShow={onShow}
                       onHide={onHide}>
                    <Modal.Header closeButton>
                        <Modal.Title as={MODAL_TITLE_SIZE}>{getTitle()}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <div style={{height: "400px", width: "100%", overflow: "auto"}} className="tree-view">
                    {docData && 
                        <TreeView
                            data={docData}
                            propagateCollapse={true}
                            multiSelect={false}
                            selectedIds={[]}
                            nodeRenderer={nodeRenderer}
                            />}</div>
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
