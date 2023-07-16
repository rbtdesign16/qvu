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
    INFO,
    ERROR,
    DEFAULT_ERROR_TITLE,
    SMALL_ICON_SIZE,
    MODAL_TITLE_SIZE,
    findInArray} from "../../utils/helper";
import {
    loadColumnSettings,
    isApiSuccess,
    isApiError} from "../../utils/apiHelper";

const TableSettings = (props) => {
    const {config} = props;
    const {authData, setAuthData} = useAuth();
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {datasources, setDatasources, databaseTypes} = useDataHandler();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const [datasource, setDatasource] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [columnSettings, setColumnSettings] = useState({show: false});

    const setTableRoles = (indx, selections) => {
        if (selections) {
            let d = {...datasource};
            if (!d.datasourceTables[indx].roles) {
                d.datasourceTables[indx].roles = [];
            } else {
                d.datasourceTables[indx].roles.length = 0;
            }
            selections.map(s => d.datasourceTables[indx].roles.push(s.value));
            
            setDatasource(d);
        }
    };

    const getTableRoles = (indx) => {
        let retval = [];

        if (datasource.datasourceTables[indx].roles) {
            datasource.datasourceTables[indx].roles.map(r => retval.push({label: r, value: r}));
        }

        return retval;    
    };
    
    const getDatasourceName = () => {
        if (datasource) {
            return datasource.datasourceName;
        }
    };
        
    const onHelp = () => {
        showHelp(getText("tableSettings-help"));
    };
    
    const getAvailableRoles = () => {
        let retval = [];

        if (authData.allRoles) {
            authData.allRoles.map(r => retval.push({label: r.name, value: r.name}));
        }

        return retval;
    };
    
    const onHide = () => {
        if (config && config.hideTableSettings) {
            config.hideTableSettings();
        }
    };
    
    const getDisplayName = (indx) => {
        return datasource.datasourceTables[indx].displayName;
    };

    const setDisplayName = (e, indx) => {
        let d = {...datasource};
        d.datasourceTables[indx].displayName = e.target.value;
        setDatasource(d);
    };
    
    const rolesValueRenderer = (selected) => {
        if (selected.length > 0) {
            return getText("Role(s) selected");
        } else {
            return getText("Select roles...");
        }
    };
    
    const isHidden = (indx) => {
        return datasource.datasourceTables[indx].hide;
    };
    
    const setHidden = (e, indx) => {
        let d = {...datasource};
        d.datasourceTables[indx].hide = e.target.checked;
        setDatasource(d);
    };
    
    const hideColumnSettings = () => {
        setColumnSettings({show: false});
    };

    const saveColumnSettings = (table) => {
        let d = {...datasource};
        
        if (!datasource.datasourceTableSettings) {
            datasource.datasourceTableSettings = [];
        }
        
        let t = findInArray(d.datasourceTableSettings, "tableName", table.tableName);

        if (!t) {
            d.datasourceTableSettings.push(table);
        } else {
            t.tableColumnSettings = table.tableColumnSettings;
        }
        
        setDatasource(d);
        
        setColumnSettings({show: false});
    };

    const showColumnSettings = async (indx) => {
        showMessage(INFO, getText("Loading columns settings" , "..."), null, true);
        let res = await loadColumnSettings(config.datasource, datasource.datasourceTables[indx].tableName);
        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            let t = {...datasource.datasourceTables[indx]};
            let csMap = new Map();

            t.tableColumnSettings.map(c => {
                csMap.set(c.columnName, c);
            });

            let c = [];

            res.result.map(tres => {
                let curc = csMap.get(tres.columnName);
                if (curc) {
                    c.push(curc);
                } else {
                    c.push(tres);
                }
            });

            hideMessage();
            t.tableColumnSettings = c;
            setColumnSettings({show: true, table: t, columns: res.result, hideColumnSettings: hideColumnSettings, saveColumnSettings: saveColumnSettings});
            hideMessage();
        }
    };

    const loadTableEntries = () => {
        if (datasource && datasource.datasourceTables) {
            return datasource.datasourceTables.map((t, indx) => {
                return <div key={"tset" + indx} className="entrygrid-120-300 bord-b">
                    <div className="label">{getText("Table:")}</div><div className="display-field">{t.tableName}</div>
                    <div className="label">{getText("Display Name:")}</div>
                    <div className="display-field">
                        <input type="text" size={35} defaultValue={getDisplayName(indx)} onBlur={(e) => setDisplayName(e, indx)}/>
                    </div>
                    <div className="label">{getText("Roles:")}</div><div className="display-field">
                        <MultiSelect options={availableRoles}  
                            value={getTableRoles(indx)} 
                            hasSelectAll={false} 
                            onChange={(selectedItems) => setTableRoles(indx, selectedItems)} 
                            valueRenderer={(selected, options) => rolesValueRenderer(selected)} />
                    </div>
                    <div></div><div className="display-field"><input type="checkbox" defaultChecked={isHidden(indx)} onChange={(e) => setHidden(e, indx)}/><span className="ck-label">{getText("Hide")}</span></div>
                    <div></div><div className="display-field"><Button size="sm" onClick={(e) => showColumnSettings(indx)}>{getText("Column Settings")}</Button></div>;
                </div>
            });       
        } else {
            return "";
        }
    };
    
    const onShow = () => {
        setAvailableRoles(getAvailableRoles());
        setDatasource(config.datasource);
    };
    
    return (
        <div className="static-modal">
            <ColumnSettings config={columnSettings}/>
            <Modal animation={false} 
                   dialogClassName="table-settings"
                   show={config.show} 
                   onShow={onShow}
                   onHide={onHide}
                   backdrop={true} 
                   keyboard={true}>
                   <Modal.Header >closeButton
                    <Modal.Title as={MODAL_TITLE_SIZE}><MdHelpOutline className="icon-s" size={SMALL_ICON_SIZE} onClick={(e) => onHelp()}/>
                    &nbsp;&nbsp;{getText("Table Settings", " - ") + getDatasourceName() }</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{height: "400px", overflow: "auto"}}>{loadTableEntries()}</div>
                </Modal.Body>
                <Modal.Footer>
                    <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                    <Button size="sm" variant="primary" type="submit" onClick={() => config.saveTableSettings(config.dataObject, datasource)}>{getText("Save")}</Button>
                </Modal.Footer>
            </Modal>
        </div>
        );
};
 
 TableSettings.propTypes = {
    config: PropTypes.object.isRequired
};

 
 export default TableSettings;
