/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState, useEffect } from 'react';
import useQueryDesign from "../../context/QueryDesignContext";
import useLang from "../../context/LangContext";
import useHelp from "../../context/HelpContext";
import {AiOutlineCopy} from "react-icons/ai";
import { BiRun} from 'react-icons/bi';
import useDataHandler from "../../context/DataHandlerContext";
import ParameterEntryModal from "../../widgets/ParameterEntryModal"
import {
isSqlOrderByRequired,
        isSqlGroupByRequired,
        isDataTypeString,
        isDataTypeDateTime,
        UNARY_COMPARISON_OPERATORS,
        DB_TYPE_MYSQL,
        DB_TYPE_SQLSERVER,
        DB_TYPE_ORACLE,
        DB_TYPE_POSTGRES,
        MEDIUM_ICON_SIZE,
        isEmpty
        } from "../../utils/helper";
import {runQuery} from "../../utils/apiHelper";

const SqlDisplay = (props) => {
    const {
        selectColumns,
        filterColumns,
        fromClause,
        updateSelectColumns,
        isParameterEntryRequired,
        buildDocument} = useQueryDesign();
    const {getText} = useLang();
    const {getDatabaseType} = useDataHandler();
    const [showParameterEntry, setShowParameterEntry] = useState({show: false});

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
    };


    const getSelectColumns = () => {
        return selectColumns.map((s, indx) => {
            let comma = ",";

            if (indx === (selectColumns.length - 1)) {
                comma = "";
            }

            return <div className="sql-clause-column">    {getColumnName(s) + getDisplayName(s) + comma}</div>;
        });
    };

    const getJoinColumns = (f) => {
        let retval = "(";
        let comma = "";
        for (let i = 0; i < f.fromColumns.length; ++i) {
            retval += comma + f.alias + "." + f.toColumns[i] + " = " + f.fromAlias + "." + f.fromColumns[i];
            comma = ", ";
        }
        retval += ")";

        return <div className="sql-clause-column">{retval}</div>;
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

        return <div className="sql-clause-column">{"    " + retval}</div>;
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
                return <div className="sql-clause-column">{"    " + c.tableAlias + "." + c.columnName + ","}</div>;
            } else {
                return <div className="sql-clause-column">{"    " + c.tableAlias + "." + c.columnName}</div>;
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
                    return <div className="sql-clause-column">    <span className="crimson-f">{f.table}</span> {" " + f.alias}</div>;
                } else {
                    return <div className="sql-clause-column">
                        {"    " + joinType}
                        <span className="crimson-f">{f.table}</span>
                        {" " + f.alias + " "}
                        <span className="sql-clause-name">{"ON "}</span>{getJoinColumns(f)}</div>;
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
            retval += getDateComparisonValue(parts[i].trim(), dbType);
            comma = ",";
        }

        retval += ")";

        return retval;
    };


    const getDateComparisonValue = (f, dbType) => {
        switch (dbType) {
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
                return <div className="sql-clause-column">                     
                    <span color="sql-clause-name">{getAndOr(f)}</span>
                     {getOpenParenthesis(f) + f.customSql + getCloseParenthesis(f)}
                </div>;
            } else {
                return <div className="sql-clause-column">
                    <span className="sql-clause-name">{"    " + getAndOr(f)}</span>
                    {getOpenParenthesis(f)
                        + f.tableAlias + "." + f.columnName
                        + " "
                        + f.comparisonOperator
                        + " "
                        + getComparisonValue(f)
                        + getCloseParenthesis(f)}
                    </div>;           
            }
        });
    };

    const copySqlToClipboard = () => {
        window.getSelection().selectAllChildren(
                document.getElementById("sql-display")
                );

        document.execCommand('copy');

        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection) {
            document.selection.empty();
        }
    };
    
    
    
    const hideParameterEntry = () => {
        setShowParameterEntry({show: false});
    };
    
    const showParamEntry = () => {
        setShowParameterEntry({show: true, hide: hideParameterEntry, runQuery: runQueryWithParameters});
    };
    
    const runQueryWithParameters = async (params) => {
        let res = await runQuery(buildDocument(), params);
    };

    const runQuery = async () => {
        if (isParameterEntryRequired()) {
            showParamEntry();
        } else {
            let res = await runQuery(buildDocument());
        }
    };
    
    return <div id="sql-display">
        <ParameterEntryModal config={showParameterEntry}/>
        <span style={{float: "right", marginRight: "30px", top: "5px", position: "sticky"}}>
            <span  title={getText("Copy sql to clipboard")} style={{marginRight: "10px"}}>
                <AiOutlineCopy className="icon-s cobaltBlue-f" size={MEDIUM_ICON_SIZE} onClick={(e) => copySqlToClipboard()} />
            </span>
            <span  title={getText("Run query")} >
                <BiRun className="icon-s crimson-f" size={MEDIUM_ICON_SIZE + 2} onClick={(e) => runQuery()} />
            </span>
        </span>
        <div className="sql-clause-name">SELECT</div>
            { getSelectColumns()}
        <div className="sql-clause-name">FROM</div>
            { getFromColumns()}
        <div className="sql-clause-name">WHERE</div>
            { getWhereColumns()}
            {isSqlOrderByRequired(selectColumns) && <div className="sql-clause-name">ORDER BY</div> }
            {isSqlOrderByRequired(selectColumns) ? getOrderBy() : ""}
            {isSqlGroupByRequired(selectColumns) && <div className="sql-clause-name">GROUP BY</div>}
            {isSqlGroupByRequired(selectColumns) ? getGroupBy() : ""}
    </div>;
};

export default SqlDisplay;