/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import useMessage from "../context/MessageContext";

const Message = (props) => {
    const {messageInfo, hideMessage, currentMessage} = useMessage();
    return (
            <Modal 
                show={messageInfo.show}
                onHide="{hideMessage}">
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>{messageInfo.message}</Modal.Body>
            </Modal>);
}

export default Message;