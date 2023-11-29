import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import useMessage from "../../context/MessageContext";
import useQueryDesign from "../../context/QueryDesignContext";
import useLang from "../../context/LangContext";
import PropTypes from "prop-types";
import {MODAL_TITLE_SIZE, isNotEmpty, doSortCompare, copyObject} from "../../utils/helper";


const ResultsFilterSelectModal = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const {queryResults, currentFilters, setCurrentFilters, isRowHidden} = useQueryDesign();
    const {data, columnTypes, header} = queryResults;

    const EMPTY_FILTER_VALUE = getText("empty-filter-value");

    const getTitle = () => {
        if (config && header && config.columnIndex) {
            return getText("Filter for", " " + header[config.columnIndex]);
        } else {
            return "";
        }
    };

    const onHide = () => {
        config.hide();
    };

    const onShow = () => {
        if (currentFilters[config.columnIndex]) {
            let ck = getCheckboxes();
            for (let i = 0; i < ck.length; ++i) {
                ck[i].checked = currentFilters[config.columnIndex].includes(ck[i].name);
            }
        }
    };

    const getEntries = () => {
        let values = [];
        let haveEmpty = false;
        let s = new Set();

        if (data) {
            data.map(r => {
                if (!isRowHidden(r)) {
                    let val = r[config.columnIndex];
                    if (isNotEmpty(val)) {
                        if (!s.has(val)) {
                            values.push(val);
                            s.add(val);
                        }
                    } else {
                        haveEmpty = true;
                    }
                }
            });

            values.sort((a, b) => doSortCompare(columnTypes[config.columnIndex], a, b));

            if (haveEmpty) {
                values.splice(0, 0, getText("empty-filter-value"));
            }
        }

        if (values.length > 0) {
            return values.map((v, indx) => {
                let id = "cb-" + indx;
                return <div><input id={id} name={v} type="checkbox"/><label className="ck-label" htmlFor={id}>{v}</label></div>;
            });
        } else {
            return "";
        }
    };

    const getCheckboxes = () => {
        return document.getElementById("fvals").querySelectorAll("input[type=checkbox]");
    };

    const onApply = () => {
        let selected = [];
        let ck = getCheckboxes();
        if (ck) {
            for (let i = 0; i < ck.length; ++i) {
                if (ck[i].checked) {
                    selected.push(ck[i].name);
                }
            }

            let cf = copyObject(currentFilters);
            cf[config.columnIndex] = selected;

            config.setFilters(cf);
        }
    };

    const onReset = () => {
        let cf = copyObject(currentFilters);
        cf[config.columnIndex] = "";
        let ck = getCheckboxes();
        if (ck) {
            for (let i = 0; i < ck.length; ++i) {
                ck[i].checked = false;
            }
        }
        
        config.setFilters(cf);
    };

    return (
            <div className="static-modal">
                <Modal animation={false} 
                       show={config.show} 
                       onShow={onShow}
                       onHide={onHide}>
                    <Modal.Header closeButton>
                        <Modal.Title as={MODAL_TITLE_SIZE}>{getTitle()}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div id="fvals" className="filter-values">{getEntries()}</div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                        <Button size="sm" onClick={() => onReset() }>{getText("Reset")}</Button>
                        <Button size="sm" variant="primary" type="submit" onClick={() => onApply()}>{getText("Apply")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            );
};

ResultsFilterSelectModal.propTypes = {
    config: PropTypes.object.isRequired
};

export default ResultsFilterSelectModal;
