import React, {useState} from "react";
import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import useLang from "../context/LangContext";
import {
    MODAL_TITLE_SIZE, 
    SMALL_ICON_SIZE, 
    ERROR, 
    isValidPassword} from "../utils/helper";

const UpdatePasswordModal = (props) => {
    const {getText} = useLang();
    const {config} = props;
    const [newPassword, setNewPassword] = useState(null);
    const [repeatPassword, setRepeatPassword] = useState(null);
    const onHide = () => {
        if (config && config.hide) {
            config.hide();
        }
    };

    const onUpdate = () => {
        config.updatePassword(newPassword);   
    };
    
    const canUpdate = () => {
        return (newPassword && isValidPassword(newPassword) 
            && repeatPassword && (newPassword === repeatPassword));
    }
    
    return (
            <div className="static-modal">
                <Modal animation={false} 
                       show={config.show} 
                       aria-labelledby="contained-modal-title-vcenter"
                       centered
                       onHide={onHide}
                       backdrop={true} 
                       keyboard={true}>
                    <Modal.Header closeButton>
                        <Modal.Title as={MODAL_TITLE_SIZE}>
                            {getText("Update Password")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="entrygrid-150-200">
                            <div className="label">{getText("New Password")}</div><div><input type="password" onChange={e => setNewPassword(e.target.value)}/></div>
                            <div className="label">{getText("Repeat Password")}</div><div><input type="password" onChange={e => setRepeatPassword(e.target.value)}/></div>
                        </div>
                        <div>{getText("password-validation-msg")}</div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => config.hide()}>{getText("Cancel")}</Button>
                        <Button size="sm" variant="primary" disabled={!canUpdate()} type="submit" onClick={e => onUpdate()}>{getText("Update")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>);
};

UpdatePasswordModal.propTypes = {
    config: PropTypes.object.isRequired
};

export default UpdatePasswordModal;