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
import {AiFillDelete, AiOutlineProfile} from "react-icons/ai";
import ColumnSelect from "./ColumnSelect";
import PropTypes from "prop-types";
import {
ERROR,
        SMALL_ICON_SIZE,
        MEDIUM_ICON_SIZE,
        MODAL_TITLE_SIZE,
        confirm,
        getUUID} from "../../utils/helper";

const CustomForeignKeys = (props) => {
    const {config} = props;
    const {authData, setAuthData} = useAuth();
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {showMessage} = useMessage();
    const {datasourceTableNames} = useDataHandler();
    const [customForeignKeys, setCustomForeignKeys] = useState([]);
    const [showColumnSelect, setShowColumnSelect] = useState({show: false});
    const [datasourceName, setDatasourceName] = useState(null);
    
    const getDatasourceName = () => {
        if (config.datasource) {
            return config.datasource.datasourceName;
        } else {
            return "";
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
        let cfks = [...customForeignKeys];
        let fk = cfks[indx];
        if (e.target.name === "imported") {
            fk.imported = e.target.checked;
        } else if ((e.target.name === "tableName") || (e.target.name === "toTableName")) {
            fk[e.target.name] = e.target.options[e.target.selectedIndex].value;
         } else {
            fk[e.target.name] = e.target.value;
        }
        
        setCustomForeignKeys(cfks);
    };

    const remove = async (indx) => {
        let cfk = [...customForeignKeys];
        if (await confirm(getText("Remove:", " " + cfk[indx].name + "?"))) {
            cfk.splice(indx, 1);
            setCustomForeignKeys(cfk);
        }
    };

    const getTableNameOptions = (val) => {
        return datasourceTableNames[datasourceName].map(t => {
            if (val === t.tableName) {
                return <option value={t.tableName} selected>{t.tableName}</option>;
            } else {
                return <option value={t.tableName}>{t.tableName}</option>;
            }
        });
    };

    const getTableSelect = (indx, field) => {
        return <select name={field} onChange={(e) => onChange(e, indx)}><option value=""></option>{getTableNameOptions(customForeignKeys[indx][field])}</select>;
    };

    const getColumnNames = (tableName) => {
        let tableObject = datasourceTableNames[datasourceName].find((t) => t.tableName === tableName);

        if (tableObject) {
            return tableObject.columnNames;
        } else {
            return [];
        }
    };

    const hideColumnSelect = () => {
        setShowColumnSelect({show: false});
    };

    const saveColumnSelections = (index, selectedColumns, field) => {
        let cfks = [...customForeignKeys];
        cfks[index][field] = selectedColumns;
        setCustomForeignKeys(cfks);
        hideColumnSelect();
    };


    const onColumnSelect = (indx, field, tableField) => {
        let tableName = customForeignKeys[indx][tableField];
        
        let columnNames = getColumnNames(tableName);
        let selectedColumns = customForeignKeys[indx][field] ? customForeignKeys[indx][field] : "";
        
         if (columnNames && (columnNames.length > 0)) {
            setShowColumnSelect({
                show: true,
                tableName: tableName,
                columnNames: columnNames,
                field: field,
                selectedColumns: selectedColumns,
                index: indx,
                saveColumnSelections: saveColumnSelections,
                hideColumnSelect: hideColumnSelect
            });
        }
    };

    const getColumnSelect = (indx, field, tableField) => {
        return <input size={25} name={field} defaultValue={customForeignKeys[indx][field] ? customForeignKeys[indx][field].join(",") : ""} readOnly onBlur={(e) => onChange(e, indx)}/>;
    };

    const loadForeignKeyEntries = () => {
        if (customForeignKeys && (customForeignKeys.length > 0)) {
            return customForeignKeys.map((fk, indx) => {
                return <div><div key={getUUID()} className="entrygrid-150-300 bord-b">
                        <div className="label"><span className="red-f">*</span>{getText("Name:")}</div><div><input size={30} name="name" type="text" defaultValue={fk.name} onBlur={(e) => onChange(e, indx)}/></div>
                        <div className="label"><span className="red-f">*</span>{getText("Source Table:")}</div><div>{getTableSelect(indx, "tableName")}</div>
                        <div className="label"><span className="red-f">*</span>{getText("Target Table:")}</div><div>{getTableSelect(indx, "toTableName")}</div>
                        <div className="label"><span className="red-f">*</span>{getText("Source Columns:")}</div>
                        <div className="entrygrid-25-275">
                            <div title={getText("select source columns")}>
                                <AiOutlineProfile  className="icon cobaltBlue-f" size={MEDIUM_ICON_SIZE} onClick={(e) => onColumnSelect(indx, "columns", "tableName")} />
                            </div>
                            {getColumnSelect(indx, "columns", "tableName")}
                        </div>
                        <div className="label"><span className="red-f">*</span>{getText("Target Columns:")}</div>
                        <div className="entrygrid-25-275">
                            <div title={getText("select target columns")}>
                                <AiOutlineProfile  className="icon cobaltBlue-f" size={MEDIUM_ICON_SIZE} onClick={(e) => onColumnSelect(indx, "toColumns", "toTableName")} />
                            </div>
                            {getColumnSelect(indx, "toColumns", "toTableName")}
                        </div>
                        <div className="label"></div><div><input name="imported" type="checkbox" defaultChecked={fk.imported} onChange={(e) => onChange(e, indx)} id={"imp-" + indx}/>
                            <label className="ck-label" htmlFor={"imp-" + indx}>{getText("Imported Keys")}</label>
                        </div>
                        <div className="label"></div><div>
                            <div title={getText("Remove entry")} style={{float: "right"}} ><AiFillDelete  className="icon-s crimson-f" size={SMALL_ICON_SIZE} onClick={(e) => remove(indx)} /></div>
                        </div>
                    </div>
                    <div><span className="red-f">*</span>{getText("indicates required field")}</div>
                    </div>;
            });
        } else {
            return <div>{getText("Click Add to add psuedo foreign keys")}</div>;
        }
    };

    const onShow = () => {
        if (config.datasource.customForeignKeys) {
            setCustomForeignKeys(config.datasource.customForeignKeys);
            setDatasourceName(getDatasourceName());
        }
    };
    
    const checkColumnLinks = (cfk) => {
        return (cfk.columns.length === cfk.toColumns.length);
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
            } else if (!checkColumnLinks(customForeignKeys[i])) {
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
                       onHide={onHide}
                       backdrop={true} 
                       keyboard={true}>
                    <Modal.Header closeButton>
                        <Modal.Title as={MODAL_TITLE_SIZE}><MdHelpOutline className="icon-s" size={SMALL_ICON_SIZE} onClick={(e) => onHelp()}/>
                            &nbsp;&nbsp;{getText("Custom Foreign Keys", " - ") + datasourceName }</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ColumnSelect config={showColumnSelect}/>
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
