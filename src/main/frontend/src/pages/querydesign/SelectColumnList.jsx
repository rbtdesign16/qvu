/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from 'react';
import SelectColumnEntry from "./SelectColumnEntry";
import useQueryDesign from "../../context/QueryDesignContext";

const SelectColumnList = () => {
    const {selectColumns, setSelectedColumns} = useQueryDesign();
    
    const getColumnData = () => {
        if (selectColumns) {
            console.log("------>" + JSON.stringify(selectColumns));
            return selectColumns.map((data, index) => <SelectColumnEntry index={index} columnData={data}/>);
        } else {
            return "";
        }
    };
    
    return <div>
        {getColumnData()}
    </div>;
};
    
export default SelectColumnList;
