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
    UNARY_COMPARISON_OPERATORS,
    isDataTypeString,
    isDataTypeNumeric,
    isDataTypeDateTime
} from "../../utils/helper";

const FilterEntry = (props) => {
    const {filterData, index} = props;
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {
        filterColumns,
        setFilterColumns,
        selectColumns,
        setSelectColumns,
        formatPathForDisplay
    } = useQueryDesign();

    const COLUMN_DEFS = [
        {
            title: "",
            width: "30px",
        },
        {
            title: "and/or",
            width: "75px",
            algign: "center"
        },
        {
            title: "(",
            align: "center"
        },
        {
            title: "Column",
            width: "250px"
        },
        {
            title: "Operator",
            width: "100px"
        },
        {
            title: "Value",
            width: "200px"
        },
        {
            title: ")",
            width: "50px",
            align: "center"
        }];


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
            return AND_OR.map(ao => <option value={ao} selected={(ao === filterData.andOr)}>{ao}</option>);
        }
    }

    const loadLeftParenthesis = () => {
        return LEFT_PARENTHESIS.map(p => <option value={p} selected={(p === filterData.leftParenthesis)}>{p}</option>);
    };

    const loadRightParenthesis = () => {
        return RIGHT_PARENTHESIS.map(p => <option value={p} selected={(p === filterData.leftParenthesis)}>{p}</option>);
    };

    const loadFilterComparisonOperators = () => {
        return COMPARISON_OPERATORS.map(o => <option value={o} selected={(o === filterData.comparisonOperator)}>{o}</option>);
    };

    const remove = async () => {
        if (await confirm(getText("Remove:", " " + filterData.columnName + "?"))) {
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

        filterData[e.target.name] = val;
    };

    const getComparisonInput = () => {
        let columnData = findColumnData();
        
        if (isComparisonValueDisabled()) {
            filterData.comparisonValue = "";
            return <input type="text" name="comparisonValue" style={{width: "98%"}} disabled />;
        } else if (columnData) {
            if (isDataTypeString(columnData.dataType)) {
                return <input type="text" name="comparisonValue" style={{width: "98%"}} onChange={e => onChange(e)} defaultValue={filterData.comparisonValue} />;
            } else if (isDataTypeNumeric(columnData.dataType)) {
                return <input type="number" name="comparisonValue" style={{width: "120px"}} onChange={e => onChange(e)} defaultValue={filterData.comparisonValue} />;
            } else if (isDataTypeDateTime(columnData.dataType)) {
                return <input type="date" name="comparisonValue" style style={{width: "95%px"}} onChange={e => onChange(e)} defaultValue={filterData.comparisonValue}/>;
            }
        } else {
            return <input type="text" name="comparisonValue" tyle={{width: "98%"}} defaultValue={filterData.comparisonValue} onChange={e => onChange(e)} defaultValue={filterData.comparisonValue} />;
        }
    }
    
    const isComparisonValueDisabled = () => {
        if (filterData && filterData.comparisonOperator) {
            return UNARY_COMPARISON_OPERATORS.includes(filterData.comparisonOperator);
        }
    };

    const getHeader = () => {
        return <tr>{COLUMN_DEFS.map(h => <th style={{width: h.width, textAlign: h.align ? h.align : "left"}}>{h.title}</th>)}</tr>;
    };

    const getDetail = () => {
        return <tr style={{paddingLeft: "10px"}}>
            <td title={getText("Remove entry")}><AiOutlineDelete  className="icon-s crimson-f" size={SMALL_ICON_SIZE} onClick={(e) => remove()} /></td>
            <td><select style={{width: "100%"}} name="andOr" onChange={e => onChange(e)} disabled={(index === 0)}>{loadAndOr()}</select></td>
            <td><select name="leftParenthesis" onChange={e => onChange(e)}>{loadLeftParenthesis()}</select></td>
            <td>{filterData.columnName}</td>
            <td><select name="comparisonOperator" onChange={e => onChange(e)}>{loadFilterComparisonOperators()}</select></td>
            <td>{getComparisonInput()}</td>
            <td><select name="rightParenthesis" onChange={e => onChange(e)}>{loadRightParenthesis()}</select></td>
            </tr>;
    };

    return <div key={"fe-" + index}>
        <div className="filter-title" id={"fil-" + index}>
            <span>
                <MdHelpOutline style={{marginBottom: "5px"}} className="icon-s" size={SMALL_ICON_SIZE} onClick={(e) => showHelp(getHelpText())} />
                <span title={getHeaderTitle()} >{findColumnData().displayName}</span>
            </span>
        </div>
        <table className="filter-table">
            <thead>{getHeader()}</thead>
            <tbody>{getDetail()}</tbody>
        </table>
        <div style={{marginLeft: "25px"}}>
            <div className="label-l">{getText("Custom SQL")}</div>
            <textarea cols={70} rows={2} name="customSql" onBlur={e => onChange(e)} defaultValue={filterData.customSql}/>
        </div>
    </div>
};

FilterEntry.propTypes = {
    filterData: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired

};


export default FilterEntry;
