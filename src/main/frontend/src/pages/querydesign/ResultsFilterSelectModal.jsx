/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import useMessage from "../../context/MessageContext";
import useQueryDesign from "../../context/QueryDesignContext";
import useLang from "../../context/LangContext";
import PropTypes from "prop-types";
import {MODAL_TITLE_SIZE, isNotEmpty, doSortCompare} from "../../utils/helper";


const ResultsFilterSelectModal = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const {queryResults, currentFilters, setCurrentFilters} = useQueryDesign();
    const {data, columnTypes, header} = queryResults;
    
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
                let val = r[config.columnIndex];
                if (isNotEmpty(val)) {
                    if (!s.has(val)) {
                        values.push(val);
                        s.add(val);
                    }
                } else {
                    haveEmpty = true;
                }
            });

            values.sort((a, b) => doSortCompare(columnTypes[config.columnIndex], a, b));
        }
        
        if (values.length > 0) {
            return values.map((v, indx) => {
                let id = "cb-" + indx;
                return <div><input id={id} name={v} type="checkbox" onChange={e => handleChecked(e, v)}/><label className="ck-label" htmlFor={id}>{v}</label></div>;
            }); 
        } else {
            return "";
        }
    };
    
    const getCheckboxes = () => {
        return document.querySelectorAll('input[type=checkbox]');
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
            
            let cf = {...currentFilters};
            cf[config.columnIndex] = selected;
            setCurrentFilters(cf);
        }
        
        onHide();
    };

    const onReset = () => {
        let cf = {...currentFilters};
        cf[config.columnIndex] = "";
        setCurrentFilters(cf);
        let ck = getCheckboxes();
        if (ck) {
            for (let i = 0; i < ck.length; ++i) {
                ck[i].checked = false;
            }
        }
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
                        <div className="filter-values">{getEntries()}</div>
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
