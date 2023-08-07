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

const QuerySql = () => {
    const {getText} = useLang();
    const {showMessage, hideMessage} = useMessage();
    const {splitter1Sizes} = useQueryDesign();
    const {showHelp} = useHelp();
    const {queryResults} = useQueryDesign();

    return (<Splitter layout="vertical" stateKey={"sql"} stateStorage={"local"} guttorSize={8}>
        <SplitterPanel style={{width: Math.floor(splitter1Sizes[1]) + "%"}} className="sql-display-cont">
            <SqlDisplay/>
        </SplitterPanel>
        <SplitterPanel style={{width: Math.floor(splitter1Sizes[1]) + "%"}} className="flex align-items-center justify-content-center">
            <div>{queryResults ? <QueryResultsTable/> : getText("no query results")}</div>
        </SplitterPanel>
    </Splitter>);
};


export default QuerySql;
