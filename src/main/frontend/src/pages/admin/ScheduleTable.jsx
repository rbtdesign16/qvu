/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, {useState} from "react";
import useAuth from "../../context/AuthContext";
import useLang from "../../context/LangContext";
import useDataHandler from "../../context/DataHandlerContext";
import useMessage from "../../context/MessageContext";
import useHelp from "../../context/HelpContext";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ColumnSettings from "./ColumnSettings";
import { MultiSelect } from "react-multi-select-component";
import { MdHelpOutline } from 'react-icons/md';
import PropTypes from "prop-types";
import {
    ERROR,
    SMALL_ICON_SIZE,
    MODAL_TITLE_SIZE,
    confirm,
    getUUID,
    CUSTOM_FK_DATA_SEPARATOR} from "../../utils/helper";

const ScheduleTable = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const {showHelp} = useHelp();
    
    const onHelp = () => {
        showHelp(getText("scheduleEntry-help"));
    };

    const onHide = () => {
        config.hide();
    };


    const onSave = () => {
        config.save();
    };


    const onShow = () => {
    };

    const loadScheduledReports = () => {
        return "";
    };
    
    return (
            <div className="static-modal">
                <Modal animation={false} 
                       dialogClassName="schedule-table"
                       show={config.show} 
                       onShow={onShow}
                       onHide={onHide}
                       backdrop={true} 
                       keyboard={true}>
                    <Modal.Header closeButton>
                        <Modal.Title as={MODAL_TITLE_SIZE}><MdHelpOutline className="icon" size={SMALL_ICON_SIZE} onClick={(e) => onHelp()}/>
                            &nbsp;&nbsp;{getText("Scheduled Reports") }</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{height: "300px", overflow: "auto"}}>{loadScheduledReports()}</div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                        <Button size="sm" variant="primary" type="submit" onClick={() => onSave()}>{getText("Save")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            );
};

export default ScheduleTable;
