/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState, useEffect } from 'react';
import useQueryDesign from "../../context/QueryDesignContext";
import useLang from "../../context/LangContext";
import useHelp from "../../context/HelpContext";
import useMessage from "../../context/MessageContext";
import {AiOutlineCopy, AiOutlineFileExcel} from "react-icons/ai";
import { BiRun} from 'react-icons/bi';
import useDataHandler from "../../context/DataHandlerContext";
import ParameterEntryModal from "../../widgets/ParameterEntryModal"
import {
isSqlOrderByRequired,
        isSqlGroupByRequired,
        isSqlHavingRequired,
        isSqlWhereRequired,
        isDataTypeString,
        isDataTypeDateTime,
        UNARY_COMPARISON_OPERATORS,
        DB_TYPE_MYSQL,
        DB_TYPE_SQLSERVER,
        DB_TYPE_ORACLE,
        DB_TYPE_POSTGRES,
        MEDIUM_ICON_SIZE,
        isEmpty,
        SQL_KEYWORDS,
        getQuotedIdentifier,
        INFO,
        ERROR,
        loadDocumentFromBlob,
        checkColorString,
        } from "../../utils/helper";
import {runQuery, isApiError, exportToExcel} from "../../utils/apiHelper";

const SqlDisplay = (props) => {
    const {
        selectColumns,
        filterColumns,
        fromClause,
        updateSelectColumns,
        isParameterEntryRequired,
        buildRunDocument,
        datasource,
        queryResults,
        setQueryResults,
        isRowHidden} = useQueryDesign();
    const {getText} = useLang();
    const {getDatabaseType, isSchemaRequired, getDatasourceSchema} = useDataHandler();
    const [showParameterEntry, setShowParameterEntry] = useState({show: false});
    const {showMessage, hideMessage} = useMessage();

    let quotedIdentifier = getQuotedIdentifier(getDatabaseType(datasource));

    const getColumnName = (s) => {
        let retval = "";

        if (s.customSql) {
            retval = s.customSql;
        } else {
            if (s.aggregateFunction) {
                retval += (s.aggregateFunction + "(");
            }

            retval += (withQuotes(s.tableAlias) + "." + withQuotes(s.columnName));

            if (s.aggregateFunction) {
                retval += ")";
            }
        }

        return retval;
    };


    const getDisplayName = (s) => {
        let retval = "";

        if (s.displayName && (s.displayName !== s.columnName)) {
            retval += (" AS " + withQuotes(s.displayName));
        }

        return retval;
    };

    const withQuotes = (input) => {
        return quotedIdentifier + input + quotedIdentifier;
    };

    const getSelectColumns = () => {
        let selcols = [];
        for (let i = 0; i < selectColumns.length; ++i) {
            if (selectColumns[i].showInResults) {
                selcols.push(selectColumns[i]);
            }
        }
        
        return selcols.map((s, indx) => {
            let comma = ",";

            if (indx === (selcols.length - 1)) {
                comma = "";
            }

            return <div className="sql-clause-column">    {getColumnName(s) + getDisplayName(s) + comma}</div>;
        });
    };

    const getJoinColumns = (f) => {
        let retval = "(";
        let comma = "";
        for (let i = 0; i < f.fromColumns.length; ++i) {
            retval += comma + withQuotes(f.alias) + "." + withQuotes(f.toColumns[i]) + " = " + withQuotes(f.fromAlias) + "." + withQuotes(f.fromColumns[i]);
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
            retval += (comma + withQuotes(s.tableAlias) + "." + withQuotes(s.columnName) + (s.sortDirection === "desc" ? " desc" : ""));
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
                return <div className="sql-clause-column">{"    " + withQuotes(c.tableAlias) + "." + withQuotes(c.columnName) + ","}</div>;
            } else {
                return <div className="sql-clause-column">{"    " + withQuotes(c.tableAlias) + "." + withQuotes(c.columnName)}</div>;
            }
        });
    };
    
    const getFromTableName = (schema, tname) => {
        let retval = "";
        if (isSchemaRequired(datasource)) {
            retval = withQuotes(schema) + "." + withQuotes(tname);
        } else {
            retval = withQuotes(tname);
        }
        
        return retval;
    }

    const getFromColumns = () => {
        if (fromClause && Array.isArray(fromClause)) {
            let schema = getDatasourceSchema(datasource);
            return fromClause.map((f, indx) => {
                let joinType = " join ";

                if (f.joinType === "outer") {
                    joinType = " left outer join ";
                }

                if (indx === 0) {
                    return <div className="sql-clause-column">    <span className="crimson-f">{getFromTableName(schema, f.table)}</span> {" " + withQuotes(f.alias)}</div>;
                } else {
                    return <div className="sql-clause-column">
                        {"    " + joinType}
                        <span className="crimson-f">{getFromTableName(schema, f.table)}</span>
                        {" " + withQuotes(f.alias) + " "}
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

    const getHavingColumns = () => {
        return filterColumns.map(f => {
            if (f.aggregateFunction) {
                return <div className="sql-clause-column">
                <span className="sql-clause-name">{"    " + getAndOr(f)}</span>
                {
                                        getOpenParenthesis(f)
                                                + f.aggregateFunction
                                                + "("
                                                + withQuotes(f.tableAlias) + "." + withQuotes(f.columnName)
                                                + ") "
                                                + f.comparisonOperator
                                                + " "
                                                + getComparisonValue(f)
                                                + getCloseParenthesis(f)}
            </div>;
            } else {
                return "";
            }
        });
    };

    const getWhereColumns = () => {
        return filterColumns.map((f) => {
            if (f.customSql) {
                return <div className="sql-clause-column">                     
                    <span color="sql-clause-name">{getAndOr(f)}</span>
                    {getOpenParenthesis(f) + f.customSql + getCloseParenthesis(f)}
                </div>;
            } else if (!f.aggregateFunction) {
                return <div className="sql-clause-column">
                    <span className="sql-clause-name">{"    " + getAndOr(f)}</span>
                    {getOpenParenthesis(f)
                        + withQuotes(f.tableAlias) + "." + withQuotes(f.columnName)
                        + " "
                        + f.comparisonOperator
                        + " "
                        + getComparisonValue(f)
                        + getCloseParenthesis(f)}
                </div>;
            } else {
                return "";
            }
        });
    };

    const copySqlToClipboard = () => {
        window.getSelection().selectAllChildren(document.getElementById("sql-display"));

        let sql = window.getSelection().toString();

        let lines = sql.split(/\r?\n|\r|\n/g);

        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection) {
            document.selection.empty();
        }

        let output = "";
        for (let i = 0; i < lines.length; ++i) {
            let l = lines[i].trim();
            if (isSqlKeyword(l)) {
                output += (l + "\n");
            } else {
                output += ("     " + l + "\n");
            }
        }

        navigator.clipboard.writeText(output);

    };

    const isSqlKeyword = (s) => {
        for (let i = 0; i < SQL_KEYWORDS.length; ++i) {
            if (s === SQL_KEYWORDS[i]) {
                return true;
            }
        }
    };

    const hideParameterEntry = () => {
        setShowParameterEntry({show: false});
    };

    const showParamEntry = () => {
        setShowParameterEntry({show: true, hide: hideParameterEntry, runQuery: runQueryWithParameters});
    };

    const runQueryWithParameters = async (params) => {
        hideParameterEntry();
        showMessage(INFO, getText("Running query", "...", ), null, true);
        let res = await runQuery(buildRunDocument(), params);

        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            hideMessage();
        }
        setQueryResults(res.result);
    };

    const runLocalQuery = async () => {
        if (isParameterEntryRequired()) {
            showParamEntry();
        } else {
            showMessage(INFO, getText("Running query", "...", ), null, true);
            let res = await runQuery(buildRunDocument());

            if (isApiError(res)) {
                showMessage(ERROR, res.message);
            } else {
                hideMessage();
            }

            setQueryResults(res.result);
        }
    };

    const haveQueryResults = () => {
        return queryResults && queryResults.data && queryResults.data.length > 0;
    };

    const excelExport = async () => {
        let style = getComputedStyle(document.documentElement);
        let qr = {... queryResults};
        
        qr.data = [];
        
        // remove the hidden rows
        queryResults.data.map(r => {
            if (!isRowHidden(r)) {
                qr.data.push(r);
            }
        });
        
        let wrapper = {
            queryResults: qr,
            headerFontColor: style.getPropertyValue('--query-results-table-hdr-forecolor').substring(1),
            headerBackgroundColor: checkColorString(style.getPropertyValue('--query-results-table-hdr-data-bkcolor')).substring(1),
            headerFontSize: style.getPropertyValue('--query-results-table-hdr-fontsize').replace("pt", ""),
            detailFontColor: checkColorString(style.getPropertyValue('--query-results-table-detail-forecolor')).substring(1),
            detailBackgroundColor1: checkColorString(style.getPropertyValue('--query-results-table-detail-row-bkcolor1')).substring(1),
            detailBackgroundColor2: checkColorString(style.getPropertyValue('--query-results-table-detail-row-bkcolor2')).substring(1),
            detailFontSize: style.getPropertyValue('--query-results-table-detail-fontsize').replace("pt", "")
        };

        showMessage(INFO, getText("Exporting to excel"), null, true);
        let res = await exportToExcel(wrapper);
        let blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        await loadDocumentFromBlob("excel-export.xlsx", blob);
        
        hideMessage();
    };

    return <div id="sql-display">
        <ParameterEntryModal config={showParameterEntry}/>
        <span style={{float: "right", marginRight: "30px", top: "5px", position: "sticky"}}>
            <span  title={getText("Copy sql to clipboard")} style={{marginRight: "10px"}}>
                <AiOutlineCopy className="icon cobaltBlue-f" size={MEDIUM_ICON_SIZE} onClick={(e) => copySqlToClipboard()} />
            </span>
            <span  title={getText("Export to excel")} style={{marginRight: "10px"}}>
                {haveQueryResults() ? <AiOutlineFileExcel className="icon cloverGreen-f" size={MEDIUM_ICON_SIZE + 2} onClick={(e) => excelExport()} />
                                : <AiOutlineFileExcel className="icon-dis" size={MEDIUM_ICON_SIZE + 2} />}
            </span>
            <span  title={getText("Run query")} >
                <BiRun className="icon crimson-f" size={MEDIUM_ICON_SIZE + 2} onClick={(e) => runLocalQuery()} />
            </span>
        </span>
        <div className="sql-clause-name">SELECT</div>
        { getSelectColumns()}
        <div className="sql-clause-name">FROM</div>
        { getFromColumns()}
        {isSqlWhereRequired(filterColumns) && <div className="sql-clause-name">WHERE</div>}
        {isSqlWhereRequired(filterColumns) ? getWhereColumns() : ""}
        {isSqlGroupByRequired(selectColumns) && <div className="sql-clause-name">GROUP BY</div>}
        {isSqlGroupByRequired(selectColumns) ? getGroupBy() : ""}
        {isSqlHavingRequired(filterColumns) && <div className="sql-clause-name">HAVING</div>}
        {isSqlHavingRequired(filterColumns) ? getHavingColumns() : ""}
        {isSqlOrderByRequired(selectColumns) && <div className="sql-clause-name">ORDER BY</div> }
        {isSqlOrderByRequired(selectColumns) ? getOrderBy() : ""}
    </div>;
};

export default SqlDisplay;