import React from "react";
import { CgAdd } from 'react-icons/cg';
import { FaEdit } from 'react-icons/fa';
import { AiFillDelete } from 'react-icons/ai';
import PropTypes from "prop-types";

const EditableDataList = (props) => {
    const {listConfig} = props;
    const iconSize = "25px";
    
    const getEditTitle = (indx) => {
        return listConfig.editTitle + " " + listConfig.data[indx][listConfig.displayConfig[0].field];
    }
    
    const getDelTitle = (indx) => {
        return listConfig.delTitle + " " + listConfig.data[indx][listConfig.displayConfig[0].field];
    }
    
    const getDisplay = (cfg, rec) => {

        if (cfg) {
            return cfg.map(c => {
                return <div className="name-value-display">
                    <div className="label" style={listConfig.labelStyle}>{c.label}</div>
                    <div className="display-field" style={listConfig.fieldStyle}>{rec[c.field]}</div>
                </div>
            });
        } else {
            return "";
        }
    }
    
    const getButtons = (indx) => {
        return <div className="btn-bar">
            {listConfig.onEdit && <FaEdit className="icon cobaltBlue" size={iconSize} title={getEditTitle(indx)} onClick={(e) => listConfig.onEdit(indx)} />}
            {listConfig.onDelete && <AiFillDelete className="icon crimson" size={iconSize} title={getDelTitle(indx)} onClick={(e) => listConfig.onDelete(indx)} />}
        </div>
    }

    const loadPanels = () => {
        return listConfig.data.map((rec, indx) => { 
            return <div>
                { getDisplay(listConfig.displayConfig, rec) }
                {getButtons(indx)}
             </div>
        });
    }

    return (
            <div  className="editable-data-list" style={{width: listConfig.width, height: listConfig.height}}>
                <div className="title">
                    <span>{listConfig.title}</span>
                    {listConfig.onAdd &&
                            <span style={{float: "right"}}><CgAdd size={iconSize} title={listConfig.addTitle} className="icon cloverGreen" onClick={listConfig.onAdd}/></span>
                    }
                </div>
                <div className="data-container">
                    { loadPanels() }
                </div>    
            </div>
            );
};

EditableDataList.propTypes = {
    listConfig: PropTypes.object.isRequired,
};
export default EditableDataList;
