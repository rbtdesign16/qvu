/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, {useState} from "react";
import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import useHelp from "../../context/HelpContext";
import { MdHelpOutline } from 'react-icons/md';
import useLang from "../../context/LangContext";
import {MODAL_TITLE_SIZE, SMALL_ICON_SIZE} from "../../utils/helper";

const JoinType = (props) => {
    const {getText} = useLang();
    const {config} = props;
    const [joinType, setJoinType] = useState(config.joinType ? config.joinType : "outer");
    const {showHelp} = useHelp();
    const isInner = () => {
        return (joinType === "inner");
    };
    
    const onHide = () => {
        if (config && config.hide) {
            config.hide();
        }
    };
    
    const onShow = () => {
        setJoinType(config.joinType);
    };
    
    return ( 
        <div className="static-modal">
            <Modal animation={false} 
                   size="sm"
                   show={config.show} 
                   onShow={onShow}
                aria-labelledby="contained-modal-title-vcenter"
                   centered
                   onHide={onHide}
                   backdrop={true} 
                   keyboard={true}>
                <Modal.Header closeButton>
                    <Modal.Title as={MODAL_TITLE_SIZE}>
                        <MdHelpOutline className="icon" size={SMALL_ICON_SIZE} onClick={(e) => showHelp(getText("joinType-help"))}/>
                        {getText("Join Type")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div onChange={(e) => setJoinType(e.target.value)}>
                        <input id="outer" type="radio" name="jointype" checked={!isInner()} value="outer"/><label className="ck-label" htmlFor="outer"> {getText("Outer Join")}</label><br />
                        <input id="inner" type="radio" name="jointype" checked={isInner()} value="inner"/><label className="ck-label"  htmlFor="inner">{getText("Inner Join")}</label>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button size="sm" onClick={() => config.hide()}>{getText("Cancel")}</Button>
                    <Button size="sm" variant="primary" type="submit" onClick={(e) => config.setJoinType(joinType, config.nodeId)}>{getText("Ok")}</Button>
                </Modal.Footer>
            </Modal>
        </div>);
};

JoinType.propTypes = {
    config: PropTypes.object.isRequired
};

export default JoinType;