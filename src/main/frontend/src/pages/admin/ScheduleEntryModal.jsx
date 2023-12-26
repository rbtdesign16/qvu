import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import { MultiSelect } from "react-multi-select-component";
import useMessage from "../../context/MessageContext";
import useAuth from "../../context/AuthContext";
import useLang from "../../context/LangContext";
import PropTypes from "prop-types";
import { flattenTree } from "react-accessible-treeview";
import {FcDocument} from "react-icons/fc";
import DocumentSelectModal from "../../widgets/DocumentSelectModal";
import {
    INFO,
    ERROR,
    MODAL_TITLE_SIZE,
    QUERY_DOCUMENT_TYPE,
    REPORT_DOCUMENT_TYPE,
    SMALL_ICON_SIZE,
    RESULT_TYPE_EXCEL,
    RESULT_TYPE_CSV,
    RESULT_TYPE_JSON_FLAT,
    RESULT_TYPE_JSON_OBJECTGRAPH,
    MONTHS,
    DAYS_OF_WEEK,
    getCurrentSelectValue,
    replaceTokens} from "../../utils/helper";

import { getAvailableDocuments, isApiSuccess } from "../../utils/apiHelper";

const ScheduleEntryModal = (props) => {
    const {config} = props;
    const {schedule, indx} = config;
    const {authData} = useAuth();
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage, setMessageInfo} = useMessage();
    const [toggle, setToggle] = useState(false);
    const [showDocumentSelect, setShowDocumentSelect] = useState({show: false, type: QUERY_DOCUMENT_TYPE});
    const documentTypes = [
    {
        value: QUERY_DOCUMENT_TYPE,
        label: getText(QUERY_DOCUMENT_TYPE)
    },
    {
        value: REPORT_DOCUMENT_TYPE,
        label: getText(REPORT_DOCUMENT_TYPE)
    }];

    const attachmentTypes = [
    {
        value: RESULT_TYPE_CSV,
        label: getText(RESULT_TYPE_CSV)
    },
    {
        value: RESULT_TYPE_EXCEL,
        label: getText(RESULT_TYPE_EXCEL)
    },
    {
        value: RESULT_TYPE_JSON_FLAT,
        label: getText(RESULT_TYPE_JSON_FLAT)
    },
    {
        value: RESULT_TYPE_JSON_OBJECTGRAPH,
        label: getText(RESULT_TYPE_JSON_OBJECTGRAPH)
    }];


    const getMonths = () => {
        let retval = [];
        MONTHS.map((m, indx) => retval.push({value: indx, label: getText(m)}));
        return retval;
    };
    
    const getDaysOfWeek = () => {
        let retval = [];
        DAYS_OF_WEEK.map((d, indx) => retval.push({value: indx + 1, label: getText(d)}));
        return retval;
    };

    const multiSelectValueRenderer = (selected) => {
        if (selected.length > 0) {
            return getText("Item(s) selected");
        } else {
            getText("Select", "...");
        }
    };

    const getTitle = () => {
        if (!schedule || schedule.newRecord) {
            return getText("Add Document Schedule");
        } else {
            return getText("Update Document Schedule");
        }
    };

    const onHide = () => {
        config.hide();
    };

    const isValidSchedule = () => {
        let retval = ((isDaysOfMonthDisabled() || isDaysOfWeekDisabled())
                && ((schedule.documentType === REPORT_DOCUMENT_TYPE) || schedule.attachmentType)
                && schedule.documentGroup
                && schedule.documentName
                && schedule.hoursOfDay
                && (schedule.hoursOfDay.length > 0));

        return retval;
    };

    const isValidEmailList = () => {
        if (schedule.emailAddresses && (schedule.emailAddresses.length > 0)) {
            for (let i = 0; i < schedule.emailAddresses.length; ++i) {
                if (!schedule.emailAddresses[i].includes("@")) {
                    return false;
                }
            }

            return true;
        }
    };

    const canSave = () => {
        return isValidSchedule() && isValidEmailList();
    };

    const onShow = () => {
        if (!schedule.documentType) {
            schedule.documentType = QUERY_DOCUMENT_TYPE;
        }
    };

    const setMonths = (selections) => {
        schedule.months = [];
        selections.map(s => schedule.months.push(s.value));
        setToggle(!toggle);
    };

    const getSelectedMonths = () => {
        let retval = [];
        if (schedule && schedule.months) {
            schedule.months.map(m => {
                retval.push({value: m, label: getText(MONTHS[m])});
            });
        }

        return retval;
    };

    const getDaysOfMonth = () => {
        let retval = [];

        for (let i = 0; i < 31; ++i) {
            retval.push({value: i + 1, label: String(i + 1)});
        }

        return retval;
    };

    const getHoursOfDay = () => {
        let retval = [];

        for (let i = 0; i < 24; ++i) {
            retval.push(i);
        }

        return retval.map(h => {
            if (h === 12) {
                return {value: h, label: getText("noon")};
            } else if (h === 0) {
                return {value: h, label: getText("midnight")};
            } else if (h < 12) {
                return {value: h, label: h + "am"};
            } else {
                return {value: h, label: (h - 12) + "pm"};
            }
        });
    };

    const setDaysOfMonth = (selections) => {
        schedule.daysOfMonth = [];
        selections.map(s => schedule.daysOfMonth.push(s.value));
        setToggle(!toggle);
    };

    const getSelectedDaysOfWeek = () => {
        let retval = [];
        if (schedule && schedule.daysOfWeek) {
            schedule.daysOfWeek.map(d => {
                retval.push({value: d, label: getText(DAYS_OF_WEEK[d])});
            });
        }

        return retval;
    };

    const setDaysOfWeek = (selections) => {
        schedule.daysOfWeek = [];
        selections.map(s => schedule.daysOfWeek.push(s.value));
        setToggle(!toggle);
    };

    const getSelectedHoursOfDay = () => {
        let retval = [];
        if (schedule && schedule.hoursOfDay) {
            schedule.hoursOfDay.map(h => {
                if (h === 12) {
                    retval.push({value: h, label: getText("noon")});
                } else if (h === 0) {
                    retval.push({value: h, label: getText("midnight")});
                } else if (h < 12) {
                    retval.push({value: h, label: h + "am"});
                } else {
                    retval.push({value: h, label: (h - 12) + "pm"});
                }
            });
        }

        return retval;
    };

    const setHoursOfDay = (selections) => {
        schedule.hoursOfDay = [];
        selections.map(s => schedule.hoursOfDay.push(s.value));
        setToggle(!toggle);
    };

    const isDaysOfWeekDisabled = () => {
        let retval = (schedule && schedule.daysOfMonth && (schedule.daysOfMonth.length > 0));

        if (retval && schedule.daysOfWeek && (schedule.daysOfWeek.length > 0)) {
            schedule.daysOfWeek = [];
            setToggle(!toggle);
        }

        return retval;
    };

    const isDaysOfMonthDisabled = () => {
        let retval = (schedule && schedule.daysOfWeek && (schedule.daysOfWeek.length > 0));

        if (retval && schedule.daysOfMonth && (schedule.daysOfMonth.length > 0)) {
            schedule.daysOfMonth = [];
            setToggle(!toggle);
        }

        return retval;
    };

    const getSelectedDaysOfMonth = () => {
        let retval = [];
        if (schedule && schedule.daysOfMonth) {
            schedule.daysOfMonth.map(d => {
                retval.push({value: d, label: d});
            });
        }

        return retval;
    };

    const setEmails = (input) => {
        schedule.emailAddresses = [];

        if (input) {
            schedule.emailAddresses = input.split(",");
        }
        setToggle(!toggle);
    };
    
    const setParameters = (input) => {
        schedule.parameters = [];

        if (input) {
            schedule.parameters = input.split(",");
        }
        setToggle(!toggle);
    };

    const hideDocumentSelect = () => {
        setShowDocumentSelect({show: false});
    };

    const loadDocument = (group, name) => {
        schedule.documentGroup = group;
        schedule.documentName = name;
        hideDocumentSelect();
    };

    const onShowDocumentSelect = async () => {
        showMessage(INFO, replaceTokens(getText("Loading available documents", "..."), schedule.documentType), null, true);

        let res = await getAvailableDocuments(schedule.documentType);

        hideMessage();

        if (isApiSuccess(res)) {
            setShowDocumentSelect({show: true, type: schedule.documentType, hide: hideDocumentSelect, loadDocument: loadDocument, treeRoot: flattenTree(res.result)});
        } else {
            showMessage(ERROR, res.message);
        }
    };

    const onAttachmentType = (e) => {
        schedule.attachmentType = e.target.options[e.target.selectedIndex].value;
        setToggle(!toggle);
    };
    
    const onDocumentType = (e) => {
        schedule.documentType = e.target.options[e.target.selectedIndex].value;
        if (schedule.documentType === REPORT_DOCUMENT_TYPE) {
            schedule.attachmentType = "";
        }
        setToggle(!toggle);
    };

    const loadDocumentTypes = () => {
        return documentTypes.map(a => {
            if (schedule && (schedule.documentType === a.value)) {
                return <option value={a.value} selected>{a.label}</option>;
            } else {
                return <option value={a.value}>{a.label}</option>;
            }
        });
    };

    const loadAttachmentTypes = () => {
        return attachmentTypes.map(a => {
            if (schedule && (schedule.attachmentType === a.value)) {
                return <option value={a.value} selected>{a.label}</option>;
            } else {
                return <option value={a.value}>{a.label}</option>;
            }
        });
    };

    const isReportDocument = () => {
        return (schedule && (schedule.documentType === REPORT_DOCUMENT_TYPE));
    };
    
    const getAttachmentInput = () => {
        if (isReportDocument()) {
            return "PDF";
        } else {
            return <select disabled={isReportDocument()} onChange={e => onAttachmentType(e)}><option value=""></option>{loadAttachmentTypes()}</select>;
        }
    };
    
    const getSelectedDocument = () => {
        if (schedule && schedule.documentName) {
            return getText("Group:", " ") + schedule.documentGroup + ",    " + getText("Name:", " ") + schedule.documentName;
        } else {
            return getText("Select a document", "...");
        }
    };

    return (
            <div className="static-modal">
                <DocumentSelectModal config={showDocumentSelect}/>
            
                <Modal animation={false} 
                       show={config.show} 
                       onShow={onShow}
                       dialogClassName="schedule-entry"
                       onHide={onHide}>
                    <Modal.Header closeButton>
                        <Modal.Title as={MODAL_TITLE_SIZE}>{getTitle()}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="entrygrid-120-375">
                            <div title={getText("Document Type")} className="label">{getText("Document Type:")}</div>
                            <div><select name="documentType" onChange={e => onDocumentType(e)}>{loadDocumentTypes()}</select></div>
                            <div title={getText("Select Document")} className="label">{getText("Document:")}</div>
                            <div style={{whiteSpace: "nowrap", height: "30px", border: "solid 1px darkslategray"}}>
                                <FcDocument className="icon" size={SMALL_ICON_SIZE} onClick={e => onShowDocumentSelect()}/>
                                {getSelectedDocument()}
                            </div>
                            <div className="label">{getText("Months:")}</div>
                            <div style={{width: "50%"}}>
                                <MultiSelect options={getMonths()} value={getSelectedMonths()} onChange={selections => setMonths(selections)} valueRenderer={(selected) => multiSelectValueRenderer(selected)} />
                            </div>
                            <div className="label">{getText("Days of Month:")}</div>
                            <div style={{width: "50%"}}>
                                <MultiSelect options={getDaysOfMonth()} disabled={isDaysOfMonthDisabled()} value={getSelectedDaysOfMonth()} onChange={selections => setDaysOfMonth(selections)} valueRenderer={(selected) => multiSelectValueRenderer(selected)} />
                            </div>
                            <div className="label">{getText("Day of Week:")}</div>
                            <div  style={{width: "50%"}}>
                                <MultiSelect options={getDaysOfWeek()} disabled={isDaysOfWeekDisabled()} value={getSelectedDaysOfWeek()} onChange={selections => setDaysOfWeek(selections)} valueRenderer={(selected) => multiSelectValueRenderer(selected)} />
                            </div>
                            <div className="label">{getText("Hour:")}</div>
                            <div style={{width: "50%"}}>
                                <MultiSelect options={getHoursOfDay()} value={getSelectedHoursOfDay()} onChange={selections => setHoursOfDay(selections)} valueRenderer={(selected) => multiSelectValueRenderer(selected)} />
                            </div>
                            <div className="label">{getText("Parameters:")}</div><div><input type="text" size={45} defaultValue={(schedule && schedule.parameters) ? schedule.parameters.join(",") : ""} onBlur={e => setParameters(e.target.value)}/></div>
                            <div className="label">{getText("Attachment:")}</div><div>{getAttachmentInput()}</div>
                            <div className="label">{getText("Emails:")}</div><div><input type="text" size={45} defaultValue={(schedule && schedule.emailAddresses) ? schedule.emailAddresses.join(",") : ""} onBlur={e => setEmails(e.target.value)}/></div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                        <Button size="sm" variant="primary" disabled={!canSave()}  type="submit" onClick={() => config.saveSchedule(indx, schedule)}>{getText("Save")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            );
};

ScheduleEntryModal.propTypes = {
    config: PropTypes.object.isRequired
};

export default ScheduleEntryModal;
