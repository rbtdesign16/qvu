/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, {useState} from "react";
import Button from "react-bootstrap/Button"
import useLang from "../context/LangContext";
import PropTypes from "prop-types";


const QvuTable = (props) => {
    const {config} = props;

    const getHeaderColumn = () => {
        return config.header.map(h => <th style="{{width:h.width}} >{h.title}</h>);
    };
    
    const getHeader = () => {
        return <tr>{ getHeaderColumns()}</tr>
    };

    const getColumnDetail = (r) => {
        return row.map((c, indx) => <td>config.data[indx][config.header[indx].field]</td>);
    };
    
    const getDetail = () => {
        return <tr>{ config.data.map(r => getColumnDetail(r))}</tr>
    };

    
    return <div className=""qvu-table>
        <table>
            <thead>{getHeader()}</thead>
            <tbody>
                {getDetail()}
            </tbody>
        </table>
    </div>;
}


export default QvuTable;