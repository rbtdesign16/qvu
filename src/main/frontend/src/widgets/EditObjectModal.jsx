/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React from "react";
import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button"
import EntryPanel from "../widgets/EntryPanel"
import useLang from "../context/LangContext";

const EditObjectModal = (props) => {
    const {config} = props;
    const {getText} = useLang();

    const getOkLabel = () => {
        if (config.dataObject) {
            return config.dataObject.newRecord ? getText("Create") : getText("Update");
        } else {
            return "Create";
        }
    };


    return (
            <div className="static-modal">
                <Modal animation={false} 
                       size={config.dlgsize ? config.dlgsize : ""}
                       show={config.show} 
                       backdrop={true} 
                       keyboard={true}>
                    <Modal.Header>
                        <Modal.Title>{config.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div><EntryPanel config={config}/><div className="modal-error-msg" id={config.idPrefix + "error-msg"}></div></div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => config.cancel()}>Cancel</Button>
                        <Button size="sm" variant="primary" type="submit" onClick={() => config.save(config)}>{getOkLabel()}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            );
};

EditObjectModal.propTypes = {
    config: PropTypes.object.isRequired
};

export default EditObjectModal;