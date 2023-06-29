import React from "react";
import { CiEdit } from 'react-icons/ci';
import { MdOutlineDeleteForever, MdOutlineAddBox } from 'react-icons/md';
import { SMALL_ICON_SIZE } from "../utils/helper";
import PropTypes from "prop-types";

const EditableDataList = (props) => {
    const {listConfig} = props;

    const getEditTitle = (indx) => {
        return listConfig.editTitle + " " + listConfig.data[indx][listConfig.displayConfig[0].field];
    };

    const getDelTitle = (indx) => {
        return listConfig.delTitle + " " + listConfig.data[indx][listConfig.displayConfig[0].field];
    };

    const getDisplay = (cfg, rec) => {
        if (cfg) {
            return cfg.map(c => {
                return <div className="name-value-display">
                    <div className="label" style={listConfig.labelStyle}>{c.label}</div>
                    <div className="display-field" style={listConfig.fieldStyle}>{rec[c.field]}</div>
                </div>;
            });
        } else {
            return "";
        }
    };

    const getButtons = (indx) => {
        return <div className="btn-bar tb-border platinum-b">
            {listConfig.onEdit && <CiEdit className="icon-s cobaltBlue-f" size={SMALL_ICON_SIZE} title={getEditTitle(indx)} onClick={(e) => listConfig.onEdit(indx)} />}
            {listConfig.onDelete && <MdOutlineDeleteForever className="icon-s crimson-f" size={SMALL_ICON_SIZE} title={getDelTitle(indx)} onClick={(e) => listConfig.onDelete(indx)} />}
        </div>;
    };

    const loadPanels = () => {
        if (listConfig.data) {
            return listConfig.data.map((rec, indx) => {
                return <div>
                    { getDisplay(listConfig.displayConfig, rec) }
                    {getButtons(indx)}
                </div>;
            });
        } else {
            return <div></div>;
        }
    };

    return (
            <div  className="editable-data-list" style={{width: listConfig.width, height: listConfig.height}}>
                <div className="title">
                    <span>{listConfig.title}</span>
                    {listConfig.onAdd &&
                            <span style={{float: "right"}}><MdOutlineAddBox size={SMALL_ICON_SIZE} title={listConfig.addTitle} className="icon-m cloverGreen-f" onClick={listConfig.onAdd}/></span>
                    }
                </div>
                <div className="data-container">
                    { loadPanels() }
                </div>    
            </div>
            );
};

EditableDataList.propTypes = {
    listConfig: PropTypes.object.isRequired
};
export default EditableDataList;
