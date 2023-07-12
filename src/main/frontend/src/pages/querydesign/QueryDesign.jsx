/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from 'react';
import { Tabs, Tab } from "react-bootstrap";
import useMessage from "../../context/MessageContext";
import useAuth from "../../context/AuthContext";
import useLang from "../../context/LangContext";
import useQueryDesign from "../../context/QueryDesignContext";
import useDataHandler from "../../context/DataHandlerContext";
import QueryData from "./QueryData";
import QueryFilter from "./QueryFilter";
import QuerySql from "./QuerySql";
import { flattenTree } from "react-accessible-treeview";
import { hasRoleAccess } from "../../utils/authHelper";
import { Splitter, SplitterPanel } from 'primereact/splitter';
import DataSelectTree from "./DataSelectTree";
import {INFO,
        WARN,
        ERROR,
        DEFAULT_ERROR_TITLE} from "../../utils/helper";

import { getDatasourceTreeViewData, isApiError } from "../../utils/apiHelper"

        const QueryDesign = () => {
    const {authData, setAuthData} = useAuth();
    const {setTreeViewData, setDatasource} = useQueryDesign();
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
        let datasource = e.target.options[e.target.selectedIndex].value;
        let res = await getDatasourceTreeViewData(datasource);
        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            setTreeViewData(flattenTree(res.result));
            setDatasource(datasource);
            hideMessage();
        }
        return "";
    };

    return (
            
            <Splitter stateKey={"qdesign"} stateStorage={"local"} guttorSize={8}>
                <SplitterPanel minSize={5} size={25} className="flex align-items-center justify-content-center">
                    <label>{getText("Datasource")}</label>
                    <select className="ds-sel" title={getText("Select a datasource")} onChange={e => onDatasourceChange(e)}>
                        <option value="" disabled selected hidden>{getText("Select a datasource", "...")}</option>                           
                        {loadDatasourceOptions()}
                    </select>
                    <DataSelectTree/>
                </SplitterPanel>
                <SplitterPanel size={75} className="flex align-items-center justify-content-center">
                    <div className="gdesign-tab-cont">
                        <Tabs defaultActiveKey="dsel" id="qd1" className="mb-3">
                            <Tab eventKey="dsel" title={getText("Data")}>
                                <QueryData/>
                            </Tab> 
                            <Tab eventKey="fil" title={getText("Filter")}>
                                <QueryFilter/>
                            </Tab>
                            <Tab eventKey="sql" title={getText("SQL")}>
                                <QuerySql/>
                            </Tab>
                        </Tabs>
                    </div>  
                </SplitterPanel>
            </Splitter>);

};

export default QueryDesign;
