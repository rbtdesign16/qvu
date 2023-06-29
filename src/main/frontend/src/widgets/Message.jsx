/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import useMessage from "../context/MessageContext";
import {
    INFO,
    SUCCESS,
    WARN,
    ERROR,
    SUCCESS_MESSAGE_TIMEOUT
    
} from "../utils/helper";


const Message = () => {
    const {messageInfo, showMessage, hideMessage} = useMessage();

    let myTimeout;
    
    const onHide = () => {
        myTimeout = null;
        hideMessage();
    };

    const getClassName = () => {
        return messageInfo.type + "-message";
    };

    const getMessage = () => {
        if (messageInfo.showSpinner) {
            return <div><span className="spinner"/><span style={{marginLeft: "34px"}}>{messageInfo.message}</span></div>;
        } else {
            return <div>{messageInfo.message}</div>;
        }
    };

    const getTitle = () => {
        if (messageInfo.title) {
            return messageInfo.title;
        } else if (messageInfo.showSpinner) {
            return "Loading...";
        } else {
            return messageInfo.type;
        }
    };
    
    const onEntered = () => {
        if (messageInfo.type === SUCCESS) {
            myTimeout = setTimeout(onHide, SUCCESS_MESSAGE_TIMEOUT);
        } else if (myTimeout) {
            clearTimeout(myTimeout);
        }
    };
    
    return (
            <Modal
                show={messageInfo.show}
                size="sm"
                onHide={onHide}
                onEntered={onEntered}
                contentClassName={getClassName()}
                backdrop={messageInfo.backdrop}
                id="message-popup"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                >
                <Modal.Header bsPrefix="message-header" closeButton>
                    <Modal.Title bsPrefix="message-title" id="contained-modal-title-vcenter">
                        {getTitle()}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body bsPrefix="message-body">{getMessage()}</Modal.Body>
            </Modal>);
};

export default Message;