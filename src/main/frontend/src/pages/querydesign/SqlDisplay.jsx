/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from 'react';
import useQueryDesign from "../../context/QueryDesignContext";
import useLang from "../../context/LangContext";
import PropTypes from "prop-types";
import useHelp from "../../context/HelpContext";
import {
    isDataTypeString,
    isDataTypeNumeric,
    isDataTypeDateTime,
    isSqlOrderByRequired,
    isSqlGroupByRequired
    } from "../../utils/helper";

const SqlDisplay = (props) => {
    const {selectColumns, filterColumns, from} = useQueryDesign();

    const getSelectColumns = () => {
        return selectColumns.map((s, indx) => {
            let comma = ",";

            if (indx === (selectColumns.length - 1)) {
                comma = "";
            }

            return <pre className="sql-clause-column">    {s.tableAlias + "." + s.columnName + comma}</pre>;
        });
    };

    return <div>
        <pre className="sql-clause-name">SELECT</pre>
        { getSelectColumns()}
        <pre className="sql-clause-name">FROM</pre>
        <pre className="sql-clause-name">WHERE</pre>
        {isSqlOrderByRequired(selectColumns) && <pre className="sql-clause-name">ORDER BY</pre>}
        {isSqlGroupByRequired(selectColumns) && <pre className="sql-clause-name">GROUP BY</pre>}
    </div>;
};

SqlDisplay.propTypes = {
    sql: PropTypes.string.isRequired
};

export default SqlDisplay;