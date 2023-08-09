/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from 'react';
import useMessage from "../../context/MessageContext";
import useLang from "../../context/LangContext";
import useHelp from "../../context/HelpContext";
import useQueryDesign from "../../context/QueryDesignContext";
import SqlDisplay from "./SqlDisplay";
import QueryResultsTable from "./QueryResultsTable"
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { SPLITTER_GUTTER_SIZE } from "../../utils/helper"
const QuerySql = () => {
    const {getText} = useLang();
    const {showMessage, hideMessage} = useMessage();
    const {splitter1Sizes} = useQueryDesign();
    const {showHelp} = useHelp();
    const {queryResults} = useQueryDesign();

    return (<Splitter layout="vertical" stateKey={"sql"} stateStorage={"local"} gutterSize={SPLITTER_GUTTER_SIZE}>
        <SplitterPanel style={{width: Math.floor(splitter1Sizes[1]) + "%"}} className="sql-display-cont">
            <SqlDisplay/>
        </SplitterPanel>
        <SplitterPanel style={{width: Math.floor(splitter1Sizes[1]) + "%"}} className="query-results-cont">
            <QueryResultsTable/>
        </SplitterPanel>
    </Splitter>);
};


export default QuerySql;
