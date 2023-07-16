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
import {AiFillFileAdd, AiFillDelete, AiFillCaretDown, AiFillCaretUp, AiFillCopy} from "react-icons/ai";
import {SMALL_ICON_SIZE, confirm, getAggregateFunctionsByDataType} from "../../utils/helper";

const SelectColumnEntry = (props) => {
    const {columnData, index} = props;
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {selectColumns,
        setSelectColumns,
        formatPathForDisplay,
        updateSelectColumns,
        selectedColumnIds,
        setSelectedColumnIds} = useQueryDesign();

    const getHelpText = () => {
        let pkindex = -1;

        if (columnData.pkindex) {
            pkindex = Number(columnData.pkindex);
        }

        if (pkindex > -1) {
            return <div className="entrygrid-125-550">
                <div className="label">{getText("Column Name:")}</div><div>{columnData.columnName}</div>
                <div className="label">{getText("PK Index:")}</div><div>{pkindex}</div>
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

    const duplicateEntry = async () => {
        let s = [...selectColumns];
        let item = {...columnData};
        item.isdup = true;
        if (index < (s.length - 1)) {
            s.splice(index, 0, item);
        } else {
            s.push(item);
        }

        updateSelectColumns(s);
    };

    const copyPath = () => {
        navigator.clipboard.writeText(columnData.path);
    };

    const moveUp = () => {
        let s = [...selectColumns];
        let item = s[index];
        s.splice(index, 1);
        s.splice(index - 1, 0, item);
        setSelectColumns(s);
    };

    const moveDown = () => {
        let s = [...selectColumns];
        let item = s[index + 1];
        s.splice(index + 1, 1);
        s.splice(index, 0, item);
        setSelectColumns(s);
    };

    const remove = async () => {
        if (await confirm(getText("Remove:", " " + columnData.displayName + "?"))) {
            let s = [...selectColumns];
            s.splice(index, 1);

            let cnt = 0;
            for (let i = 0; i < s.length; ++i) {
                if (s[i].path === columnData.path) {
                    cnt++;
                    break;
                }
            }

            if (cnt === 0) {
                let indx = selectedColumnIds.findIndex((element) => element === columnData.nodeId);

                if (indx > -1) {
                    let sids = [...selectedColumnIds];
                    sids.splice(indx, 1);
                    setSelectedColumnIds(sids);
                }
            }

            setSelectColumns(s);

        }
    };

    const onChange = (e) => {
    };

    const getAggregateFunctions = () => {
        let funcs = getAggregateFunctionsByDataType(columnData.dataType);

        if (funcs) {
            return funcs.map(f => {
                if (columnData.aggregateFunction && (columnData.aggregateFunction === f)) {
                    return <option value={f} selected>{f}</option>;
                } else {
                    return <option value={f}>{f}</option>;
                }
            });
        }
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
            <span title={getText("Copy path")}><AiFillCopy className="icon-s cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={(e) => copyPath()} /></span>
            <div style={{paddingTop: "10%"}}>
                {(index > 0) && <span title={getText("Move up")}><AiFillCaretUp className="icon-s cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={(e) => moveUp()} /></span>}
                {(index < (selectColumns.length - 1)) && <span title={getText("Move down")}><AiFillCaretDown className="icon-s cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={(e) => moveDown()} /></span>}
            </div>
            <div title={getText("Remove entry")}><AiFillDelete  className="icon-s crimson-f" size={SMALL_ICON_SIZE} onClick={(e) => remove()} /></div>
        </div>
        <div className="detail">
            <div className="entrygrid-selcolentry">
                <div className="label">{getText("Display Name:")}</div><div className="data-field"><input type="text" name="displayName" size={20} defaultValue={columnData.displayName} onChange={e => onChange(e)}/></div>
                <div className="label">{getText("Sort Position:")}</div><div className="data-field"><input type="text" name="sortPosition" size={5} defaultValue={columnData.sortPosition} onChange={e => onChange(e)}/></div>
                <div className="label">{getText("Function:")}</div><div className="data-field"><select name="aggregateFunction"  onChange={e => onChange(e, indx)}><option selected={!columnData.aggregateFunction} value=""></option>{getAggregateFunctions()}</select></div>
            </div>
            <div style={{marginLeft: "25px"}}>
                <div className="label-l">{getText("Custom SQL")}</div>
                <textarea cols={70} rows={2} name="customSql" onBlur={e => onChange(e)} defaultValue={columnData.customSql}/>
            </div>
        </div>
    </div>
};

SelectColumnEntry.propTypes = {
    columnData: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired

};


export default SelectColumnEntry;
