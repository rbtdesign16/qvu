import React from "react";
import Button from "react-bootstrap/Button"
import PropTypes from "prop-types";

const EntryPanel = (props) => {
    const {entryConfig, dataObject, newObject, buttons} = props.config;

    
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
        if (e.target.options) {
            dataObject[e.target.name] = e.target.options[e.target.selectedIndex].value;
        } else if (e.target.type === "checkbox") {
            dataObject[e.target.name] = e.target.checked;
        } else {
            dataObject[e.target.name] = e.target.value;
        }
    };
    
    const getEntryField = (c) => {
        if (c.key && !newObject) {
            return dataObject[c.name];
        } else {
            switch (c.type) {
                case "input":
                    return <input name={c.name} type="text" size={30} onChange={e => onChange(e)} defaultValue={dataObject[c.name]}/>;
                case "password":
                    return <input name={c.name} type="password" size={12} onChange={e => onChange(e)} defaultValue={dataObject[c.name]}/>;
                case "select":
                    return <select name={c.name} onChange={e => onChange(e)}>{loadOptions(dataObject[c.name], c.options)}</select>;
                case "integer":
                    return <input name={c.name} type="number" onChange={e => onChange(e)} defaultValue={newObject[c.name]}/>;
                case "date":
                    return <input name={c.name} type="date" onChange={e => onChange(e)} defaultValue={newObject[c.name]}/>;
                case "checkbox":
                    return <input name={c.name} type="checkbox" onChange={e => onChange(e)} defaultValue={newObject[c.name]}/>;
                case "textarea":
                    return <textarea name={c.name} cols={30} rows={2} onChange={e => onChange(e)} defaultValue={newObject[c.name]}/>;
            }
        }
    };
    
    const loadButtons = () => {
        return buttons.map(b => {
            return  <Button size="sm" onClick={() => b.onClick()}>{b.text}</Button>

        });
    }
    
    const loadEntryFields = () => {
        return entryConfig.map(c => {
            return <div className="entrygrid-150-200"><div className="label">{c.label}</div><div className="display-field">{getEntryField(c)}</div></div>;
        });
    };
    
    return (
            <div className="entry-panel">
                { loadEntryFields() }
                {buttons ? <div className="btn-bar">{ loadButtons()}</div> : ""}
            </div>);
    };

EntryPanel.propTypes = {
    config: PropTypes.object.isRequired,
};

export default EntryPanel;
