import React, { useState } from "react";
import PropTypes from "prop-types";

const DataTable = (props) => {
    const {columnDefs, containerClass, headerClass, bodyClass, data} = props;
    const getHeader = () => {
        return columnDefs.map(h => <div>{h.title}</div>);
    };

    const getColumns = (rownum, row) => {
        return columnDefs.map(c => {
            let myStyle = {};
            if (c.align) {
                myStyle.textAlign = c.align;
            }
            
            if (c.fieldName) {
                if (c.formatForDisplay) {
                    return <div style={myStyle}>{c.formatForDisplay(row[c.fieldName])}</div>;
                } else {
                    return <div style={myStyle}>{row[c.fieldName]}</div>;
                }
            } else if (c.render) {
                return c.render(rownum, row);
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
            <div className={containerClass}>
                <div className={headerClass}>{getHeader()}</div>
                <div className={bodyClass}>{getBody()}</div>
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
