/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, {useContext} from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import MessageContext from "../../context/message/MessageState";

const Message = (props) => {
    const messageContext = useContext(MessageContext);
    const {showMessage, hideMessage, currentMessage} = messageContext;
    return (
            <Modal 
                show={currentMessage.show}
                onHide="{hideMessage}">
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>{currentMessage.message}</Modal.Body>
            </Modal>);
}

export default Message;