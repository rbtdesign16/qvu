import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import useLang from "../../context/LangContext";
import { Tabs, Tab } from "react-bootstrap";
import NumberEntry from "../../widgets/NumberEntry";
import BorderPanel from "../../widgets/BorderPanel";
import FontPanel from "../../widgets/FontPanel";
import PropTypes from "prop-types";
import {MODAL_TITLE_SIZE} from "../../utils/helper";

const AddEditComponentModal = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const [component, setComponent] = useState({});
    
    const getTitle = () => {
        if (component.componentIndex) {
            return getText("Edit " + config.displayText + " Component");
        } else {
            return getText("Add " + config.displayText + " Component");
        }
    };
    
    const onHide = () => {
        config.hide();
    };
    
    const onShow = () => {
        setComponent(config.component);
    };

    if (config.component) {
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
                         <Tabs id="t1" className="mb-3">
                            <Tab eventKey="detail" title={config.displayText + " " + getText("Detail")}>
                            <div>{config.displayText}</div>
                            </Tab>
                            <Tab eventKey="font" title={getText("Font")}>
                                <FontPanel fontSettings={component.fontSettings} reportSettings={config.reportSettings}/>
                            </Tab>
                            <Tab eventKey="border" title={getText("Border")}>
                                <BorderPanel borderSettings={component.borderSettings} reportSettings={config.reportSettings}/>
                            </Tab>
                        </Tabs>
                         </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                        <Button size="sm" variant="primary" type="submit" onClick={() => config.saveComponent(component)}>{getText("Save")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            );
    } else {
        return "";
    }
};

AddEditComponentModal.propTypes = {
    config: PropTypes.object.isRequired
};

export default AddEditComponentModal;
