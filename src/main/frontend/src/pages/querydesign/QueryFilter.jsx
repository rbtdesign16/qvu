/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState, useEffect } from 'react';
import useMessage from "../../context/MessageContext";
import useAuth from "../../context/AuthContext";
import useLang from "../../context/LangContext";
import useQueryDesign from "../../context/QueryDesignContext";
import useDataHandler from "../../context/DataHandlerContext";
import { MdOutlineAddBox } from 'react-icons/md';
import FilterEntry from "./FilterEntry";
import { SMALL_ICON_SIZE } from "../../utils/helper";

const QueryFilter = () => {
    const {authData, setAuthData} = useAuth();
    const {selectColumns, 
        filterColumns,
        setFilterColumns,
        formatPathForDisplay} = useQueryDesign();
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage, setMessageInfo} = useMessage();
    const [selectColumn, setSelectColumn] = useState(null);
    
    const addFilterColumn = () => {
        let fc = [...filterColumns];
        
        fc.push({
            datasource: selectColumn.datasource,
            tableAlias: selectColumn.tableAlias,
            tableName: selectColumn.tableName,
            columnName: selectColumn.columnName,
            path: selectColumn.path,
            openParenthesis: "",
            closeParenthesis: "",
            andOr: (fc.length > 0) ? "and" : "",
            comparisonOperator: "=",
            comparisonValue: ""

        });
        
        setFilterColumns(fc);
    };
    
    const getOptionTitle = (s) => {
        return getText("Table Alias:", " ") + s.tableAlias + "\n" + getText("Path:", " ") + formatPathForDisplay(s.path);
    };

    const loadSelectColumns = () => {
        return selectColumns.map(s => <option title={getOptionTitle(s)} value={s.path}>{s.displayName}</option>);
    };
    
    const setSelectedColumn = (e) => {
        for (let i = 0; i < selectColumns.length; ++i) {
            if (e.target.value === selectColumns[i].path) {
                setSelectColumn(selectColumns[i]);
                break;
            }
        }
    };
    
    const loadFilterEntries = () => {
        return filterColumns.map((fc, indx) => <FilterEntry filterData={fc} index={indx}/>);
    };
    
    return  <div>
        <div className="query-filter-hdr">
            <span title={getText("Add filter column")}><MdOutlineAddBox size={SMALL_ICON_SIZE} className="icon-m cloverGreen-f" onClick={e => addFilterColumn()}/></span>
           <select onChange={e => setSelectedColumn(e)}><option value=""></option>{loadSelectColumns()}</select>
         </div>
        <div>{loadFilterEntries()}</div>
    </div>
}
    
export default QueryFilter;
