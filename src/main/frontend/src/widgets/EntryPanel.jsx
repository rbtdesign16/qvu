import React, {useState} from "react";
import Button from "react-bootstrap/Button"
import PropTypes from "prop-types";

const EntryPanel = (props) => {
    const {entryConfig, dataObject, buttons, idPrefix, changeHook, gridClass} = props.config;

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
        if (changeHook) {
            changeHook(e);
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
    
    const getEntryField = (c) => {
        if (c.key && !dataObject.newRecord) {
            return dataObject[c.name];
        } else {
            let id = idPrefix + c.name;
            switch (c.type) {
                case "input":
                    return <input name={c.name} id={id} type="text" size={30} onChange={e => onChange(e)} value={dataObject[c.name]}/>;
                case "password":
                    return <input name={c.name} id={id}  type="password" size={12} onChange={e => onChange(e)} value={dataObject[c.name]}/>;
                case "select":
                    return <select name={c.name}  id={id} onChange={e => onChange(e)}>{loadOptions(dataObject[c.name], c.options)}</select>;
                case "integer":
                    return <input name={c.name}  id={id} type="number" onChange={e => onChange(e)} value={dataObject[c.name]}/>;
                case "date":
                    return <input name={c.name} id={id}  type="date" onChange={e => onChange(e)} value={dataObject[c.name]}/>;
                case "email":
                    return <input name={c.name} id={id}  type="email" size={20} onChange={e => onChange(e)} value={dataObject[c.name]}/>;
                case "checkbox":
                    return <input name={c.name}  id={id} type="checkbox" onChange={e => onChange(e)} value={dataObject[c.name]}/>;
                case "textarea":
                    return <textarea name={c.name}  id={id} cols={30} rows={2} onChange={e => onChange(e)} value={dataObject[c.name]}/>;
                case "file":
                    return <input name={c.name} id={id} type="file" size={40} onChange={e => onChange(e)} value={dataObject[c.name]}/>;
            }
        }
    };
    
    const loadButtons = () => {
        return buttons.map(b => {
            return  <Button size="sm" onClick={() => b.onClick()}>{b.text}</Button>

        });
    }
    
    const getGridClass = () => {
        if (gridClass) {
            return gridClass;
        } else {
            return "entrygrid-150-200";
        }
    }
    const loadEntryFields = () => {
        return entryConfig.map(c => {
            return <div className={getGridClass()}>
                <div className="label">{c.required && <span className="red-f">*</span>}{c.label}</div>
                <div className="display-field">{getEntryField(c)}</div>
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
    config: PropTypes.object.isRequired,
};

export default EntryPanel;
