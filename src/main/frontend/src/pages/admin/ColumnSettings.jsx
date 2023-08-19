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
import { MultiSelect } from "react-multi-select-component";
import { MdHelpOutline } from 'react-icons/md';
import PropTypes from "prop-types";
import {
    INFO,
    ERROR,
    DEFAULT_ERROR_TITLE,
    SMALL_ICON_SIZE,
    MODAL_TITLE_SIZE} from "../../utils/helper";
import {
    loadTableSettings,
    isApiSuccess,
    isApiError} from "../../utils/apiHelper";

const ColumnSettings = (props) => {
    const {config} = props;
    const {authData, setAuthData} = useAuth();
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {datasources, setDatasources, databaseTypes} = useDataHandler();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const [table, setTable] = useState(null);
    const [availableRoles, setAvailableRoles] = useState([]);
    
   const setColumnRoles = (indx, selections) => {
        if (selections) {
            let t = {...table};
            if (!t.tableColumnSettings[indx].roles) {
                t.tableColumnSettings[indx].roles = [];
            } else {
                t.tableColumnSettings[indx].roles.length = 0;
            }
            selections.map(s => t.tableColumnSettings[indx].roles.push(s.value));
            setTable(t);
        }
    };

    const getColumnRoles = (indx) => {
        let retval = [];

        if (table.tableColumnSettings[indx].roles) {
            table.tableColumnSettings[indx].roles.map(r => retval.push({label: r, value: r}));
        }

        return retval;    
    };
    
    const getTableName = () => {
        if (table) {
            return table.tableName;
        } else {
            return "";
        }
    };
        
    const onHelp = () => {
        showHelp(getText("columnSettings-help"));
    };
    
    const getAvailableRoles = () => {
        let retval = [];

        if (authData.allRoles) {
            authData.allRoles.map(r => retval.push({label: getText(r.name), value: r.name}));
        }

        return retval;
    };
    
    const onHide = () => {
        if (config && config.hideColumnSettings) {
            config.hideColumnSettings();
        }
    };
    
    const getDisplayName = (indx) => {
        return table.tableColumnSettings[indx].displayName;
    };

    const setDisplayName = (e, indx) => {
        let t = {...table};
        t.tableColumnSettings[indx].displayName = e.target.value;
        setTable(t);
    };
    
    const rolesValueRenderer = (selected) => {
        if (selected.length > 0) {
            return getText("Role(s) selected");
        } else {
            return getText("Select roles...");
        }
    };
    
    const isHidden = (indx) => {
        return table.tableColumnSettings[indx].hide;
    };
    
    const setHidden = (e, indx) => {
        let t = {...table};
        t.tableColumnSettings[indx].hide = e.target.checked;
        setTable(t);
    };

    const loadColumnEntries = () => {
        if (table && table.tableColumnSettings) {
            return table.tableColumnSettings.map((c, indx) => {
                return <div key={"cset" + indx} className="entrygrid-120-300 bord-b">
                    <div className="label">{getText("Column:")}</div><div className="display-field">{c.columnName}</div>
                    <div className="label">{getText("Display Name:")}</div>
                    <div className="display-field">
                        <input type="text" size={35} defaultValue={getDisplayName(indx)} onBlur={(e) => setDisplayName(e, indx)}/>
                    </div>
                    <div className="label">{getText("Roles:")}</div><div className="display-field">
                        <MultiSelect options={availableRoles}  
                            value={getColumnRoles(indx)} 
                            hasSelectAll={false} 
                            onChange={(selectedItems) => setColumnRoles(indx, selectedItems)} 
                            valueRenderer={(selected, options) => rolesValueRenderer(selected)} />
                    </div>
                    <div></div><div className="display-field"><input type="checkbox" defaultChecked={isHidden(indx)} onChange={(e) => setHidden(e, indx)}/><span className="ck-label">{getText("Hide")}</span></div>
                </div>
            });       
        } else {
            return "";
        }
    };
    
    const onShow = () => {
        setAvailableRoles(getAvailableRoles());
        setTable(config.table);
    };
    
    return (
        <div className="static-modal">
            <Modal animation={false} 
                   dialogClassName="column-settings"
                   show={config.show} 
                   onShow={onShow}
                   onHide={onHide}
                   backdrop={true} 
                   keyboard={true}>
                <Modal.Header closeButton>
                    <Modal.Title as={MODAL_TITLE_SIZE}><MdHelpOutline className="icon" size={SMALL_ICON_SIZE} onClick={(e) => onHelp()}/>
                    &nbsp;&nbsp;{getText("Column Settings", " - ") + getTableName() }</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{height: "400px", overflow: "auto"}}>{loadColumnEntries()}</div>
                </Modal.Body>
                <Modal.Footer>
                    <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                    <Button size="sm" variant="primary" type="submit" onClick={() => config.saveColumnSettings(table)}>{getText("Save")}</Button>
                </Modal.Footer>
            </Modal>
        </div>
        );
};
 
 ColumnSettings.propTypes = {
    config: PropTypes.object.isRequired
};

 
 export default ColumnSettings;
