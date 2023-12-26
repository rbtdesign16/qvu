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
    CUSTOM_FK_DATA_SEPARATOR,
    copyObject } from "../../utils/helper";

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
        let cols = copyObject(columnSelections);
        let sel = findColumnSelection(columns[indx]);

        if (e.target.checked && !sel) {
            cols.push({name: columns[indx], custom: ""});
        } else if (!e.target.checked && sel) {
            let cindx = cols.findIndex(c => (c.name === columns[indx]));
            if (cindx > -1) {
                cols.splice(cindx, 1);
            }
        }

        if (!e.target.checked) {
            let id = config.field + "-inp=" + indx;
            let el = document.getElementById(id)
                    
            if (el) {
                el.value = "";
            }
        }

        setColumnSelections(cols);
    };

    const onCustomColumn = (e, c) => {
        let sel = findColumnSelection(c);

        if (sel) {
            sel.custom = e.target.value;
        }

    };

    const isSelected = (c) => {
        let retval = columnSelections && findColumnSelection(c);
        return retval;
    };

    const findColumnSelection = (c) => {
        if (columnSelections) {
            return columnSelections.find(e => e.name === c);
        }
    };

    const getCustomValue = (c) => {
        let sel = findColumnSelection(c);

        if (sel) {
            return sel.custom;
        }
    };

    const loadColumns = () => {
        if (columns) {
            return columns.map((c, indx) => {
                let id1 = config.field + "-c-" + indx;
                let id2 = config.field + "-inp-" + indx;
                return <div className="entrygrid-175-100">
                    <div className="column-select">
                        <input id={id1} type="checkbox" name={c} checked={isSelected(c)} onChange={e => onChange(e, indx)}  />
                        <label className="ck-label" htmlFor={id1}>{c}</label>
                    </div>
                    <div>
                        <input type="text" id={id2} disabled={!config.allowCustom || !isSelected(c)} size={10} defaultValue={getCustomValue(c)} onBlur={e => onCustomColumn(e, c)} />
                    </div>
                </div>;
            });
        } else {
            return "";
        }
    };

    const onShow = () => {
        
        for (let i = 0; i < config.columnNames.length; ++i) {
            let el = document.getElementById(config.field + "-c-" + i);
            if (el) {
                el.checked = false;
            }

            el = document.getElementById(config.field + "-inp-" + i);
            if (el) {
                el.value = "";
            }
}
        
        setColumns(config.columnNames);

        let sel = [];

        if (config.selectedColumns && config.selectedColumns.map) {
            config.selectedColumns.map(c => {
                let pos = c.indexOf(CUSTOM_FK_DATA_SEPARATOR);
                if (pos > 0) {
                    sel.push({name: c.substring(0, pos), custom: c.substring(pos + 1)});
                } else {
                    sel.push({name: c});
                }
            });
        }
        
        setColumnSelections(sel);
    };

    return (
            <div className="static-modal">
                <Modal animation={false} 
                       show={config.show} 
                       onShow={onShow}
                       onHide={onHide}
                       backdrop={false}>
                    <Modal.Header closeButton>
                        <Modal.Title as={MODAL_TITLE_SIZE}><MdHelpOutline className="icon" size={SMALL_ICON_SIZE} onClick={(e) => onHelp()}/>
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
