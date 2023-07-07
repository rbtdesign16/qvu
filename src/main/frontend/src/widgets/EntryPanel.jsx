import React, {useState} from "react";
import Button from "react-bootstrap/Button"
import useLang from "../context/LangContext";
import { MultiSelect } from "react-multi-select-component";
import { MdHelpOutline } from 'react-icons/md';
import { SMALL_ICON_SIZE } from "../utils/helper"
import PropTypes from "prop-types";

const EntryPanel = (props) => {
    const {entryConfig, dataObject, buttons, idPrefix, afterChange, gridClass} = props.config;
    const [toggle, setToggle] = useState(false);
    const {getText} = useLang();
    const loadOptions = (curval, options) => {
        return options.map((o) => {
            if (curval === o) {
                return <option value={o} selected>{o}</option>;
            } else {
                return <option value={o}>{o}</option>;
            }
        });
    };

    const onChange = (e, c) => {
        if (e.target.options) {
            dataObject[e.target.name] = e.target.options[e.target.selectedIndex].value;
        } else if (e.target.type === "checkbox") {
            dataObject[e.target.name] = e.target.checked;
        } else {
            dataObject[e.target.name] = e.target.value;
        }

        if (afterChange) {
            // if true need to refresh
            if (afterChange(e, entryConfig, dataObject)) {
                setToggle(!toggle);
            }
        }
    };

    const getInputField = (c) => {
        if (c.key && !dataObject.newRecord) {
            return dataObject[c.name];
        } else {
            let id = idPrefix + c.name;
            if (!c.style) {
                c.style = {};
            }
            switch (c.type) {
                case "input":
                    return <input name={c.name} id={id} type="text" size={c.size ? c.size : 30} style={c.style} onChange={e => onChange(e)} disabled={c.disabled} defaultValue={dataObject[c.name]}/>;
                case "password":
                    return <input name={c.name} id={id}  type="password" size={c.size ? c.size : 20} style={c.style} onChange={e => onChange(e)} disabled={c.disabled} defaultValue={dataObject[c.name]}/>;
                case "select":
                    return <select name={c.name}  id={id} onChange={e => onChange(e)} style={c.style} disabled={c.disabled} >{loadOptions(dataObject[c.name], c.options)}</select>;
                case "number":
                    return <input name={c.name}  id={id} type="number" onChange={e => onChange(e)} defaultValue={dataObject[c.name]} disabled={c.disabled} style={c.style}  />;
                case "date":
                    return <input name={c.name} id={id}  type="date" onChange={e => onChange(e)} defaultValue={dataObject[c.name]} disabled={c.disabled} style={c.style} />;
                case "email":
                    return <input name={c.name} id={id}  type="email" size={20} onChange={e => onChange(e)} defaultValue={dataObject[c.name]} style={c.style} disabled={c.disabled}/>;
                case "checkbox":
                    return <input name={c.name}  id={id} type="checkbox" onChange={e => onChange(e)} defaultChecked={dataObject[c.name]} disabled={c.disabled} style={c.style} />;
                case "textarea":
                    return <textarea name={c.name}  id={id} cols={30} rows={2} onChange={e => onChange(e)} defaultValue={dataObject[c.name]} disabled={c.disabled} style={c.style}  />;
                case "file":
                    return <input name={c.name} id={id} type="file" size={40} onChange={e => onChange(e)} defaultValue={dataObject[c.name]} disabled={c.disabled} style={c.style} />;
                case "label":
                    return <span className="read-only-data" style={c.style} >{c.text}</span>;
                case "button":
                    return <Button size="sm" onClick={(e) => c.onClick(c)}>{c.label}</Button>;
                case "multiselect":
                    return <MultiSelect options={c.options()}  value={c.getSelected(dataObject)} hasSelectAll={c.hasSelectAll} onChange={(selectedItems) => onMultiSelectChange(selectedItems, c, dataObject)} valueRenderer={(selected, options) => multiSelectValueRenderer(c, dataObject, selected, options)} />;
            }
        }
    };
    
    const multiSelectValueRenderer = (c, dataOBject, selected, options) => {
        if (c.valueRenderer) {
            return c.valueRenderer(c, dataOBject, selected, options);
        } else {
            if (selected.length > 0) {
                return getText("Item(s) selected");
            } else {
                getText("Select...");
            }    
        } 
    };
    
    const onMultiSelectChange = (selections, c, dataObject) => {
        c.setSelected(dataObject, selections); 
        setToggle(!toggle); 
    };

    const isButtonDisabled = (b) => {
        if (b.disabled) {
            if (typeof b.disabled === "function") {
                return b.disabled(dataObject);
            } else {
                return b.disabled;
            }
        }
    };
    
    const loadButtons = () => {
        return buttons.map(b => {
            return  <Button  size="sm"  disabled={isButtonDisabled(b)} style={{marginLeft: "10px"}} onClick={() => b.onClick(dataObject)}  id={b.id} >{b.text}</Button>;

        });
    };

    const getGridClass = () => {
        if (gridClass) {
            return gridClass;
        } else {
            return "entrygrid-150-200";
        }
    };

    const getLabel = (c) => {
        if (c.type === "checkbox") {
            if (c.showHelp) {
                return <div style={{textAlign: "right", verticalAlign: "middle"}}><MdHelpOutline className="icon-s" size={SMALL_ICON_SIZE} onClick={(e) => c.showHelp(c.helpText)}/></div>;
            } else {
                return <div/>;
            }
        } else {
            if (c.showHelp) {
                return  <div className="label">
                    <MdHelpOutline className="icon-s" size={SMALL_ICON_SIZE} onClick={(e) => c.showHelp(c.helpText)}/>&nbsp;&nbsp;
                    {c.required && <span className="red-f">*</span>}{c.label}</div>;
            } else {
                return <div className="label">{c.required && <span className="red-f">*</span>}{c.label}</div>;
            }
        }
    };

    const getChildEntries = (entries) => {
        return entries.map(e => {
            return <span style={{paddingLeft: "10px"}}>{getInputField(e)}</span>;
        });
    };

    const getEntry = (c) => {
        if (c.type === "checkbox") {
            return <div className="display-field">{getInputField(c)}<label htmlFor={idPrefix + c.name} style={{paddingLeft: "3px", cursor: "pointer"}}>{c.label}</label></div>;
        } else {
            return <div className="display-field">{getInputField(c)}{c.entryConfig && getChildEntries(c.entryConfig)}</div>;
        }
    };

    const loadEntryFields = () => {
        return entryConfig.map(c => {
            if (!c.hide || !c.hide()) {
                return <div className={getGridClass()}>
                    { getLabel(c) }
                    { getEntry(c) }

                </div>;
            } else {
                return "";
            }
        });
    };

    const haveRequiredFields = () => {
        for (let i = 0; i < entryConfig.length; ++i) {
            if (entryConfig[i].required) {
                return true;
            }
        }
    };

    return (
            <div>
                { loadEntryFields() }
                {haveRequiredFields() && <div><span className="red-f">*</span>{getText("indicates required field")}</div>}
                {buttons ? <div className="btn-bar">{ loadButtons()}</div> : ""}
            </div>);
};

EntryPanel.propTypes = {
    config: PropTypes.object.isRequired
};

export default EntryPanel;
