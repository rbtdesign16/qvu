import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import useQueryDesign from "../../context/QueryDesignContext";
import useLang from "../../context/LangContext";
import ResultsFilterSelectModal from "./ResultsFilterSelectModal";
import PageControl from "../../widgets/PageControl";
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
        COLOR_BLACK,
        ARROW_UP_KEY,
        ARROW_DOWN_KEY,
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
    const {data, initialColumnWidths, columnTypes, header} = queryResults ? queryResults : {data: [], initialColumnWidth: [], columnTypes: [], header: []};
    const [showFilterModal, setShowFilterModal] = useState({show: false});
    const [pagingInfo, setPagingInfo] = useState({currentPage: 1, 
        pageSize: DEFAULT_PAGE_SIZE, 
        pageCount: Math.max(1, Math.ceil(data.length / DEFAULT_PAGE_SIZE)),
        visibleRecordCount: data.length});

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
        setShowFilterModal({show: true, columnIndex: colnum, hide: hideFilterModal, setFilters: setFilters});
    };

    const setFilters = (filters) => {
        hideFilterModal();
        setPagingInfo({...pagingInfo, currentPage: 1});
        setCurrentFilters(filters);
    };
    
    
    const haveFilters = () => {
        for (let i = 1; i < header.length; ++i) {
            if (currentFilters[i] && (currentFilters[i].length > 0)) {
                return true;
            }
        }
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
        return header.map((h, indx) => <div id={"h" + indx}>{h}{getSortFilter(indx)}</div>);
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
        return pagingInfo.pageSize * (pagingInfo.currentPage - 1);
    };

    const getVisibleRecords = () => {
        let retval = [];
        
        if (!haveFilters()) {
            retval = data;
        } else {
            data.map(r => {
                if (!isRowHidden(r)) {
                    retval.push(r);
                }
            });
        }
        
        
        return retval;
    };

    const loadDisplayRecords = () => {
        let retval = [];

        let vrecs = getVisibleRecords();
        let index = getStartRow();
        if (index > -1) {
            for (let i = 0; i < pagingInfo.pageSize; ++i) {
                if (index < vrecs.length) {
                    retval.push(vrecs[index]);
                    index++;
                } else {
                    break;
                }
            }
        }
 
        let tpg = Math.max(1, Math.ceil(vrecs.length / pagingInfo.pageSize));

        if (tpg !== pagingInfo.pageCount) {
            setPagingInfo({...pagingInfo, pageCount: tpg, visibleRecordCount: vrecs.length});
        }
        
        
        return retval;
    };

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
                <PageControl pagingInfo={pagingInfo} setPagingInfo={setPagingInfo} dataSet={data} elapsedTime={queryResults.elapsedTimeSeconds}/>
             </div>
        </div>;
    } else {
        return <div className="info-txt">{getText("no query results")}</div>;
    }
};


export default QueryResultsTable;