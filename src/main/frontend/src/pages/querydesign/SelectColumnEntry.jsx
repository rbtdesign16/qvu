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
import {AiOutlineFileAdd, AiOutlineDelete, AiOutlineCaretDown, AiOutlineCaretUp, AiOutlineCopy} from "react-icons/ai";
import {SMALL_ICON_SIZE, confirm, getAggregateFunctionsByDataType} from "../../utils/helper";

const SelectColumnEntry = (props) => {
    const {index} = props;
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

        let columnData = selectColumns[index];
        if (columnData.pkindex) {
            pkindex = Number(columnData.pkindex);
        }

        if (pkindex > -1) {
            return <div className="entrygrid-125-550">
                <div className="label">{getText("Table Alias:")}</div><div>{columnData.tableAlias}</div>
                <div className="label">{getText("Column Name:")}</div><div>{columnData.columnName}</div>
                <div className="label">{getText("PK Index:")}</div><div>{pkindex}</div>
                <div className="label">{getText("Table Name:")}</div><div>{columnData.tableName}</div>
                <div className="label">{getText("Data Type:")}</div><div>{columnData.dataTypeName}</div>
                <div className="label">{getText("Path:")}</div><div>{formatPathForDisplay(columnData.path)}</div>
            </div>;
        } else {
            return <div className="entrygrid-125-550">
                <div className="label">{getText("Table Alias:")}</div><div>{columnData.tableAlias}</div>
                <div className="label">{getText("Column Name:")}</div><div>{columnData.columnName}</div>
                <div className="label">{getText("Table Name:")}</div><div>{columnData.tableName}</div>
                <div className="label">{getText("Data Type:")}</div><div>{columnData.dataTypeName}</div>
                <div className="label">{getText("Path:")}</div><div>{formatPathForDisplay(columnData.path)}</div>
            </div>;
        }
    };

    const duplicateEntry = async () => {
        let s = [...selectColumns];
        let item = s[index];
        item.isdup = true;
        if (index < (s.length - 1)) {
            s.splice(index, 0, item);
        } else {
            s.push(item);
        }

        updateSelectColumns(s);
    };

    const copyColumnName = () => {
        navigator.clipboard.writeText(selectColumns[index].tableAlias + "." + selectColumns[index].columnName);
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
        if (await confirm(getText("Remove:", " " + selectColumns[index].displayName + "?"))) {
            let s = [...selectColumns];
            s.splice(index, 1);

            let cnt = 0;
            for (let i = 0; i < s.length; ++i) {
                if (s[i].path === selectColumns[index].path) {
                    cnt++;
                    break;
                }
            }

            if (cnt === 0) {
                let indx = selectedColumnIds.findIndex((element) => element === selectColumns[index].nodeId);

                if (indx > -1) {
                    let sids = [...selectedColumnIds];
                    sids.splice(indx, 1);
                    setSelectedColumnIds(sids);
                }
            }

            setSelectColumns(s);

        }
    };

    const getAggregateFunctions = () => {
        let funcs = getAggregateFunctionsByDataType(selectColumns[index].dataType);

        if (funcs) {
            return funcs.map(f => {
                if (selectColumns[index].aggregateFunction && (selectColumns[index].aggregateFunction === f)) {
                    return <option value={f} selected>{f}</option>;
                } else {
                    return <option value={f}>{f}</option>;
                }
            });
        }
    };
    
    const getHeaderTitle = () => {
        return getText("Table Alias:", " ") + selectColumns[index].tableAlias + "\n" + getText("Path:", " ") + formatPathForDisplay(selectColumns[index].path);
    };
    
    const handleDragStart = (e) => {
        e.dataTransfer.setData("text/plain", "" + index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDrop= (e) => {
        let el = document.elementFromPoint(e.clientX, e.clientY);
        if (el && el.id && el.id.startsWith("hdr-")) {
            let dindx = Number(el.id.replace("hdr-", ""));
            let sindx = Number(e.dataTransfer.getData("text/plain"));
            if (sindx !== dindx) {
                let scols = [...selectColumns];
                let col = scols[sindx];
                scols.splice(sindx, 1);
                scols.splice(dindx, 0, col);
                setSelectColumns(scols);
           }
       }
    };
    
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
     };

    const onChange = (e) => {
        let sel = [...selectColumns];
        let c = sel[index];
        if (e.target.name === "showInResults") {
            c.showInResults = e.target.checked;
        } else if (e.target.selectedIndex) {
            c[e.target.name] = e.target.options[e.target.selectedIndex].value;
        } else {
            c[e.target.name] = e.target.value;
        }
        
        setSelectColumns(sel);
    };
    
    return <div key={"cse-" + index} className="select-column-entry">
        <div draggable={true} 
            id={"hdr-" + index}  
            onDragStart={e => handleDragStart(e)} 
            onDrop={e => handleDrop(e)} 
            onDragOver={e => handleDragOver(e)} className="detail-hdr">
            <span>
                <MdHelpOutline className="icon-s" size={SMALL_ICON_SIZE} onClick={(e) => showHelp(getHelpText())} />
                <span title={getHeaderTitle()} >{selectColumns[index].displayName}</span>
            </span>
        </div>
    
        <div className="tab platinum-b">
           <span title={getText("Duplicate entry")}><AiOutlineFileAdd className="icon-s cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={(e) => duplicateEntry()} /></span>
            <span title={getText("Copy column name")}><AiOutlineCopy className="icon-s cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={(e) => copyColumnName()} /></span>
            <div style={{paddingTop: "10%"}}>
                {(index > 0) && <span title={getText("Move up")}><AiOutlineCaretUp className="icon-s cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={(e) => moveUp()} /></span>}
                {(index < (selectColumns.length - 1)) && <span title={getText("Move down")}><AiOutlineCaretDown className="icon-s cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={(e) => moveDown()} /></span>}
            </div>
            <div title={getText("Remove entry")}><AiOutlineDelete  className="icon-s crimson-f" size={SMALL_ICON_SIZE} onClick={(e) => remove()} /></div>
        </div>
        <div className="detail">
            <div style={{paddingLeft: "10px"}} ><input type="checkbox" name="showInResults" defaultChecked={selectColumns[index].showInResults} onChange={e => onChange(e)}/><label className="ck-label">{getText("Show in Results")}</label></div>
            <div className="entrygrid-selcolentry">
                <div className="label">{getText("Display Name:")}</div><div className="data-field"><input type="text" name="displayName" size={20} defaultValue={selectColumns[index].displayName} onChange={e => onChange(e)}/></div>
                <div className="label">{getText("Sort Position:")}</div><div className="data-field"><input type="number" name="sortPosition"  defaultValue={(selectColumns[index].sortPosition) > 0 ? selectColumns[index].sortPosition : ""} onChange={e => onChange(e)}/></div>
                <div className="label">{getText("Function:")}</div><div className="data-field"><select name="aggregateFunction"  onChange={e => onChange(e)}><option selected={!selectColumns[index].aggregateFunction} value=""></option>{getAggregateFunctions()}</select></div>
            </div>
            <div style={{marginLeft: "25px"}}>
                <div className="label-l">{getText("Custom SQL")}</div>
                <textarea cols={70} rows={2} name="customSql" onBlur={e => onChange(e)} defaultValue={selectColumns[index].customSql}/>
            </div>
        </div>
    </div>
};

SelectColumnEntry.propTypes = {
    index: PropTypes.number.isRequired
};


export default SelectColumnEntry;
