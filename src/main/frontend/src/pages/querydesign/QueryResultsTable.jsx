/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import useLang from "../context/LangContext";
import useQueryDesign from "../context/QueryDesignContext";


const QueryResultsTable = (props) => {
    const {queryResults} = useQueryDesign();

    const getHeaderColumns = () => {
        return queryResults.header.map(h => <th style="{{width:h.width}} >{h.title}</h>);
    };
    
    const getHeader = () => {
        return <tr>{ getHeaderColumns()}</tr>
    };

    const getColumnDetail = (row) => {
        return row.map((coldata, indx) => <td>{coldata}</td>);
    };
    
    const getDetail = () => {
        return <tr>{ config.data.map(r => getColumnDetail(r))}</tr>
    };

    
    return <div className="qvu-table">
        <table>
            <thead>{getHeader()}</thead>
            <tbody>
                {getDetail()}
            </tbody>
            <tfoot></tfoot>
        </table>
    </div>;
}


export default QueryResultsTable;