/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import useQueryDesign from "../../context/QueryDesignContext";
import useLang from "../../context/LangContext";
import ResultsFilterSelectModal from "./ResultsFilterSelectModal";
import {AiFillCaretUp, AiFillCaretDown, AiFillFilter} from "react-icons/ai";
import "../../css/query-results.css";

import {
    isDataTypeNumeric,
    isDataTypeString,
    isDataTypeDateTime,
    getDisplayDate,
    getDisplayTimestamp,
    getDisplayTime,
    isEmpty,
    JDBC_TYPE_DATE,
    JDBC_TYPE_TIME,
    JDBC_TYPE_TIMESTAMP,
    JDBC_TYPE_TIME_WITH_TIMEZONE,
    JDBC_TYPE_TIMESTAMP_WITH_TIMEZONE,
    DEFAULT_PIXELS_PER_CHARACTER,
    COLOR_CRIMSON,
    COLOR_BLACK
} from "../../utils/helper";

const QueryResultsTable = () => {
    const {queryResults, currentResultsSort, setCurrentResultsSort, doSort, isCurrentSort} = useQueryDesign();
    const {getText} = useLang();
    const {data, initialColumnWidths, columnTypes, header} = queryResults;
    const [showFilterModal, setShowFilterModal] = useState({show: false});
    
    const sortFilterStyle = {
        display: "inline-grid",
        gridTemplateRows: "10px 10px",
        gridTemplateColumns: "10px 10px",
        gridGap: "2px",
        float: "right"
    };
    
    const hideFilterModal = () => {
        setShowFilterModal({show: false});
    };
    
    const filter = (colnum) => {
        setShowFilterModal({show: true, columnIndex: colnum, hide: hideFilterModal});
    };
    
    const getSortColor = (indx, type) => {
        if (isCurrentSort(indx, type)) {
            return COLOR_CRIMSON;
        } else {
            return COLOR_BLACK;
        }
    };
    
    const getFilterColor = (indx) => {
    };

    
    const getSortFilter = (indx) => {
        if (indx > 0) {
            return <div style={sortFilterStyle}>
                <AiFillCaretUp style={{gridRow: "1", gridColumn: "1", cursor: "pointer", color: getSortColor(indx, "asc")}} size={12} onClick={e => doSort(indx, "asc")}/>
                <AiFillCaretDown style={{gridRow: "2", gridColumn: "1",  cursor: "pointer", color: getSortColor(indx, "desc")}} size={12} onClick={e => doSort(indx, "desc")}/>
                <AiFillFilter style={{gridRow: "1/2", gridColumn: "2", marginTop: "5px",  cursor: "pointer", color: getFilterColor(indx)}} size={12} onClick={e => filter(indx)}/>
            </div>;
        } else {
            return "";
        }
    };
    
    const getHeaderColumns = () => {
        return queryResults.header.map((h, indx) => <div id={"h" + indx}>{h}{getSortFilter(indx)}</div>);
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
    };

    const getColumnDetail = (row, columnStyles) => {

        return row.map((coldata, indx) => {
            return <div style={columnStyles[indx]}>{getDisplayData(coldata, indx)}</div>;
        });
    };

    const getDetail = (detailStyle, columnStyles) => {
        return data.map(r => <div className="query-results-table-det" style={detailStyle}>{getColumnDetail(r, columnStyles)}</div>);
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
            gridTemplateColumns: getGridWidths(),
        };
    };

    const getDetailStyle = () => {
        return {
           gridTemplateColumns: getGridWidths()
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
            if (i > 0) {
                retval.push({
                    textAlign: getTextAlign(columnTypes[i])
                });
            } else {
                retval.push({
                    textAlign: "center",
                 });

            }
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
        return <div style={{width: getTableWidth() + "px"}} className="query-results-table">
            <ResultsFilterSelectModal config={showFilterModal}/>
            <div className="query-results-table-hdr" style={getHeaderStyle()}>{getHeaderColumns()}</div>
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