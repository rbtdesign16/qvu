import React from "react";
import PropTypes from "prop-types";

const EntryPanel = (props) => {
    const {entryConfig, dataObject, newObject} = props;
    
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
                    return <input name={c.name} type="text" size="30" onChange={e => onChange(e)} defaultValue={dataObject[c.name]}/>;
                case "password":
                    return <input name={c.name} type="password" size="10" onChange={e => onChange(e)} defaultValue={dataObject[c.name]}/>;
                case "select":
                    return <select name={c.name} onChange={e => onChange(e)}>{loadOptions(dataObject[c.name], c.options)}</select>;
                case "integer":
                    return <input name={c.name} type="number" onChange={e => onChange(e)} defaultValue={newObject[c.name]}/>;
                case "date":
                    return <input name={c.name} type="date" onChange={e => onChange(e)} defaultValue={newObject[c.name]}/>;
            }
        }
    };
    
    const loadEntryFields = () => {
        return entryConfig.map(c => {
            return <div className="entrygrid-150-200"><div className="label">{c.label}</div><div>{getEntryField(c)}</div></div>;
        });
    };
    
    return (
            <div className="entry-panel">
                {loadEntryFields()}
            </div>);
};

EntryPanel.propTypes = {
    entryConfig: PropTypes.object.isRequired,
    dataObject: PropTypes.object.isRequired,
    newObject: PropTypes.bool.isRequired
};

export default EntryPanel;
