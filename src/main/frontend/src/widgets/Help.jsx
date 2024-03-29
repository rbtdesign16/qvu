import React from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import useHelp from "../context/HelpContext";
import useLang from "../context/LangContext";

const Help = (props) => {
    const {helpInfo, hideHelp} = useHelp();
    const {getText} = useLang();
    
    const onHide = () => {
        hideHelp();
    };
    
    const getHelp = () => {
        return <div>{helpInfo.message}</div>;
    };

    return (
            <Modal
                show={helpInfo.show}
                size="lg"
                onHide={onHide}
                dialaogClassName="help-dlg"
                enforceFocus={false}
                contentClassName="help-content"
                id="help-popup"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                >
                <Modal.Header bsPrefix="message-header" closeButton>
                    <Modal.Title bsPrefix="message-title" id="contained-modal-title-vcenter">
                    {getText("Help")}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body bsPrefix="message-body">{getHelp()}</Modal.Body>
            </Modal>);
};

export default Help;