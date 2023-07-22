/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState, useEffect } from 'react';
import useQueryDesign from "../../context/QueryDesignContext";
import useLang from "../../context/LangContext";
import useHelp from "../../context/HelpContext";
import {
    isDataTypeString,
    isDataTypeNumeric,
    isDataTypeDateTime,
    isSqlOrderByRequired,
    isSqlGroupByRequired
} from "../../utils/helper";

const SqlDisplay = (props) => {
    const {
        selectColumns, 
        filterColumns, 
        fromClause,
        updateSelectColumns} = useQueryDesign();


    const getColumnName = (s) => {
        let retval = "";

        if (s.aggregateFunction) {
            retval += (s.aggregateFunction + "(");
        }

        retval += (s.tableAlias + "." + s.columnName);

        if (s.aggregateFunction) {
            retval += ")";
        }

        return retval;
    };
    
    
    const getDisplayName = (s) => {
        let retval = "";
        
        if (s.displayName) {
            retval += (" AS \"" + s.displayName + "\"");
        }
        
        return retval;
    }
        
        
    const getSelectColumns = () => {
        return selectColumns.map((s, indx) => {
            let comma = ",";

            if (indx === (selectColumns.length - 1)) {
                comma = "";
            }

            return <pre className="sql-clause-column">    {getColumnName(s) + getDisplayName(s) + comma}</pre>;
        });
    };

    const getJoinColumns = (f) => {
        let retval = "(";
        let comma = "";
        for (let i = 0; i < f.fromColumns.length; ++i) {
            retval += comma + f.alias  + "." + f.toColumns[i] + " = " + f.fromAlias + "." + f.fromColumns[i];
        }
        retval += ")\n";
        
        return retval;
    };

    const getFromColumns = () => {
        if (fromClause && Array.isArray(fromClause)) {
             return fromClause.map((f, indx) => {
                let joinType = " join ";
                
                if (f.joinType === "outer") {
                    joinType = " left outer join ";
                }
                
                if (indx === 0) {
                    return <pre className="sql-clause-column">    <span className="crimson-f">{f.table}</span> {" " + f.alias}</pre>;
                } else {
                    return <pre className="sql-clause-column">       {joinType}<span className="crimson-f">{f.table}</span> {" " + f.alias + " ON " + getJoinColumns(f)}</pre>;
                }
            });
        } else {
            return "";
        }

    };

    return <div>
        <pre className="sql-clause-name">SELECT</pre>
        { getSelectColumns()}
        <pre className="sql-clause-name">FROM</pre>
        { getFromColumns()}
        <pre className="sql-clause-name">WHERE</pre>
        {isSqlOrderByRequired(selectColumns) && <pre className="sql-clause-name">ORDER BY</pre>}
        {isSqlGroupByRequired(selectColumns) && <pre className="sql-clause-name">GROUP BY</pre>}
    </div>;
};

export default SqlDisplay;