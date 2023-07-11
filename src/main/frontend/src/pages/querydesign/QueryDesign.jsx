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
import { flattenTree } from "react-accessible-treeview";

import {
    INFO, 
    WARN, 
    ERROR, 
    DEFAULT_ERROR_TITLE} from "../../utils/helper";
import { hasRoleAccess } from "../../utils/authHelper";

import { Splitter, SplitterPanel } from 'primereact/splitter';
import DataSelectTree from "./DataSelectTree";
import { getDatasourceTreeViewData, isApiError } from "../../utils/apiHelper"

const QueryDesign = () => {
    const {authData, setAuthData} = useAuth();
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage, setMessageInfo} = useMessage();
    const {datasources, setDatasources} = useDataHandler();
    const [treeData, setTreeData] = useState(null);

    const loadDatasourceOptions = () => {
        if (datasources) {
            return datasources.map(d => {
                // handle acces by role if required
                if (hasRoleAccess(d.roles, authData.currentUser.roles)) {
                    return <option value={d.datasourceName}>{d.datasourceName}</option>;
                } else {
                    return "";
                }
            });
        } else {
            return "";
        }
    };

    const onDatasourceChange = async (e) => {
        showMessage(INFO, getText("Loading datasource information", "..."), null, true);
        let res = await getDatasourceTreeViewData(e.target.options[e.target.selectedIndex].value);
        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {    
            let tdata = flattenTree(res.result);
            setTreeData(tdata);
            hideMessage();
        }
        return "";
    };
    
    return (
            <Splitter stateKey={"qdesign"} stateStorage={"local"} guttorSize={8}>
                <SplitterPanel size={25} className="flex align-items-center justify-content-center">
                    <label>{getText("Datasource")}</label>
                    <select className="ds-sel" title={getText("Select a datasource")} onChange={e => onDatasourceChange(e)}>
                        <option value="" disabled selected hidden>{getText("Select a datasource", "...")}</option>                           
                        {loadDatasourceOptions()}
                    </select>
                    <DataSelectTree data={treeData}/>
                </SplitterPanel>
                <SplitterPanel size={75} className="flex align-items-center justify-content-center">
                    Panel 2
                </SplitterPanel>
            </Splitter>);

};

export default QueryDesign;
