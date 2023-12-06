import React, {useState} from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import useMessage from "../context/MessageContext";
import { SketchPicker } from 'react-color';
import useLang from "../context/LangContext";
import PropTypes from "prop-types";
import {MODAL_TITLE_SIZE, TRANSPARENT_SETTING} from "../utils/helper";

const ColorSelectModal = (props) => {
    const {config} = props;
    const [color, setColor] = useState(config.color);
    const {getText} = useLang();
    const getTitle = () => {
        return getText("Color Select");
    };
    
    const onHide = () => {
        config.hide();
    };
    
    return (
        <div className="static-modal">
            <Modal 
                animation={false} 
                dialogClassName="color-settings"
                show={config.show} 
                onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title as={MODAL_TITLE_SIZE}>{getTitle()}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SketchPicker color={ color } onChangeComplete={ setColor }/>                   
                </Modal.Body>
                <Modal.Footer>
                    <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                    <Button size="sm" onClick={() => setColor(TRANSPARENT_SETTING)}>{getText("Clear")}</Button>
                    <Button size="sm" variant="primary" type="submit" onClick={() => config.saveColor(color.hex)}>{getText("Save")}</Button>
                </Modal.Footer>
            </Modal>
        </div>
        );
};

ColorSelectModal.propTypes = {
    config: PropTypes.object.isRequired
};

export default ColorSelectModal;
