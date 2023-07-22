/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from 'react';
import useMessage from "../../context/MessageContext";
import useLang from "../../context/LangContext";
import useHelp from "../../context/HelpContext";
import SqlDisplay from "./SqlDisplay";
import { Splitter, SplitterPanel } from 'primereact/splitter';

const QuerySql = () => {
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage, setMessageInfo} = useMessage();
     const {showHelp} = useHelp();
    return (<Splitter stateKey={"sql"} layout="vertical" stateStorage={"local"} guttorSize={8}>
        <SplitterPanel minSize={5} size={75} className="flex align-items-center justify-content-center">
            <SqlDisplay/>
        </SplitterPanel>
        <SplitterPanel size={25} className="query-design-cont">
            <div>this is the sql results</div>
        </SplitterPanel>
    </Splitter>);
};

    
export default QuerySql;
