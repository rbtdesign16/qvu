/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React from "react";
import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import EntryPanel from "../widgets/EntryPanel"

const EditObjectModal = (props) => {
  const {config} = props;
  
  const getOkLabel = () => {
      return config.new ? "Create" : "Update";
  };
  
  return (
    <div className="static-modal">
      <Modal animation={false} 
        show={config.show} 
        backdrop={true} 
        keyboard={true}>
        <Modal.Header>
          <Modal.Title>{config.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div><EntryPanel 
            labelWidth={config.labelWidth} 
            fieldWidth={config.fieldWidth} 
            entryConfig={config.entryConfig} 
            dataObject={config.dataObject} 
            newObject={config.newObject}/></div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => config.cancel()}>Cancel</Button>
          <Button className='button-l' bsStyle="primary" onClick={() => config.save(config.dataObject)}>{getOkLabel()}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

EditObjectModal.propTypes = {
  config: PropTypes.object.isRequired,
};

export default EditObjectModal;