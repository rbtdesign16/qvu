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
} from "../utils/helper";

const INFO_BACKGROUND_COLOR =  "gainsboro";
const SUCCESS_BACKGROUND_COLOR =  "green";
const WARN_BACKGROUND_COLOR =  "yellow";
const ERROR_BACKGROUND_COLOR =  "red";

const INFO_TEXT_COLOR =  "darkslategray";
const SUCCESS_TEXT_COLOR =  "white";
const WARN_TEXT_COLOR =  "darkslategray";
const ERROR_TEXT_COLOR =  "white";


const Message = (props) => {
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const onEntering = () => {
        let header = getHeader();
        let content = getContent();
        let title = getTitle();
        if (header && content) {
            let textColor = getTextColor()
            let bkColor = getBackgroundColor();
            header.style.background = content.style.background = bkColor;
            header.style.padding = "5px";
            header.style.color = content.style.color = textColor;
            title.style.fontSize = "12pt";
        }
    }

   const getTitle = () => {
        return document.getElementById("message-popup").getElementsByClassName("modal-title")[0];
    }
    const getHeader = () => {
        return document.getElementById("message-popup").getElementsByClassName("modal-header")[0];
    }

    const getContent = () => {
        return document.getElementById("message-popup").getElementsByClassName("modal-content")[0];
    }

    const getBackgroundColor = () => {
        switch (messageInfo.type) {
            case INFO:
                return INFO_BACKGROUND_COLOR;
            case SUCCESS:
                return SUCCESS_BACKGROUND_COLOR;
            case WARN:
                return WARN_BACKGROUND_COLOR;
            case ERROR:
                return ERROR_BACKGROUND_COLOR;
        }
    }

    const getTextColor = () => {
        switch (messageInfo.type) {
            case INFO:
                return INFO_TEXT_COLOR;
            case SUCCESS:
                return SUCCESS_TEXT_COLOR;
            case WARN:
                return WARN_TEXT_COLOR;
            case ERROR:
                return ERROR_TEXT_COLOR;
        }
    }
    
    const onHide = () => {
        hideMessage();
    }
    
    return (
            <Modal
                show={messageInfo.show}
                size="sm"
                onHide={onHide}
                onEntered={onEntering}
                backdrop={false}
                id="message-popup"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        {messageInfo.title ? messageInfo.title : messageInfo.type}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>{messageInfo.message}</Modal.Body>
            </Modal>);
}

export default Message;