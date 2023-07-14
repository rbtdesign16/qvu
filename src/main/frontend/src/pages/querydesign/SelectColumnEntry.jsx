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
import {SMALL_ICON_SIZE} from "../../utils/helper";

const SelectColumnEntry = (props) => {
    const {columnData} = props;
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {selectColumns, setSelectedColumns, formatPathForDisplay} = useQueryDesign();

    const getHelpText = () => {
        return <div className="entrygrid-125-425">
            <div className="label">{getText("Column Name:")}</div><div>{columnData.columnName}</div>
            <div className="label">{getText("Table Name:")}</div><div>{columnData.tableName}</div>
            <div className="label">{getText("Data Type:")}</div><div>{columnData.dataTypeName}</div>
            <div className="label">{getText("Path:")}</div><div>{formatPathForDisplay(columnData.path)}</div>
            </div>;
    }
    
    return <div className="select-column-entry">
        <div className="detail-hdr">
            <span>
                <MdHelpOutline className="icon-s" size={SMALL_ICON_SIZE} onClick={(e) => showHelp(getHelpText(columnData))} />
                {columnData.displayName}
            </span>
         </div>
        
        <div className="tab platinum-b">
        tab
        </div>
        <div className="detail">
        detail
        </div>
    </div>
};

SelectColumnEntry.propTypes = {
    columnData: PropTypes.object.isRequired
};


export default SelectColumnEntry;
