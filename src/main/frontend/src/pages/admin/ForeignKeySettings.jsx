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

const ForeignKeySettings = (props) => {
    const {config} = props;
    const {authData, setAuthData} = useAuth();
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {datasources, setDatasources, databaseTypes} = useDataHandler();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const [table, setTable] = useState(null);
    const [availableRoles, setAvailableRoles] = useState([]);
    
    
    const onHide = () => {
        if (config && config.hideForeignKeySettings) {
            config.hideForeignKeySettings();
        }
    };
    
    const getDisplayName = (indx) => {
        return table.foreignKeySettings[indx].displayName;
    };

    const getTableName = () => {
        if (table) {
            return table.tableName;
        } else {
            return "";
        }
    };
    const setDisplayName = (e, indx) => {
        let t = {...table};
        t.foreignKeySettings[indx].displayName = e.target.value;
        setTable(t);
    };
    
    const getFieldName = (indx) => {
        return table.foreignKeySettings[indx].fieldName;
    };

    const setFieldName = (e, indx) => {
        let t = {...table};
        t.foreignKeySettings[indx].fieldName = e.target.value;
        setTable(t);
    };
    
    const buildColumns = (fk) => {
        let retval = "";
        let comma = "";
        for (let i = 0; i < fk.columns.length; ++i) {
            retval += (comma + fk.columns[i] + "->" + fk.toColumns[i]);
            comma = ",";
        }
        
        return retval;
    };

    const loadForeignKeyEntries = () => {
        if (table && table.foreignKeySettings) {
            return table.foreignKeySettings.map((fk, indx) => {
                return <div key={"fkset" + indx} className="entrygrid-145-300 bord-b">
                    <div className="label">{getText("Name:")}</div><div className="display-field">{fk.foreignKeyName}</div>
                    <div className="label">{getText("Type:")}</div><div className="display-field">{fk.type}</div>
                    <div className="label">{getText("To Table:")}</div><div className="display-field">{fk.toTableName}</div>
                    <div className="label">{getText("Column Mappings:")}</div><div className="display-field">{buildColumns(fk)}</div>
                    <div className="label">{getText("Display Name:")}</div>
                    <div className="display-field">
                        <input type="text" size={35} defaultValue={getDisplayName(indx)} onBlur={(e) => setDisplayName(e, indx)}/>
                    </div>
                    <div className="label">{getText("Field Name:")}</div>
                    <div className="display-field">
                        <input type="text" size={35} defaultValue={getFieldName(indx)} onBlur={(e) => setFieldName(e, indx)}/>
                    </div>
                </div>
            });       
        } else {
            return "";
        }
    };
    
    const onHelp = () => {
        showHelp(getText("foreignKeySettings-help"));
    };
    
    const onShow = () => {
        setTable(config.table);
    };
    
    return (
        <div className="static-modal">
            <Modal animation={false} 
                   dialogClassName="foreignkey-settings"
                   show={config.show} 
                   onShow={onShow}
                   onHide={onHide}
                   backdrop={true} 
                   keyboard={true}>
                <Modal.Header closeButton>
                    <Modal.Title as={MODAL_TITLE_SIZE}><MdHelpOutline className="icon" size={SMALL_ICON_SIZE} onClick={(e) => onHelp()}/>
                    &nbsp;&nbsp;{getText("Foreign Key Settings", " - ") + getTableName() }</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{height: "400px", overflow: "auto"}}>{loadForeignKeyEntries()}</div>
                </Modal.Body>
                <Modal.Footer>
                    <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                    <Button size="sm" variant="primary" type="submit" onClick={() => config.saveForeignKeySettings(table)}>{getText("Save")}</Button>
                </Modal.Footer>
            </Modal>
        </div>
        );
};
 
 ForeignKeySettings.propTypes = {
    config: PropTypes.object.isRequired
};

 
 export default ForeignKeySettings;
