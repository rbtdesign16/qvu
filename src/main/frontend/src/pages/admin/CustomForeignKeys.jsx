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
import {AiFillDelete} from "react-icons/ai";
import PropTypes from "prop-types";
import {
    ERROR,
    SMALL_ICON_SIZE,
    MODAL_TITLE_SIZE,
    confirm,
    getUUID} from "../../utils/helper";

const CustomForeignKeys = (props) => {
    const {config} = props;
    const {authData, setAuthData} = useAuth();
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {showMessage} = useMessage();
    const [customForeignKeys, setCustomForeignKeys] = useState([]);
    
    const getDatasourceName = () => {
        if (config.datasource) {
            return config.datasource.datasourceName;
        }
    };
        
    const onHelp = () => {
        showHelp(getText("customForeignKeys-help"));
    };
    
    const onHide = () => {
        if (config && config.hideCustomForeignKeys) {
            config.hideCustomForeignKeys();
        }
    };
    
    const addForeignKey = () => {
        let cfk = [...customForeignKeys];
        
        cfk.unshift({
            datasourceName: getDatasourceName(),
            name: "",
            tableName: "",
            toTableName: "",
            columns: "",
            toColumns: "",
            imported: false});
        setCustomForeignKeys(cfk);
    };   
    
    const onChange = (e, indx) => {
        let fk = customForeignKeys[indx];
        if (e.target.name === "imported") {
            fk.imported = e.target.checked;
        } else if ((e.target.name === "columns") || (e.target.name === "toColumns")) {
            let cols =  e.target.value.split(",");
            for (let i = 0; i < cols.length; ++i) {
                cols[i] = cols[i].trim();
            }
            fk[e.target.name] = cols;
        } else {
            fk[e.target.name] = e.target.value;
        }
    };
    
    const remove = async (indx) => {
        let cfk = [...customForeignKeys];
        if (await confirm(getText("Remove:", " " + cfk[indx].name + "?"))) {
          cfk.splice(indx, 1);
          setCustomForeignKeys(cfk);
      }
    };
        
    const loadForeignKeyEntries = () => {
        if (customForeignKeys && (customForeignKeys.length > 0)) {
            return customForeignKeys.map((fk, indx) => {
                 return <div key={getUUID()} className="entrygrid-150-200 bord-b">
                    <div className="label">{getText("Name:")}</div><div><input size={30} name="name" type="text" defaultValue={fk.name} onBlur={(e) => onChange(e, indx)}/></div>
                    <div className="label">{getText("Source Table:")}</div><div><input size={30} name="tableName" type="text" defaultValue={fk.tableName} onBlur={(e) => onChange(e, indx)}/></div>
                    <div className="label">{getText("Target Table:")}</div><div><input size={30} name="toTableName" type="text" defaultValue={fk.toTableName} onBlur={(e) => onChange(e, indx)}/></div>
                    <div className="label">{getText("Source Columns:")}</div><div><input size={30} name="columns" type="text" defaultValue={fk.columns ? fk.columns.join(",") : ""} onBlur={(e) => onChange(e, indx)}/></div>
                    <div className="label">{getText("Target Columns:")}</div><div><input size={30} name="toColumns" type="text" defaultValue={fk.toColumns ? fk.toColumns.join(",") : ""} onBlur={(e) => onChange(e, indx)}/></div>
                    <div className="label"></div><div><input name="imported" type="checkbox" defaultChecked={fk.imported} onChange={(e) => onChange(e, indx)} id={"imp-" + indx}/>
                        <label htmlFor={"imp-" + indx}>{getText("Imported Keys")}</label>
                        </div>
                    <div className="label"></div><div>
                    <div title={getText("Remove entry")} style={{float: "right"}} ><AiFillDelete  className="icon-s crimson-f" size={SMALL_ICON_SIZE} onClick={(e) => remove(indx)} /></div>
                    </div>
                </div>;
            });
        } else {
            return <div>{getText("Click Add to add psuedo foreign keys")}</div>;
        }
    };
    
    const onShow = () => {
        if (config.datasource.customForeignKeys) {
            setCustomForeignKeys(config.datasource.customForeignKeys);
        }
    };
    
    const checkValues = () => {
        let retval = "";
        for (let i = 0; i < customForeignKeys.length; ++i) {
            if (!customForeignKeys[i].name
                || !customForeignKeys[i].tableName
                || !customForeignKeys[i].toTableName
                || !customForeignKeys[i].columns
                || !customForeignKeys[i].toColumns) {
                retval = getText("please complete all required entries for entry[" + i + "]");
            } else if (customForeignKeys[i].columns.length !== customForeignKeys[i].toColumns.length) {
                retval = getText("Please ensure source columns and target columns contain same number of entries");
            }
            
            if (retval) {
                break;
            }
        }
        
        
        if (!retval) {
            let s = new Set();
            for (let i = 0; i < customForeignKeys.length; ++i) {
                if (s.has(customForeignKeys[i].name)) {
                    retval = getText("Duplicate name exists:", " " + customForeignKeys[i].name);
                    break;
                } else {
                    s.add(customForeignKeys[i].name);
                }
            }
        }
        
        return retval;
    };    

            
    const onSave = () => {
        let err = checkValues();
        if (!err) {
            let cfk = [...customForeignKeys];
            cfk.sort((a, b) => a.name - b.name);
            config.saveCustomForeignKeys(config.dataObject, cfk);
        } else {
            showMessage(ERROR, err);
        }
    };
    
    return (
        <div className="static-modal">
            <Modal animation={false} 
                   dialogClassName="custom-foreign-keys"
                   show={config.show} 
                   onShow={onShow}
                   backdrop={true} 
                   keyboard={true}>
                <Modal.Header onHide={onHide}>
                    <Modal.Title as={MODAL_TITLE_SIZE}><MdHelpOutline className="icon-s" size={SMALL_ICON_SIZE} onClick={(e) => onHelp()}/>
                    &nbsp;&nbsp;{getText("Custom Foreign Keys", " - ") + getDatasourceName() }</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{height: "400px", overflow: "auto"}}>{loadForeignKeyEntries()}</div>
                </Modal.Body>
                <Modal.Footer>
                    <Button size="sm" onClick={() => addForeignKey() }>{getText("Add")}</Button>
                    <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                    <Button size="sm" variant="primary" type="submit" onClick={() => onSave()}>{getText("Save")}</Button>
                </Modal.Footer>
            </Modal>
        </div>
        );
};
 
 CustomForeignKeys.propTypes = {
    config: PropTypes.object.isRequired
};

 
 export default CustomForeignKeys;
