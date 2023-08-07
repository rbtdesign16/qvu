/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from 'react';
import useMessage from "../../context/MessageContext";
import useAuth from "../../context/AuthContext";
import useLang from "../../context/LangContext";
import useQueryDesign from "../../context/QueryDesignContext";
import useDataHandler from "../../context/DataHandlerContext";
import { MdOutlineAddBox } from 'react-icons/md';
import FilterEntry from "./FilterEntry";
import { BIG_ICON_SIZE} from "../../utils/helper";

const QueryFilter = () => {
    const {authData, setAuthData} = useAuth();
    const {selectColumns,
        filterColumns,
        setFilterColumns,
        formatPathForDisplay, 
        selectedColumnIds} = useQueryDesign();
    const {getText} = useLang();
    const {showMessage, hideMessage} = useMessage();
    const [selectColumn, setSelectColumn] = useState(null);
    
    const addFilterColumn = () => {
        let fc = [...filterColumns];

        fc.push({
            datasource: selectColumn.datasource,
            tableAlias: selectColumn.tableAlias,
            tableName: selectColumn.tableName,
            displayName: selectColumn.displayName,
            columnName: selectColumn.columnName,
            dataType: selectColumn.dataType,
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
        let selcol = null;
        for (let i = 0; i < selectColumns.length; ++i) {
            if (e.target.value === selectColumns[i].path) {
                selcol =  selectColumns[i];
                break;
            }
        }
        
        setSelectColumn(selcol);
        
    };

    const loadFilterEntries = () => {
        return filterColumns.map((fc, indx) => <FilterEntry filterData={fc} index={indx}/>);
    };
    

    return <div className="query-filter-panel">
        <div className="filter-header">
            <span title={getText("Add filter column")}>
                {!selectColumn  ? <MdOutlineAddBox size={BIG_ICON_SIZE} style={{marginBottom: "5px"}} disabled={true} className="icon-m-dis"/>
                    : <MdOutlineAddBox size={BIG_ICON_SIZE} style={{marginBottom: "5px"}} className="icon-m cloverGreen-f" onClick={e => addFilterColumn()}/>}
            </span>
            <select onChange={e => setSelectedColumn(e)}><option value=""></option>{loadSelectColumns()}</select>
        </div>
        <div>{loadFilterEntries()}</div>
    </div>;
};

export default QueryFilter;
