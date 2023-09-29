import React, {useState} from "react";
import useLang from "../../context/LangContext";
import useMessage from "../../context/MessageContext";
import useHelp from "../../context/HelpContext";
import DataTable from "../../widgets/DataTable";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ScheduleEntryModal from "./ScheduleEntryModal";
import { CiEdit } from 'react-icons/ci';
import { MdOutlineDeleteForever, MdOutlineAddBox, MdHelpOutline } from 'react-icons/md';
import PropTypes from "prop-types";
import {
    INFO,
    ERROR,
    SMALL_ICON_SIZE,
    MODAL_TITLE_SIZE,
    confirm,
    getUUID,
    CUSTOM_FK_DATA_SEPARATOR,
    MONTHS,
    DAYS_OF_WEEK} from "../../utils/helper";
import { loadDocumentSchedules, isApiSuccess } from "../../utils/apiHelper";

const DocumentScheduleTable = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {showMessage, hideMessage} = useMessage();
    const [scheduledDocuments, setScheduledDocuments] = useState([]);
    const [showDocumentSchedule, setShowDocumentSchedule] = useState({show: false, schedule: {newRecord: true}});
    const onHelp = () => {
        showHelp(getText("scheduleEntry-help"));
    };


    const editSchedule = (indx) => {
    };

    const deleteSchedule = (indx) => {
    };

    const columnDefs = [
        {
            render: (rownum, row) => {
                return <div style={{textAlign: "center"}}>
                    <span title={getText("Edit Schedule")}><CiEdit className="icon cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={(e) => editSchedule(rownum)} /></span>
                    <span title={getText("Delete Schedule")}><MdOutlineDeleteForever className="icon crimson-f" size={SMALL_ICON_SIZE}  onClick={(e) => deleteSchedule(rownum)} /></span>
                </div>;
            }
        },
        {
            title: getText("Group"),
            fieldName: "documentGroup",
            align: "center"
        },
        {
            title: getText("Document"),
            fieldName: "documentName"
        },
        {
            title: getText("Months"),
            fieldName: "months",
            formatForDisplay: (val) => {
                let retval = "";
                if (val) {
                    let comma = "";
                    val.map(m => {
                        retval += (comma + getText(MONTHS[m].substring(0, 3)));
                        comma = ", ";
                    });
                }
                
                return retval;
            }
        },
        {
            title: getText("Days of Month"),
            fieldName: "daysOfMonth"
        },
        {
            title: getText("Days of Week"),
            fieldName: "daysOfWeek",
            formatForDisplay: (val) => {
                let retval = "";
                if (val) {
                    let comma = "";
                    val.map(d => {
                        retval += (comma + getText(DAYS_OF_WEEK[d].substring(0, 3)));
                        comma = ", ";
                    });
                }
                
                return retval;
            }
        },
        {
            title: getText("Hours of Day"),
            fieldName: "hoursOfDay",
            formatForDisplay: (val) => {
                let retval = "";
                if (val) {
                    let comma = "";
                    val.map(h => {
                        if (h === 0) {
                            retval += (comma + getText("midnight"));
                        } else if (h === 12) {
                            retval += (comma + getText("noon"));
                        } else if (h < 12) {
                            retval += (comma + h + "am");
                        } else {
                            retval += (comma + (h - 12) + "pm");
                        }   
                        comma = ", ";
                    });
                }
                
                return retval;
            }
        },
        {
            title: getText("Attachment"),
            fieldName: "attachmentType"
        },
        {
            title: getText("Email(s)"),
            fieldName: "emailAddresses"
        }
    ];

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
        schedule.newRecord = false;
        schedule.modified = true;
        let sd = [];
        if (scheduledDocuments && (scheduledDocuments.length > 0)) {
            sd = [...scheduledDocuments];
        }

        if (indx > -1) {
            sd[indx] = schedule;
        } else {
            sd.push(schedule);
        }

        setShowDocumentSchedule({show: false});
        setScheduledDocuments(sd);
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

    const canSave = () => {
        if (scheduledDocuments && (scheduledDocuments.length > 0)) {
            for (let i = 0; i < scheduledDocuments.length; ++i) {
                if (scheduledDocuments[i].modified) {
                    return true;
                }
            }
        } 
        
        return false;
    };
        
    return (
            <div className="static-modal">
                <ScheduleEntryModal config={showDocumentSchedule}/>
                <Modal animation={false} 
                       dialogClassName="schedule-modal"
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
                        <DataTable 
                            columnDefs={columnDefs} 
                            containerClass="schedule-table" 
                            headerClass="schedule-table-hdr" 
                            bodyClass="schedule-table-body" 
                            data={scheduledDocuments}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={e => onHide() }>{getText("Cancel")}</Button>
                        <Button size="sm" variant="primary" disabled={!canSave()} type="submit" onClick={e => onSave()}>{getText("Save")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            );
};

DocumentScheduleTable.propTypes = {
    config: PropTypes.object.isRequired
};

export default DocumentScheduleTable;
