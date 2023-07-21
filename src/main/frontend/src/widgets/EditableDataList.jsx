import React from "react";
import { CiEdit } from 'react-icons/ci';
import { MdOutlineDeleteForever, MdOutlineAddBox } from 'react-icons/md';
import useLang from "../context/LangContext";
import { SMALL_ICON_SIZE } from "../utils/helper";
import PropTypes from "prop-types";

const EditableDataList = (props) => {
    const {listConfig} = props;
    const {getText} = useLang();

    const getEditTitle = (indx) => {
        return listConfig.editTitle + " " + listConfig.data[indx][listConfig.displayConfig[0].field];
    };

    const getDelTitle = (indx) => {
        return listConfig.delTitle + " " + listConfig.data[indx][listConfig.displayConfig[0].field];
    };
    
    const getFieldValue = (rec, field) => {
        if (field) {
            if (typeof field === "function") {
                return field(rec);
            } else {
                return rec[field];
            }
        } else {
            return "";
        }
    };

    const getDisplay = (cfg, rec) => {
        if (cfg) {
            return cfg.map(c => {
                if (rec) {
                    let labelStyle = {};
                    let fieldStyle = {};
                    
                    if (c.labelStyle) {
                        labelStyle = c.labelStyle;
                    }

                    if (c.fieldStyle) {
                        fieldStyle = c.fieldStyle;
                    }

                    return <div className={listConfig.className}>
                        <div  className="label" style={labelStyle} >{c.label ? c.label : ""}</div>
                        <div className="display-field"  style={fieldStyle} >{getFieldValue(rec, c.field)}</div>
                    </div>;
                } else {
                    return "";
                }
            });
        } else {
            return "";
        }
    };
    
    const isReadOnly = (indx) => {
        if (!listConfig.isReadOnly) {
            return false;
        } else {
            return listConfig.isReadOnly(indx);
        }
    };
    
   const isEditDisabled = (indx) => {
        return !listConfig.onEdit || isReadOnly(indx);;
    };

    const isDeleteDisabled = (indx) => {
        if (listConfig.isDeleteable && !listConfig.isDeleteable(indx)) {
            return true;
        } else {
            return !listConfig.onDelete || isReadOnly(indx);
        }
    };
    
    const getButtons = (indx) => {
        return <div className="btn-bar tb-border">
            {isEditDisabled(indx) ? <span title={getEditTitle(indx)}><CiEdit className="icon-s-dis" size={SMALL_ICON_SIZE} /></span> : <span title={getEditTitle(indx)}><CiEdit className="icon-s cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={(e) => listConfig.onEdit(indx)} /></span>}
            {isDeleteDisabled(indx) ? <span  title={getDelTitle(indx)}><MdOutlineDeleteForever className="icon-s-dis" size={SMALL_ICON_SIZE}  /> </span>: <span  title={getDelTitle(indx)}><MdOutlineDeleteForever className="icon-s crimson-f" size={SMALL_ICON_SIZE}  onClick={(e) => listConfig.onDelete(indx)} /></span>}
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
                            <span  title={listConfig.addTitle} style={{float: "right"}}><MdOutlineAddBox size={SMALL_ICON_SIZE} className="icon-m cloverGreen-f" onClick={listConfig.onAdd}/></span>
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
