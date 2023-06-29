import React, {useState} from "react";
import Button from "react-bootstrap/Button"
import { MdHelpOutline } from 'react-icons/md';
import PropTypes from "prop-types";

const EntryPanel = (props) => {
    const {entryConfig, dataObject, buttons, idPrefix, changeHandler, gridClass} = props.config;

    const loadOptions = (curval, options) => {
        return options.map((o) => {
            if (curval === o) {
                return <option value={o} selected>{o}</option>;
            } else {
                return <option value={o}>{o}</option>;
            }
        });
    };
    
    const onChange = (e) => {
        if (changeHandler) {
            changeHandler(e);
        } else {
            if (e.target.options) {
                dataObject[e.target.name] = e.target.options[e.target.selectedIndex].value;
            } else if (e.target.type === "checkbox") {
                dataObject[e.target.name] = e.target.checked;
            } else {
                dataObject[e.target.name] = e.target.value;
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
                    return <input name={c.name} id={id} type="text" size={30} style={c.style} onChange={e => onChange(e)} disabled={c.disabled} value={dataObject[c.name]}/>;
                case "password":
                    return <input name={c.name} id={id}  type="password" size={12} style={c.style} onChange={e => onChange(e)} disabled={c.disabled} value={dataObject[c.name]}/>;
                case "select":
                    return <select name={c.name}  id={id} onChange={e => onChange(e)} style={c.style} disabled={c.disabled} >{loadOptions(dataObject[c.name], c.options)}</select>;
                case "number":
                    return <input name={c.name}  id={id} type="number" onChange={e => onChange(e)} value={dataObject[c.name]} disabled={c.disabled} style={c.style}  />;
                case "date":
                    return <input name={c.name} id={id}  type="date" onChange={e => onChange(e)} value={dataObject[c.name]} disabled={c.disabled} style={c.style} />;
                case "email":
                    return <input name={c.name} id={id}  type="email" size={20} onChange={e => onChange(e)} value={dataObject[c.name]} style={c.style} disabled={c.disabled}/>;
                case "checkbox":
                    return <input name={c.name}  id={id} type="checkbox" onChange={e => onChange(e)} checked={dataObject[c.name]} disabled={c.disabled} style={c.style} />;
                case "textarea":
                    return <textarea name={c.name}  id={id} cols={30} rows={2} onChange={e => onChange(e)} value={dataObject[c.name]} disabled={c.disabled} style={c.style}  />;
                case "file":
                    return <input name={c.name} id={id} type="file" size={40} onChange={e => onChange(e)} value={dataObject[c.name]} disabled={c.disabled} style={c.style} />;
                case "label":
                    return <span className="read-only-data" style={c.style} >{c.text}</span>;
                case "button":
                    return <Button size="sm" onClick={(e) => c.onClick(c)}>{c.label}</Button>;
            }
        }
    };
    
    const loadButtons = () => {
        return buttons.map(b => {
            return  <Button size="sm" onClick={() => b.onClick()}>{b.text}</Button>;

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
                return <div style={{textAlign: "right", verticalAlign: "middle"}}><MdHelpOutline className="icon-s" size={20} onClick={(e) => c.showHelp(c.helpText)}/></div>;
            } else {
                return <div/>;
            }
        } else {
            if (c.showHelp) {
                return  <div className="label">
                    <MdHelpOutline className="icon-s" size={20} onClick={(e) => c.showHelp(c.helpText)}/>
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
    }
    
    const getEntry = (c) => {
        if (c.type === "checkbox") {
            return <div className="display-field">{getInputField(c)}&nbsp;&nbsp;{c.label}</div>;
        } else {
            return <div className="display-field">{getInputField(c)}{c.entryConfig && getChildEntries(c.entryConfig)}</div>;
        }    
    };
    
    const loadEntryFields = () => {
        return entryConfig.map(c => {
            return <div className={getGridClass()}>
                { getLabel(c) }
                { getEntry(c) }
            </div>;
        });
    };
    
    return (
            <div>
                { loadEntryFields() }
                <div><span className="red-f">*</span>indicates required field</div>
                {buttons ? <div className="btn-bar">{ loadButtons()}</div> : ""}
            </div>);
    };

EntryPanel.propTypes = {
    config: PropTypes.object.isRequired
};

export default EntryPanel;
