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
    SMALL_ICON_SIZE} from "../../utils/helper";
import {
    loadTableAccess,
    isApiSuccess,
    isApiError} from "../../utils/apiHelper";

const TableAccess = (props) => {
    const {config} = props;
    const {authData, setAuthData} = useAuth();
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {datasources, setDatasources, databaseTypes} = useDataHandler();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const [tables, setTables] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);
    
   const setTableRoles = (indx, selections) => {
        if (selections) {
            let t = [...tables]
            if (!t[indx].roles) {
                t[indx].roles = [];
            } else {
                t[indx].roles.length = 0;
            }
            selections.map(s => t[indx].roles.push(s.value));
            
            setTables(t);
        }
    };

    
    const getTableRoles = (indx) => {
        let retval = [];

        if (tables[indx].roles) {
            tables[indx].roles.map(r => retval.push({label: r, value: r}));
        }

        return retval;    
    };
    
    const getDatasourceName = () => {
        if (config && config.datasource) {
            return config.datasource.datasourceName;
        } else {
            return "";
        }
    };
        
    const onHelp = () => {
        showHelp(getText("tableRoles-help"));
    };
    
    const getAvailableRoles = () => {
        let retval = [];

        if (authData.allRoles) {
            authData.allRoles.map(r => retval.push({label: r.name, value: r.name}));
        }

        return retval;
    };
    
    const loadTableInfo = async () => {
        showMessage(INFO, getText("Loading table access", "..."), null, true);
        
        let res = await loadTableAccess(config.datasource);
        
        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            hideMessage();
        }
          
        setAvailableRoles(getAvailableRoles());
        setTables(res.result);

    };

    const onHide = () => {
        if (config && config.hideTableAccess) {
            config.hideTableAccess();
        }
    };
    
    const rolesValueRenderer = (selected) => {
        if (selected.length > 0) {
            return getText("Role(s) selected");
        } else {
            return getText("Select roles...");
        }
    };

    const loadTableEntries = () => {
        if (tables) {
            return tables.map((t, indx) => {
                return <div className="entrygrid-100-175 bord-b">
                    <div className="label">{getText("Table:")}</div><div className="display-field">{t.tableName}</div>
                    <div className="label">{getText("Roles:")}</div><div className="display-field">
                        <MultiSelect options={availableRoles}  
                            value={getTableRoles(indx)} 
                            hasSelectAll={false} 
                            onChange={(selectedItems) => setTableRoles(indx, selectedItems)} 
                            valueRenderer={(selected, options) => rolesValueRenderer(selected)} />
                    </div>
                </div>
            });       
        } else {
            return "";
        }
    };
    
    return (
        <div className="static-modal">
            <Modal animation={false} 
                   dialogClassName="table-access"
                   show={config.show} 
                   onShow={loadTableInfo}
                   backdrop={true} 
                   keyboard={true}>
                <Modal.Header onHide={onHide}>
                    <Modal.Title><MdHelpOutline className="icon-s" size={SMALL_ICON_SIZE} onClick={(e) => onHelp()}/>
                    &nbsp;&nbsp;{getText("Table Access", " - ") + getDatasourceName() }</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{height: "400px", overflow: "auto"}}>{loadTableEntries()}</div>
                </Modal.Body>
                <Modal.Footer>
                    <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                    <Button size="sm" variant="primary" type="submit" onClick={() => config.saveTableAccess()}>{getText("Save")}</Button>
                </Modal.Footer>
            </Modal>
        </div>
        );
};
 
 TableAccess.propTypes = {
    config: PropTypes.object.isRequired
};

 
 export default TableAccess;
