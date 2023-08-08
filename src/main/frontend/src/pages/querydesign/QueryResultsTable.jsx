/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import useQueryDesign from "../../context/QueryDesignContext";
import {
isDataTypeNumeric,
        isDataTypeString,
        isDataTypeDateTime,
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

    const getHeaderColumns = () => {
        return queryResults.header.map(h => <div>{h}</div>);
    };

    const getColumnDetail = (row, styles) => {
        return row.map((coldata, indx) => <div style={styles[indx]}>{coldata}</div>);
    };

    const getDetail = (styles) => {
        return <div style={getDetailStyle()} >{ queryResults.data.map(r => getColumnDetail(r, styles))}</div>;
    };

    const getFooter = () => {
        return "";
    };

    const getGridWidths = () => {
        let retval = "";
        let space = "";
        for (let i = 0; i < queryResults.initialColumnWidth.length; ++i) {
            retval += (space + (DEFAULT_PIXELS_PER_CHARACTER * queryResults.initialColumnWidth[i]) + "px");
            space = " ";
        }

        return retval;
    };

    const getHeaderStyle = () => {
        return {
            display: "grid",
            gridTemplateColumns: getGridWidths(),
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

        for (let i = 0; i < queryResults.columnTypes.length; ++i) {
            retval.push({
                border: "solid 1px darkslategray",
                textAlign: getTextAlign(queryResults.columnTypes[i]),
                padding: "3px",
                overflow: "hidden"
            });
        }

        return retval;
    };

    const getTableWidth = () => {
        let retval = 0;
        for (let i = 0; i < queryResults.initialColumnWidth.length; ++i) {
            retval += (DEFAULT_PIXELS_PER_CHARACTER * queryResults.initialColumnWidth[i]);
        }

        return retval;
    };

    if (queryResults && queryResults.initialColumnWidth) {
        let detailStyles = getDetailColumnStyles();

        return <div style={{width: getTableWidth() + "px"}} className="query-results-table">
            <div style={getHeaderStyle()}>{getHeaderColumns()}</div>
            <div style={getDetailStyle()}>
                {getDetail(detailStyles)}
            </div>
            <div style={getFooterStyle()}>{getFooter()}</div>
        </div>;
    } else {
        return "";
    }
};


export default QueryResultsTable;