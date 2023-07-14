/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from 'react';
import useQueryDesign from "../../context/QueryDesignContext";
import useLang from "../../context/LangContext";
import PropTypes from "prop-types";
import useHelp from "../../context/HelpContext";
import { MdHelpOutline } from "react-icons/md";
import {AiFillFileAdd, AiFillCaretDown, AiFillCaretUp, AiFillCopy} from "react-icons/ai";
import {SMALL_ICON_SIZE} from "../../utils/helper";

const SelectColumnEntry = (props) => {
    const {columnData, index} = props;
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {selectColumns, setSelectColumns, formatPathForDisplay} = useQueryDesign();

    const getHelpText = () => {
        if (columnData.pkindex && (Number(columnData.pkindex) > -1)) {
            return <div className="entrygrid-125-550">
                    <div className="label">{getText("Column Name:")}</div><div>{columnData.columnName}</div>
                    <div className="label">{getText("PK Index:")}</div><div>{columnData.pkindex}</div>
                    <div className="label">{getText("Table Name:")}</div><div>{columnData.tableName}</div>
                    <div className="label">{getText("Data Type:")}</div><div>{columnData.dataTypeName}</div>
                    <div className="label">{getText("Path:")}</div><div>{formatPathForDisplay(columnData.path)}</div>
                </div>;
        } else {
            return <div className="entrygrid-125-550">
                    <div className="label">{getText("Column Name:")}</div><div>{columnData.columnName}</div>
                    <div className="label">{getText("Table Name:")}</div><div>{columnData.tableName}</div>
                    <div className="label">{getText("Data Type:")}</div><div>{columnData.dataTypeName}</div>
                    <div className="label">{getText("Path:")}</div><div>{formatPathForDisplay(columnData.path)}</div>
                </div>;
        }
    };
    
    const duplicateEntry = () => {
        let s = [...selectColumns];
        let item = {...s[index]};
        if (index  < (s.length - 1)) {
            s.splice(index, 0, item);
        } else {
            s.push(item);
        }
        
        setSelectColumns(s);
        updateSelectColumns();
    };
    
    const copyEntry = () => {
        navigator.clipboard.writeText(columnData.path);
    };
    
    const moveUp = () => {
        let s = [...selectColumns];
        let item = s[index];
        s.splice(index, 1);
        s.splice(index-1, 0, item);
        setSelectColumns(s);
    };

    const moveDown = () => {
        let s = [...selectColumns];
        let item = s[index+1];
        s.splice(index+1, 1);
        s.splice(index, 0, item);
        setSelectColumns(s);
    };
    
    return <div key={"cse-" + index} className="select-column-entry">
        <div className="detail-hdr">
            <span>
                <MdHelpOutline className="icon-s" size={SMALL_ICON_SIZE} onClick={(e) => showHelp(getHelpText(columnData))} />
                {columnData.displayName}
            </span>
         </div>
        
        <div className="tab platinum-b">
            <span title={getText("Duplicate entry")}><AiFillFileAdd className="icon-s cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={(e) => duplicateEntry()} /></span>
            <span title={getText("Copy path")}><AiFillCopy className="icon-s cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={(e) => copyEntry()} /></span>
            <div style={{paddingTop: "10%"}}>
                {(index > 0) && <span title={getText("Move up")}><AiFillCaretUp className="icon-s cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={(e) => moveUp()} /></span>}
                {(index < (selectColumns.length - 1)) && <span title={getText("Move down")}><AiFillCaretDown className="icon-s cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={(e) => moveDown()} /></span>}
            </div>
        </div>
        <div className="detail">
        detail
        </div>
    </div>
};

SelectColumnEntry.propTypes = {
    columnData: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired

};


export default SelectColumnEntry;
