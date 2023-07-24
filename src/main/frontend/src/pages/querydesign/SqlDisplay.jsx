/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState, useEffect } from 'react';
import useQueryDesign from "../../context/QueryDesignContext";
import useLang from "../../context/LangContext";
import useHelp from "../../context/HelpContext";
import useDataHandler from "../../context/DataHandlerContext";
import {
    isSqlOrderByRequired,
    isSqlGroupByRequired,
    isDataTypeString,
    isDataTypeDateTime,
    UNARY_COMPARISON_OPERATORS,
    DB_TYPE_MYSQL,
    DB_TYPE_SQLSERVER,
    DB_TYPE_ORACLE,
    DB_TYPE_POSTGRES
} from "../../utils/helper";

const SqlDisplay = (props) => {
    const {
        selectColumns, 
        filterColumns, 
        fromClause,
        updateSelectColumns} = useQueryDesign();

    const { getDatabaseType } = useDataHandler();
    
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
            comma = ", ";
        }
        retval += ")\n";
        
        return retval;
    };

    const getOrderBy = () => {
        let retval = " ";
        let ob = [];
        for (let i = 0; i < selectColumns.length; ++i) {
            if (selectColumns[i].sortPosition > 0) {
                ob.push(selectColumns[i]);
            }
        }

        let comma = "";
        
        ob.sort((a, b) => a.sortPosition - b.sortPosition);
        ob.map(s => {
            retval += (comma + s.tableAlias + "." + s.columnName + (s.sortDirection === "desc" ? " desc" : ""));
            comma = ", ";
        });

        return <pre className="sql-clause-column">{"    " + retval}</pre>;
    };
    
    const getGroupBy = () => {
        let gb = [];
        for (let i = 0; i < selectColumns.length; ++i) {
            if (!selectColumns[i].aggregateFunction) {
                gb.push(selectColumns[i]);
            }
        }
        
        return gb.map((c, indx) => {
            if (indx < (gb.length - 1)) {
                return <pre className="sql-clause-column">{"    " + c.tableAlias + "." + c.columnName + ","}</pre>;
            } else {
                return <pre className="sql-clause-column">{"    " + c.tableAlias + "." + c.columnName}</pre>;
            }
        });
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
                    return <pre className="sql-clause-column">
                        {"    " + joinType}
                    <span className="crimson-f">{f.table}</span>
                    {" " + f.alias + " "}
                    <span className="sql-clause-name">ON</span>{" " + getJoinColumns(f)}</pre>;
                }
            });
        } else {
            return "";
        }

    };
    
    const getAndOr = (f) => {
        if (f.andOr) {
            return "    " + f.andOr.toUpperCase() + " ";
        } else {
            return "";
        }
    };
    
    
    const getOpenParenthesis = (f) => {
        if (f.openParenthesis) {
            return f.openParenthesis;
        } else {
            return "";
        }
    };
    
    const getCloseParenthesis = (f) => {
        if (f.closeParenthesis) {
            return f.closeParenthesis;
        } else {
            return "";
        }
    };
    
    const formatStringInClause = (input) => {
        let parts = input.split(",");
        
        let comma = "";
        let retval = "(";
        for (let i = 0; i < parts.length; ++i) {
            retval += comma;
            retval += "'";
            retval += parts[i].trim();
            retval += "'";
            comma = ",";
        }
        
        retval += ")";
        
        return retval;
    };
    
    const formatDateInClause = (input, dbType) => {
        let parts = input.split(",");
        
        let comma = "";
        let retval = "(";
        for (let i = 0; i < parts.length; ++i) {
            retval += comma;
            retval += getDateComparisonValue(parts[i].trim(), dbtype);
            comma = ",";
        }
        
        retval += ")";
        
        return retval;
    };

    
    const getDateComparisonValue = (f, dbtype) => {
        switch(dbtype) {
            case DB_TYPE_ORACLE:
                return "TO_DATE('" + f.comparisonValue + "', 'YYYY-MM-DD')";
            default:
               return  "'" + f.comparisonValue + "'";
       }       
    };
    
    const getComparisonValue = (f) => {
         if (f.comparisonValue) {
            if (f.comparisonOperator === "in") {
                if (isDataTypeString(f.dataType)) {
                    return formatStringInClause(f.comparisonValue);
                } else if (isDataTypeDateTime(f.dataType)) {
                    return formatDateInClause(f.comparisonValue, getDatabaseType(f.datasource));
                } else {    
                    return f.comparisonOperator;
                }
            } else if (isDataTypeDateTime(f.dataType)) {
                return getDateComparisonValue(f, getDatabaseType(f.datasource));
            } else if (isDataTypeString(f.dataType)) {
                return "'" + f.comparisonValue + "'";
            } else {
                return f.comparisonValue;
            }
        } else if (UNARY_COMPARISON_OPERATORS.includes(f.comparisonOperator)) {
            return "";
        } else {
            return "?";
        }
    };
        
    const getWhereColumns = () => {
        return filterColumns.map(f => {
            if (f.customSql) {
                return <pre className="sql-clause-column">                     
                    <span color="sql-clause-name">{getAndOr(f)}</span>
                     {getOpenParenthesis(f) + f.customSql + getCloseParenthesis(f)}</pre>;
            } else { 
                return <pre className="sql-clause-column">
                    <span className="sql-clause-name">{"    " + getAndOr(f)}</span>
                    {getOpenParenthesis(f)  
                      + f.tableAlias + "." + f.columnName 
                      + " " 
                      + f.comparisonOperator 
                      + " " 
                      + getComparisonValue(f)  
                      + getCloseParenthesis(f)}
                </pre>;
            }
        });
    };


    return <div>
        <pre className="sql-clause-name">SELECT</pre>
        { getSelectColumns()}
        <pre className="sql-clause-name">FROM</pre>
        { getFromColumns()}
        <pre className="sql-clause-name">WHERE</pre>
        { getWhereColumns()}
        {isSqlOrderByRequired(selectColumns) && <pre className="sql-clause-name">ORDER BY</pre> }
        {isSqlOrderByRequired(selectColumns) ? getOrderBy() : ""}
        {isSqlGroupByRequired(selectColumns) && <pre className="sql-clause-name">GROUP BY</pre>}
        {isSqlGroupByRequired(selectColumns) ? getGroupBy() : ""}
    </div>;
};

export default SqlDisplay;