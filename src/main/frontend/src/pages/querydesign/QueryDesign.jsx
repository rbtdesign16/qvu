/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from 'react';
import { Tabs, Tab } from "react-bootstrap";
import useMessage from "../../context/MessageContext";
import useAuth from "../../context/AuthContext";
import useLang from "../../context/LangContext";
import useDataHandler from "../../context/DataHandlerContext";
import {INFO, WARN, ERROR} from "../../utils/helper";
import { Splitter, SplitterPanel } from 'primereact/splitter';
import DataSelectTree from "./DataSelectTree";

const QueryDesign = () => {
    const {authData, setAuthData} = useAuth();
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const {datasources, setDatasources} = useDataHandler();

    const loadDatasourceOptions = () => {
        return datasources.map(d => <option value={d.datasourceName}>{d.datasourceName}</option>);
    };

    const onDatasourceChange = (e) => {
        alert (e.target.options[e.target.selectedIndex].value);
    };
    
    return (
            <Splitter stateKey={"qdesign"} stateStorage={"local"} guttorSize={8}>
                <SplitterPanel size={25} className="flex align-items-center justify-content-center">
                    <div>
                    <label>Datasource</label>
                        <select className="ds-sel" title={getText("Select a datasource")} onChange={e => onDatasourceChange(e)}>
                            <option value="" disabled selected hidden>{getText("Select a datasource", "...")}</option>                           
                            {loadDatasourceOptions()}
                        </select>
                        <DataSelectTree/>
                    </div>
                </SplitterPanel>
                <SplitterPanel size={75} className="flex align-items-center justify-content-center">
                    Panel 2
                </SplitterPanel>
            </Splitter>);

};

export default QueryDesign;
