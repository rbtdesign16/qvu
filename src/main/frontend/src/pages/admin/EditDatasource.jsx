/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { confirmable } from 'react-confirm';

const EditDatasource = (props) => {
  const {datasource, show, onCancel, onSave} = props;
  
  const getTitle = () => {
      return datasource.datasourceName ? ("Edit datasource " + datasource.datasourceName) : "Create new datasource";
  };
  
  const getOkLabel = () => {
      return datasource.datasourceName ? "Update" : "Create";
  };
  
  return (
    <div className="static-modal">
      <Modal animation={false} 
        show={show} 
        backdrop={true} 
        keyboard={true}>
        <Modal.Header>
          <Modal.Title>{getTitle()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div><h1>this is a test</h1></div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => onCancel()}>Cancel</Button>
          <Button className='button-l' bsStyle="primary" onClick={() => onSave(datasource)}>{getOkLabel()}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

EditDatasource.propTypes = {
  datasource: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  show: PropTypes.bool
};

export default EditDatasource;