/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import useQueryDesign from "../../context/QueryDesignContext";
import useLang from "../../context/LangContext";
import {
isDataTypeNumeric,
        isDataTypeString,
        isDataTypeDateTime,
        getDisplayDate,
        getDisplayTimestamp,
        getDisplayTime,
        JDBC_TYPE_DATE,
        JDBC_TYPE_TIME,
        JDBC_TYPE_TIMESTAMP,
        JDBC_TYPE_TIME_WITH_TIMEZONE,
        JDBC_TYPE_TIMESTAMP_WITH_TIMEZONE,
        DEFAULT_PIXELS_PER_CHARACTER,
        QUERY_RESULTS_TABLE_DETAIL_BKCOLOR,
        QUERY_RESULTS_TABLE_DETAIL_FORECOLOR,
        QUERY_RESULTS_TABLE_DETAIL_FONTSIZE,
        QUERY_RESULTS_TABLE_DETAIL_FONTWEIGHT,
        QUERY_RESULTS_TABLE_HEADER_BKCOLOR,
        QUERY_RESULTS_TABLE_HEADER_FORECOLOR,
        QUERY_RESULTS_TABLE_HEADER_FONTSIZE,
        QUERY_RESULTS_TABLE_HEADER_FONTWEIGHT} from "../../utils/helper";

const QueryResultsTable = () => {
    const {queryResults} = useQueryDesign();
    const {getText} = useLang();
    const {data, initialColumnWidths, columnTypes, header} = queryResults;

    const getHeaderColumns = () => {
        return queryResults.header.map(h => <div>{h}</div>);
    };

    const getDisplayData = (coldata, indx) => {
        switch (columnTypes[indx]) {
            case JDBC_TYPE_DATE:
                return getDisplayDate(coldata);
            case JDBC_TYPE_TIME:
            case JDBC_TYPE_TIME_WITH_TIMEZONE:
                return getDisplayTime(coldata);
            case JDBC_TYPE_TIMESTAMP:
            case JDBC_TYPE_TIMESTAMP_WITH_TIMEZONE:
                return getDisplayTimestamp(coldata);
            default:
                return coldata;

        }
    }

    const getColumnDetail = (row, columnStyles) => {

        return row.map((coldata, indx) => {
            return <div style={columnStyles[indx]}>{getDisplayData(coldata, indx)}</div>;
        });
    };

    const getDetail = (detailStyle, columnStyles) => {
        return data.map(r => <div style={detailStyle}>{getColumnDetail(r, columnStyles)}</div>);
    };

    const getFooter = () => {
        return "";
    };

    const getGridWidths = () => {
        let retval = "";
        let space = "";
        for (let i = 0; i < initialColumnWidths.length; ++i) {
            retval += (space + (DEFAULT_PIXELS_PER_CHARACTER * initialColumnWidths[i]) + "px");
            space = " ";
        }

        return retval;
    };

    const getHeaderStyle = () => {
        return {
            display: "grid",
            gridTemplateColumns: getGridWidths(),
            position: "sticky",
            textAlign: "center",
            border: "solid 1px #191970",
            color: QUERY_RESULTS_TABLE_HEADER_FORECOLOR,
            background: QUERY_RESULTS_TABLE_HEADER_BKCOLOR,
            fontSize: QUERY_RESULTS_TABLE_HEADER_FONTSIZE,
            fontWeight: QUERY_RESULTS_TABLE_HEADER_FONTWEIGHT
        };
    };

    const getDetailStyle = () => {
        return {
            display: "grid",
            gridTemplateColumns: getGridWidths(),
            color: QUERY_RESULTS_TABLE_DETAIL_FORECOLOR,
            background: QUERY_RESULTS_TABLE_DETAIL_BKCOLOR,
            fontSize: QUERY_RESULTS_TABLE_DETAIL_FONTSIZE,
            fontWeight: QUERY_RESULTS_TABLE_DETAIL_FONTWEIGHT
        };
    };

    const getFooterStyle = () => {
    };

    const getTextAlign = (type) => {
        if (isDataTypeDateTime(type)) {
            return "center";
        } else if (isDataTypeNumeric(type)) {
            return "right";
        } else {
            return "left";
        }
    };

    const getDetailColumnStyles = () => {
        let retval = [];

        for (let i = 0; i < columnTypes.length; ++i) {
            retval.push({
                border: "solid 1px darkslategray",
                textAlign: getTextAlign(columnTypes[i]),
                padding: "3px",
                overflow: "hidden"
            });
        }

        return retval;
    };

    const getTableWidth = () => {
        let retval = 20;
        for (let i = 0; i < initialColumnWidths.length; ++i) {
            retval += (DEFAULT_PIXELS_PER_CHARACTER * initialColumnWidths[i]);
        }

        return retval;
    };

    if (initialColumnWidths) {
        console.log("----->" + JSON.stringify(queryResults));
        return <div style={{width: getTableWidth() + "px"}} className="query-results-table">
            <div style={getHeaderStyle()}>{getHeaderColumns()}</div>
            <div className="query-results-table-body">
                {getDetail(getDetailStyle(), getDetailColumnStyles())}
            </div>
            <div style={getFooterStyle()}>{getFooter()}</div>
        </div>;
    } else {
        return <div className="info-txt">{getText("no query results")}</div>;
    }
};


export default QueryResultsTable;