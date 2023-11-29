import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import useLang from "../../context/LangContext";
import NumberEntry from "../../widgets/NumberEntry";
import PropTypes from "prop-types";
import {MODAL_TITLE_SIZE, copyObject} from "../../utils/helper";

const QueryColumnSelectModal = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const [queryColumns, setQueryColumns] = useState([]);
    
    const getTitle = () => {
        return getText("Query Column Select");
    };
    
    const onHide = () => {
        config.hide();
    };
    
    
    const onShow = () => {
        if (config.queryDocument) {
        }
    };
    
    const getColumnSelections = () => {
    };

    const loadColumns = () => {
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
                    <div>{loadColumns()}</div>
                     </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                        <Button size="sm" variant="primary" type="submit" onClick={() => config.save(getColumnSelections())}>{getText("Save")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            );
};

QueryColumnSelectModal.propTypes = {
    config: PropTypes.object.isRequired
};

export default QueryColumnSelectModal;
