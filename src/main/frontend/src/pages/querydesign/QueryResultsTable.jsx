/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import ResponsivePagination from 'react-responsive-pagination';
import useQueryDesign from "../../context/QueryDesignContext";
import useLang from "../../context/LangContext";
import ResultsFilterSelectModal from "./ResultsFilterSelectModal";
import {AiFillCaretUp, AiFillCaretDown, AiFillFilter} from "react-icons/ai";
import 'react-responsive-pagination/themes/minimal.css';
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
        COLOR_BLACK,
        RESULT_SET_PAGE_SIZES,
        DEFAULT_PAGE_SIZE
        } from "../../utils/helper";

const QueryResultsTable = () => {
    const {queryResults,
        currentResultsSort,
        setCurrentResultsSort,
        doSort,
        isCurrentSort,
        currentFilters,
        setCurrentFilters,
        isRowHidden} = useQueryDesign();
    const {getText} = useLang();
    const {data, initialColumnWidths, columnTypes, header} = queryResults;
    const [showFilterModal, setShowFilterModal] = useState({show: false});
    const [totalPages, setTotalPages] = useState(Math.max(0, Math.ceil(data.length / DEFAULT_PAGE_SIZE)));
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

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
        if (currentFilters[indx] && (currentFilters[indx].length > 0)) {
            return COLOR_CRIMSON;
        } else {
            return COLOR_BLACK;
        }
    };

    const getSortFilter = (indx) => {
        if (indx > 0) {
            return <div style={sortFilterStyle}>
                <AiFillCaretUp style={{gridRow: "1", gridColumn: "1", cursor: "pointer", color: getSortColor(indx, "asc")}} size={12} onClick={e => doSort(indx, "asc")}/>
                <AiFillCaretDown style={{gridRow: "2", gridColumn: "1", cursor: "pointer", color: getSortColor(indx, "desc")}} size={12} onClick={e => doSort(indx, "desc")}/>
                <AiFillFilter style={{gridRow: "1/2", gridColumn: "2", marginTop: "5px", cursor: "pointer", color: getFilterColor(indx)}} size={12} onClick={e => filter(indx)}/>
            </div>;
        } else {
            return "";
        }
    };

    const getHeaderColumns = () => {
        return queryResults.header.map((h, indx) => <div id={"h" + indx}>{h}{getSortFilter(indx)}</div>);
    };

    const getDisplayData = (coldata, rownum, indx) => {
        if (indx === 0) {
            return rownum;
        } else {

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
    };

    const getColumnDetail = (row, rownum, columnStyles) => {
        return row.map((coldata, indx) => <div style={columnStyles[indx]}>{getDisplayData(coldata, rownum, indx)}</div>);
    };

    const getStartRow = () => {
        return pageSize * (currentPage - 1);
    };
    
    
    const loadDisplayRecords = () => {
        let retval = [];

        let index = getStartRow();
        if (index > -1) {
            for (let i = 0; i < pageSize; ++i) {
                if (index < data.length) {
                    if (!isRowHidden(data[index])) {
                        retval.push(data[index]);
                        index++;
                    }
                } else {
                    break;
                }
            }
        }

        return retval;
    }

    const getDetail = (detailStyle, columnStyles) => {
        let recs = loadDisplayRecords();
        let rownum = 1;
        return recs.map(r => <div className="query-results-table-det" style={detailStyle}>{getColumnDetail(r, rownum++, columnStyles)}</div>);
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
            gridTemplateColumns: getGridWidths()
        };
    };

    const getDetailStyle = () => {
        return {
            gridTemplateColumns: getGridWidths()
        };
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
                    textAlign: "center"
                });

            }
        }

        return retval;
    };

    const getTableWidth = () => {
        let retval = 0;
        for (let i = 0; i < initialColumnWidths.length; ++i) {
            retval += (DEFAULT_PIXELS_PER_CHARACTER * initialColumnWidths[i]);
        }

        return retval;
    };

    const onPageSize = (e) => {
        let sz = Number(e.target.options[e.target.selectedIndex].value);
        let pages = Math.max(0, Math.ceil(data.length / sz));
        setTotalPages(pages);
        setPageSize(sz);
    };

    const getPageSizes = () => {
        return RESULT_SET_PAGE_SIZES.map(s => {
            if (s === pageSize) {
                return <option value={s} selected>{s}</option>;
            } else {
                return <option value={s}>{s}</option>;
            }
        });
    };

    if (initialColumnWidths) {
        return <div className="query-results-panel">
            <div className="query-results-cont">
                <div style={{width: getTableWidth() + "px"}} className="query-results-table">
                    <ResultsFilterSelectModal config={showFilterModal}/>
                    <div className="query-results-table-hdr" style={getHeaderStyle()}>{getHeaderColumns()}</div>
                    <div className="query-results-table-body">
                        {getDetail(getDetailStyle(), getDetailColumnStyles())}
                    </div>
                </div>
            </div>
            <div className="query-results-footer">
                <span className="page-size-select">
                    {getText("Page Size:")}
                    <select style={{marginLeft: "10px"}} onChange={e => onPageSize(e)}>{getPageSizes()}</select>
                </span>
                <ResponsivePagination
                    current={currentPage}
                    total={totalPages}
                    maxWidth={400}
                    onPageChange={setCurrentPage}/>
            </div>
        </div>;
    } else {
        return <div className="info-txt">{getText("no query results")}</div>;
    }
};


export default QueryResultsTable;