import React, { useState } from 'react';
import useQueryDesign from "../../context/QueryDesignContext";
import useLang from "../../context/LangContext";
import PropTypes from "prop-types";
import useHelp from "../../context/HelpContext";
import NumberEntry from "../../widgets/NumberEntry"
import { MdHelpOutline } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import {
    SMALL_ICON_SIZE,
    confirm,
    OPEN_PARENTHESIS,
    CLOSE_PARENTHESIS,
    AND_OR,
    COMPARISON_OPERATORS,
    UNARY_COMPARISON_OPERATORS,
    COMPARISON_OPERATOR_IN,
    copyObject,
    formatPathForDisplay,
    getColumnHelpDisplay,
    getFilterComparisonInput
    } from "../../utils/helper";

const FilterEntry = (props) => {
    const {index} = props;
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {
        filterColumns,
        setFilterColumns,
        selectColumns,
        setSelectColumns,
        getColumnNameForDisplay
    } = useQueryDesign();

    const COLUMN_DEFS = [
        {
            title: "",
            width: "30px"
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
        let columnData = findColumnData();

        if (columnData) {
            return getColumnHelpDisplay(columnData, getText);
        }
    };

    const findColumnData = () => {
        for (let i = 0; i < selectColumns.length; ++i) {
            if (selectColumns[i].path === filterColumns[index].path) {
                return selectColumns[i];
            }
        }
    };

    const getHeaderTitle = () => {
        return getText("Table Alias:", " ") + filterColumns[index].tableAlias + "\n" + getText("Path:", " ") + formatPathForDisplay(filterColumns[index].path);
    };

    const loadAndOr = () => {
        if (!filterColumns[index].andOr) {
            return <option value=""></option>;
        } else {
            return AND_OR.map(ao => <option value={ao} selected={(ao === filterColumns[index].andOr)}>{ao}</option>);
        }
    };

    const loadOpenParenthesis = () => {
        return OPEN_PARENTHESIS.map(p => <option value={p} selected={(p === filterColumns[index].leftParenthesis)}>{p}</option>);
    };

    const loadCloseParenthesis = () => {
        return CLOSE_PARENTHESIS.map(p => <option value={p} selected={(p === filterColumns[index].leftParenthesis)}>{p}</option>);
    };

    const loadFilterComparisonOperators = () => {
        return COMPARISON_OPERATORS.map(o => <option value={o} selected={(o === filterColumns[index].comparisonOperator)}>{o}</option>);
    };

    const remove = async () => {
        if (await confirm(getText("Remove:", " " + filterColumns[index].columnName + "?"))) {
            let s = copyObject(filterColumns);
            s.splice(index, 1);
            setFilterColumns(s);
        }
    };

    const onChange = (e) => {
        let val = "";

        if (e.target.selectedIndex > -1) {
            val = e.target.options[e.target.selectedIndex].value;
        } else {
            val = e.target.value;
        }

        let f = copyObject(filterColumns);

        f[index][e.target.name] = val;
        setFilterColumns(f);
    };

    const getComparisonInput = () => {
        if (isComparisonValueDisabled()) {
            filterColumns[index].comparisonValue = "";
            return <input type="text" name="comparisonValue" style={{width: "98%"}} disabled />;
        } else {
            return getFilterComparisonInput(filterColumns[index], index, onChange);
        }
    };

    const isComparisonValueDisabled = () => {
        if (filterColumns[index].comparisonOperator) {
            return UNARY_COMPARISON_OPERATORS.includes(filterColumns[index].comparisonOperator);
        }
    };

    const getHeader = () => {
        return <tr>{COLUMN_DEFS.map(h => <th style={{width: h.width, textAlign: h.align ? h.align : "left"}}>{h.title}</th>)}</tr>;
    };

    const getDetail = () => {
        return <tr style={{paddingLeft: "10px"}}>
    <td title={getText("Remove entry")}><AiOutlineDelete  className="icon crimson-f" size={SMALL_ICON_SIZE} onClick={(e) => remove()} /></td>
<td><select name="andOr" onChange={e => onChange(e)} style={{width: "100%"}}  disabled={!filterColumns[index].andOr}>{loadAndOr()}</select></td>
<td><select name="openParenthesis" onChange={e => onChange(e)}>{loadOpenParenthesis()}</select></td>
<td><span className="fc-name">{getColumnNameForDisplay(filterColumns[index])}</span></td>
<td><select name="comparisonOperator" onChange={e => onChange(e)}>{loadFilterComparisonOperators()}</select></td>
<td>{getComparisonInput()}</td>
<td><select name="closeParenthesis" onChange={e => onChange(e)}>{loadCloseParenthesis()}</select></td>
</tr>;
    };

    return <div key={"fe-" + index}>
        <div className="filter-title" id={"fil-" + index}>
            <span>
                <MdHelpOutline className="icon" style={{marginBottom: "5px"}} size={SMALL_ICON_SIZE} onClick={(e) => showHelp(getHelpText())} />
                <span title={getHeaderTitle()} >{getColumnNameForDisplay(filterColumns[index])}</span>
            </span>
        </div>
        <table className="filter-table">
            <thead>{getHeader()}</thead>
            <tbody>{getDetail()}</tbody>
        </table>
        <div style={{marginLeft: "25px"}}>
            <div className="label-l">{getText("Custom SQL")}</div>
            <textarea cols={70} rows={2} name="customSql" onBlur={e => onChange(e)} defaultValue={filterColumns[index].customSql}/>
        </div>
    </div>
};

export default FilterEntry;
