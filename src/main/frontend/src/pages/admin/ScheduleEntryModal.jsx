import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import { MultiSelect } from "react-multi-select-component";
import useMessage from "../../context/MessageContext";
import useAuth from "../../context/AuthContext";
import useLang from "../../context/LangContext";
import PropTypes from "prop-types";
import {MODAL_TITLE_SIZE, getCurrentSelectValue} from "../../utils/helper";

const ScheduleEntryModal = (props) => {
    const {config} = props;
    const {schedule, indx} = config;
    const {authData} = useAuth();
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage, setMessageInfo} = useMessage();
    const [toggle, setToggle] = useState(false);

    const months = [
        {
            value: 0,
            label: getText("January")
        },
        {
            value: 1,
            label: getText("February")
        },
        {
            value: 2,
            label: getText("March")
        },
        {
            value: 3,
            label: getText("April")
        },
        {
            value: 4,
            label: getText("May")
        },
        {
            value: 5,
            label: getText("June")
        },
        {
            value: 6,
            label: getText("July")
        },
        {
            value: 7,
            label: getText("August")
        },
        {
            value: 8,
            label: getText("September")
        },
        {
            value: 9,
            label: getText("October")
        },
        {
            value: 10,
            label: getText("November")
        },
        {
            value: 11,
            label: getText("December")
        }
    ];

    const daysOfWeek = [
        {
            value: 0,
            label: getText("Sunday")
        },
        {
            value: 1,
            label: getText("Monday")
        },
        {
            value: 2,
            label: getText("Tuesday")
        },
        {
            value: 3,
            label: getText("Wednesday")
        },
        {
            value: 4,
            label: getText("Thursday")
        },
        {
            value: 5,
            label: getText("Friday")
        },
        {
            value: 6,
            label: getText("Saturday")
        }];

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
        return false;
    };

    const isValidEmailList = () => {
        if (schedule.emailAddresses) {
            let addresses = schedule.emailAddresses.split(",");
            for (let i = 0; i < addresses.length; ++i) {
                if (!addresses[i].includes("@")) {
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
                retval.push(months[m]);
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
                retval.push(daysOfWeek[d]);
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


    const setEmails = (input) => {
        schedule.emailAddresses = [];

        if (input) {
            schedule.emailAddresses = input.split(",");
        }
        setToggle(!toggle);
    };

    return (
            <div className="static-modal">
                <Modal animation={false} 
                       show={config.show} 
                       onShow={onShow}
                       onHide={onHide}
                       backdrop={true} 
                       keyboard={true}>
                    <Modal.Header closeButton>
                        <Modal.Title as={MODAL_TITLE_SIZE}>{getTitle()}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="entrygrid-120-300">
                            <div className="label">{getText("Months:")}</div>
                            <div>
                                <MultiSelect options={months} value={getSelectedMonths()} onChange={selections => setMonths(selections)} valueRenderer={(selected) => multiSelectValueRenderer(selected)} />
                            </div>
                            <div className="label">{getText("Days of Month:")}</div>
                            <div>
                                <MultiSelect options={getDaysOfMonth()} value={(schedule && schedule.daysOfMonth) ? schedule.daysOfMonth : []} onChange={selections => setDaysOfMonth(selections)} valueRenderer={(selected) => multiSelectValueRenderer(selected)} />
                            </div>
                            <div className="label">{getText("Day of Week:")}</div>
                            <div>
                                <MultiSelect options={daysOfWeek} value={getSelectedDaysOfWeek()} onChange={selections => setDaysOfWeek(selections)} valueRenderer={(selected) => multiSelectValueRenderer(selected)} />
                            </div>
                            <div className="label">{getText("Hour:")}</div>
                            <div>
                                <MultiSelect options={getHoursOfDay()} value={getSelectedHoursOfDay()} onChange={selections => setHoursOfDay(selections)} valueRenderer={(selected) => multiSelectValueRenderer(selected)} />
                            </div>
                            <div className="label">{getText("Emails:")}</div><div><input type="text" size={40} defaultValue={(schedule && schedule.emailAddresses) ? schedule.emailAddresses.join(",") : ""} onBlur={e => setEmails(e.target.value)}/></div>
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
