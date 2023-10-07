import React, { useState } from "react";
import PropTypes from "prop-types";
import { isNotEmpty } from "../utils/helper";

const DataTable = (props) => {
    const {columnDefs, className, data} = props;
    const getHeader = () => {
        let style = getComputedStyle(document.documentElement);
        return columnDefs.map(c => {
            let myStyle = {
                top: 0,
                position: "sticky",
                zIndex: 100,
                textAlign: "center",
                backgroundColor: style.getPropertyValue('--query-results-table-hdr-data-bkcolor')
            };

            if (c.hstyle) {
                for (let p in c.hstyle) {
                    myStyle[p] = c.hstyle[p];
                }
            }

            return <div style={myStyle}>{c.title}</div>;
        });
    };

    const getColumns = (rownum, row) => {
        return columnDefs.map(c => {
            let myStyle = {};
            if (c.style) {
                myStyle = c.style;
            }


            if (c.fieldName) {
                if (!row[c.fieldName] || (Array.isArray(row[c.fieldName]) && row[c.fieldName].length === 0)) {
                    if (c.defaultValue) {
                        return <div style={myStyle}>{c.defaultValue}</div>;
                    } else {
                        return <div style={myStyle}></div>;
                    }
                } else {
                    if (c.formatForDisplay) {
                        return <div style={myStyle}>{c.formatForDisplay(row[c.fieldName])}</div>;
                    } else if (Array.isArray(row[c.fieldName])) {
                        return <div style={myStyle}>{row[c.fieldName].join(", ")}</div>;
                    } else {
                        return <div style={myStyle}>{row[c.fieldName]}</div>;
                    }
                }
            } else if (c.render) {
                return <div style={myStyle}>{c.render(rownum, row)}</div>;
            } else {
                return <div></div>;
            }
        });
    };

    const getBody = () => {
        if (data && (data.length > 0)) {
            return data.map((row, indx) => {
                return getColumns(indx, row);
            });
        } else {
            return "";
        }
    };

    return (
            <div className={className + "-cont"}>
                <div className={className}>
                    {getHeader()}
                    {getBody()}
                </div>
            </div>);
};

DataTable.propTypes = {
    columnDefs: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    containerClass: PropTypes.string.isRequired,
    headerClass: PropTypes.string.isRequired,
    bodyClass: PropTypes.string.isRequired
};

DataTable.defaultProps = {
    data: []
};

export default DataTable;
