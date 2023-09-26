import React, {useState} from "react";
import useLang from "../../context/LangContext";
import useMessage from "../../context/MessageContext";
import useHelp from "../../context/HelpContext";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ScheduleEntryModal from "./ScheduleEntryModal";
import { MdOutlineDeleteForever, MdOutlineAddBox, MdHelpOutline } from 'react-icons/md';
import { CiEdit } from 'react-icons/ci';
import PropTypes from "prop-types";
import {
    INFO,
    ERROR,
    SMALL_ICON_SIZE,
    MODAL_TITLE_SIZE,
    confirm,
    getUUID,
    CUSTOM_FK_DATA_SEPARATOR} from "../../utils/helper"; 
import { loadDocumentSchedules, isApiSuccess } from "../../utils/apiHelper";

const DocumentScheduleTable = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {showMessage, hideMessage} = useMessage();
    const [scheduledDocuments, setScheduledDocuments] = useState(null);
    const [showDocumentSchedule, setShowDocumentSchedule] = useState({show: false, schedule: {newRecord: true}});
    const onHelp = () => {
        showHelp(getText("scheduleEntry-help"));
    };

    const onHide = () => {
        config.hide();
    };


    const onSave = () => {
        config.save();
    };
    
    const hideSchedule = () => {
        setShowDocumentSchedule({show: false});
    };

    const saveSchedule = (indx, schedule) => {
        setShowDocumentSchedule({show: false});
    };

    const onAdd = () => {
        setShowDocumentSchedule({show: true, indx: -1, schedule: {newRecord: true}, hide: hideSchedule, saveSchedule: saveSchedule});
    };

    const onEdit = (indx) => {
        setShowDocumentSchedule({show: true, indx: indx, schedule: {...scheduledDocuments[indx]}, saveSchedule: saveSchedule, hide: hideSchedule});
    };

    const onShow = async () => {
        showMessage(INFO, getText("Loading scheduled documents", "..."), null, true);
        let res = await loadDocumentSchedules();
        
        if (isApiSuccess(res)) {
            hideMessage();
            setScheduledDocuments(res);
        } else {
            showMessage(ERROR, res.message);
        }
    };
    
    const loadScheduledDocuments = () => {
        if (scheduledDocuments) {
            return "";
        } else {
            return "";
        }
    };

    return (
            <div className="static-modal">
                <ScheduleEntryModal config={showDocumentSchedule}/>
                <Modal animation={false} 
                       dialogClassName="schedule-table"
                       show={config.show} 
                       onShow={onShow}
                       onHide={onHide}
                       backdrop={true} 
                       keyboard={true}>
                    <Modal.Header closeButton>
                        <Modal.Title as={MODAL_TITLE_SIZE}><MdHelpOutline className="icon" size={SMALL_ICON_SIZE} onClick={e => onHelp()}/>
                            &nbsp;&nbsp;{getText("Scheduled Documents") }</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div title={getText("Add Schedule")}><MdOutlineAddBox size={SMALL_ICON_SIZE} className="icon cloverGreen-f" onClick={e => onAdd()}/>{getText("Add Schedule")}</div>
                        <div className="schedule-entries">{loadScheduledDocuments()}</div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={e => onHide() }>{getText("Cancel")}</Button>
                        <Button size="sm" variant="primary" type="submit" onClick={e => onSave()}>{getText("Save")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            );
};

DocumentScheduleTable.propTypes = {
    config: PropTypes.object.isRequired
};

export default DocumentScheduleTable;
