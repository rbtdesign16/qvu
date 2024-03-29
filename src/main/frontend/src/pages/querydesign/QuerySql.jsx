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

    return (<Splitter style={{height: "calc(100% - 70px)"}} layout="vertical" stateKey={"sql"} stateStorage={"local"} gutterSize={SPLITTER_GUTTER_SIZE}>
        <SplitterPanel style={{width: Math.floor(splitter1Sizes[1]) + "%"}} className="sql-display-cont">
            <SqlDisplay/>
        </SplitterPanel>
        <SplitterPanel style={{width: Math.floor(splitter1Sizes[1]) + "%", overflow: "hidden"}} >
            <QueryResultsTable/>
        </SplitterPanel>
    </Splitter>);
};


export default QuerySql;
