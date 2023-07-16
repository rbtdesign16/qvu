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
    getUUID} from "../../utils/helper";

const ColumnSelect = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const [columns, setColumns] = useState([]);
    const [columnSelections, setColumnSelections] = useState([]);
    
    const onHelp = () => {
        showHelp(getText("customForeignKeyColumnSelect-help"));
    };
    
    const onHide = () => {
        if (config && config.hideColumnSelect) {
            config.hideColumnSelect();
        }
    };
    
            
    const onSave = () => {
        config.saveColumnSelections(config.index, columnSelections, config.field);
    };
    
    const onChange = (e, indx) => {
        let cols = [...columnSelections];
        
        if (e.target.checked && !cols.includes(columns[indx])) {
            cols.push(columns[indx]);
        } else if (!e.target.checked && cols.includes(columns[indx])) {
            let cindx = cols.findIndex(c => (c === columns[indx]));
            if (cindx > -1) {
                cols.splice(cindx, 1);
            }
        }
        
        setColumnSelections(cols);
    };
           
    const isSelected = (c) => {
        return columnSelections && columnSelections.includes(c);
    };
    
    const loadColumns = () => {
        if (columns) {
             return columns.map((c, indx) => {
                let id = "c-" + indx;
               return <div className="column-select"><input id={id} type="checkbox" checked={isSelected(c)} onChange={e => onChange(e, indx)}  /><label className="ck-label" htmlFor={id}>{c}</label></div>;
            });
        } else {
            return "";
        }
    };
    
    const onShow = () => {
        let scols = [];
        if (config && config.selectedColumns) {
            scols = config.selectedColumns;
        } 

        setColumnSelections(scols);
        setColumns(config.columnNames);
    };
    
    return (
        <div className="static-modal">
            <Modal animation={false} 
                   show={config.show} 
                   onShow={onShow}
                   onHide={onHide}
                   backdrop={false} 
                   keyboard={true}>
                <Modal.Header closeButton>
                    <Modal.Title as={MODAL_TITLE_SIZE}><MdHelpOutline className="icon-s" size={SMALL_ICON_SIZE} onClick={(e) => onHelp()}/>
                    &nbsp;&nbsp;{getText("Column select for", " ") + config.tableName }</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{height: "400px", overflow: "auto"}}>{loadColumns()}</div>
                </Modal.Body>
                <Modal.Footer>
                    <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                    <Button size="sm" variant="primary" type="submit" onClick={() => onSave()}>{getText("Save")}</Button>
                </Modal.Footer>
            </Modal>
        </div>
        );
};
 
 ColumnSelect.propTypes = {
    config: PropTypes.object.isRequired
};

 
 export default ColumnSelect;
