import React, { useState } from 'react';
import SelectColumnEntry from "./SelectColumnEntry";
import useQueryDesign from "../../context/QueryDesignContext";


const SelectColumnList = () => {
    const {selectColumns, setSelectedColumns, selectedColumnIds} = useQueryDesign();

    const getColumnData = () => {
        if (selectColumns) {
            return selectColumns.map((d, index) => <SelectColumnEntry index={index}/>);
        } else {
            return "";
        }
    };
    
    return <div>
        {getColumnData()}
    </div>;
};
    
export default SelectColumnList;
