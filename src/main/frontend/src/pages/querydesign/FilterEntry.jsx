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
import { AiOutlineDelete } from "react-icons/ai";
import {
    SMALL_ICON_SIZE, 
    confirm,
    LEFT_PARENTHESIS,
    RIGHT_PARENTHESIS,
    AND_OR,
    COMPARISON_OPERATORS,
    UNARY_COMPARISON_OPERATORS} from "../../utils/helper";

const FilterEntry = (props) => {
    const {filterData, index} = props;
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {
        filterColumns,
        selectColumns,
        setSelectColumns,
        formatPathForDisplay
     } = useQueryDesign();

    const getHelpText = () => {
        let pkindex = -1;

        let columnData = findColumnData();
        
        if (columnData) {
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
        }
    };
    
    const findColumnData = () => {
        for (let i = 0; i < selectColumns.length; ++i) {
            if (selectColumns[i].path === filterData.path) {
                return selectColumns[i];
            }
        }
    }

    const getHeaderTitle = () => {
        return getText("Table Alias:", " ") + filterData.tableAlias + "\n" + getText("Path:", " ") + formatPathForDisplay(filterData.path);
    };

    const loadAndOr = () => {
        if (index === 0) {
            return <option value=""></option>;
        } else {
            AND_OR.map(ao => <option value={ao} selected={(ao === filterData.andOr)}>{ao}</option>);
        }
    }

    const loadLeftParenthesis = () => {
        return LEFT_PARENTHESIS.map(p => <option value={p} selected={(p === filterData.leftParenthesis)}>{p}</option>);
    };
    
    const loadRightParenthesis = () => {
        RIGHT_PARENTHESIS.map(p => <option value={p} selected={(p === filterData.leftParenthesis)}>{p}</option>);
    };

    const loadFilterComparisonOperators = () => {
        COMPARISON_OPERATORS.map(o => <option value={o} selected={(o === filterData.comparisonOperator)}>{o}</option>);
    };
    
    const remove = async () => {
        if (await confirm(getText("Remove:", " " + filterData.displayName + "?"))) {
            let s = [...filterColumns];
            s.splice(index, 1);
            setFilterColumns(s);
        }
    };
    
    const onChange = (e, ) => {
        let val = "";
        if (e.target.options) {
            val = e.target.options[e.target.selectedIndex].value;
        } else {
            val = e.target.value;
        }
        
        filterData[index][e.target.name] = val;
    };
    
    const isComparisonValueDisabled = () => {
        if (filterData && filterData.comparisonOperator) {
            return UNARY_COMPARISON_OPERATORS.includes(filterData.comparisonOperator)
        }
    }
            
    return <div key={"fe-" + index} className="filter-column-entry">
        <div id={"hdr-" + index}>
            <span>
                <MdHelpOutline className="icon-s" size={SMALL_ICON_SIZE} onClick={(e) => showHelp(getHelpText())} />
                <span title={getHeaderTitle()} >{findColumnData().displayName}</span>
            </span>
        </div>
        <div className="detail">
            <div className="entrygrid-filcolentry">
                <div style={{paddingLeft: "10px"}} title={getText("Remove entry")}><AiOutlineDelete  className="icon-s crimson-f" size={SMALL_ICON_SIZE} onClick={(e) => remove()} /></div>
                <div className="data-field"><select name="andOr" onChange={e => onChange(e)} disabled={(index === 0)}>{loadAndOr()}</select></div>
                <div className="data-field"><select name="leftParenthesis" onChange={e => onChange(e)}>{loadLeftParenthesis()}</select></div>
                <div className="data-field">{filterData.displayName}</div>
                <div className="data-field"><select name="comparisonOperator" onChange={e => onChange(e)} disabled={(index === 0)}>{loadFilterComparisonOperators()}</select></div>
                <div className="data-field"><input type="text" name="comparisonValue" onBlur={e => onChange(e)} disabled={isComparisonValueDisabled()} defaultValue={filterData.comparisonValue}/></div>
                <div className="data-field"><select name="rightParenthesis" onChange={e => onChange(e)}>{loadRightParenthesis()}</select></div>
            </div>
            <div style={{marginLeft: "25px"}}>
                <div className="label-l">{getText("Custom SQL")}</div>
                <textarea cols={70} rows={2} name="customSql" onBlur={e => onChange(e)} defaultValue={filterData.customSql}/>
            </div>
        </div>
    </div>
};

FilterEntry.propTypes = {
    filterData: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired

};


export default FilterEntry;
