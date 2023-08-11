/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from "react-bootstrap";
import Button from "react-bootstrap/Button"
import useMessage from "../../context/MessageContext";
import useAuth from "../../context/AuthContext";
import useLang from "../../context/LangContext";
import useQueryDesign from "../../context/QueryDesignContext";
import useDataHandler from "../../context/DataHandlerContext";
import SelectColumnList from "./SelectColumnList";
import QueryFilter from "./QueryFilter";
import QuerySql from "./QuerySql";
import SaveDocumentModal from "../../widgets/SaveDocumentModal";
import DocumentSelectModal from "../../widgets/DocumentSelectModal";
import { flattenTree } from "react-accessible-treeview";
import { hasRoleAccess } from "../../utils/authHelper";
import { Splitter, SplitterPanel } from 'primereact/splitter';
import DataSelectTree from "./DataSelectTree";
import {
SUCCESS,
        INFO,
        WARN,
        ERROR,
        DEFAULT_ERROR_TITLE,
        DEFAULT_DOCUMENT_GROUP,
        QUERY_DOCUMENT_TYPE,
        replaceTokens,
        SPLITTER_GUTTER_SIZE} from "../../utils/helper";

import { getDatasourceTreeViewData,
        isApiError,
        saveDocument} from "../../utils/apiHelper"

        const QueryDesign = () => {
    const {authData, setAuthData} = useAuth();
    const {setTreeViewData,
        treeViewData,
        setDatasource,
        datasource,
        selectColumns,
        filterColumns,
        baseTable,
        fromClause,
        splitter1Sizes,
        setSplitter1Sizes,
        currentDocument,
        setNewDocument,
        setDocument} = useQueryDesign();
    const {getText} = useLang();
    const {showMessage, hideMessage} = useMessage();
    const {datasources, setDatasources} = useDataHandler();
    const [showSaveDocument, setShowSaveDocument] = useState({show: false, type: QUERY_DOCUMENT_TYPE});
    const [showDocumentSelect, setShowDocumentSelect] = useState({show: false, type: QUERY_DOCUMENT_TYPE});

    const loadDatasourceOptions = () => {
        if (datasources) {
            return datasources.map(d => {
                // handle acces by role if required
                if (hasRoleAccess(d.roles, authData.currentUser.roles)) {
                    if (treeViewData && datasource && (d.datasourceName === datasource.datasourceName)) {
                        return <option value={d.datasourceName} selected>{d.datasourceName}</option>;
                    } else {
                        return <option value={d.datasourceName}>{d.datasourceName}</option>;
                    }
                } else {
                    return "";
                }
            });
        } else {
            return "";
        }
    };

    const isValidSelectColumns = () => {
        return (selectColumns && (selectColumns.length > 0));
    };

    const isValidFilterColumns = () => {
        return (filterColumns && (filterColumns.length > 0));
    };

    const isSaveEnabled = () => {
        return  isValidSelectColumns() && isValidFilterColumns();
    };

    const hideShowSave = () => {
        setShowSaveDocument({show: false, type: QUERY_DOCUMENT_TYPE});
    };

    const onSaveDocument = () => {
        setShowSaveDocument({show: true, type: QUERY_DOCUMENT_TYPE, saveDocument: saveQueryDocument, hide: hideShowSave});
    };

    const saveQueryDocument = async (name, group) => {
        let userId = authData.currentUser.userId;
        let actionTimestamp = new Date().toISOString();
        showMessage(INFO, replaceTokens(getText("Saving document", "..."), [name]), null, true);
        let docWrapper = {
            userId: authData.currentUser.userId,
            actionTimestamp: actionTimestamp,
            queryDocument: {
                name: name,
                createdBy: userId,
                updatedBy: userId,
                createDate: actionTimestamp,
                lastUpdated: actionTimestamp,
                datasource: datasource,
                baseTable: baseTable,
                documentGroupName: group,
                newRecord: true,
                selectColumns: selectColumns,
                filterColumns: filterColumns,
                fromClause: fromClause
            }
        };

        let res = await saveDocument(docWrapper);
        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            showMessage(SUCCESS, replaceTokens(getText("Document saved"), [name]));
            hideShowSave();
        }

    };

    const onDatasourceChange = async (e) => {
        let ds = e.target.options[e.target.selectedIndex].value;
        if (ds) {
            showMessage(INFO, getText("Loading datasource information", "..."), null, true);
            let res = await getDatasourceTreeViewData(ds);
            if (isApiError(res)) {
                showMessage(ERROR, res.message);
            } else {
                let treeData = flattenTree(res.result);
                setTreeViewData(treeData);
                setDatasource(ds);
                hideMessage();
            }
        } else {
            setTreeViewData(null);
            setDatasource(null);
        }
    };

    const isSqlAvailable = () => {
        return (
                selectColumns
                && (selectColumns.length > 0)
                && filterColumns
                && (filterColumns.length > 0));
    };


    const onResizeEnd = (e) => {
        setSplitter1Sizes(e.sizes);
    };

    const loadDocument = (docinfo) => {
    };
    
    const hideDocumentSelect = () => {
        setShowDocumentSelect({show: false});
    };
    
    const onShowDocumentSelect = () => {
        setShowDocumentSelect({show: true, type: QUERY_DOCUMENT_TYPE, hide: hideDocumentSelect, loadDocument: loadDocument});
    };
    
    const onNewDocument = () => {
        setNewDocument();
    };
    
    const getDocumentInfo = () => {
        return "    " 
                + getText("Group", ":  ") 
                + currentDocument.group 
                + ",    " 
                + getText("Document", ":  ")
                + currentDocument.name;
    };
    
    useEffect(() => {
        setTreeViewData(null);
        setDatasource(null);
    }, [datasources]);

    return (
            <div className="query-design-tab">
                <SaveDocumentModal config={showSaveDocument}/>
                <DocumentSelectModal config={showDocumentSelect}/>
                <Button size="sm"  title={getText("Load Document")} style={{marginLeft: "5px", marginBottom: "2px"}} onClick={() => onShowDocumentSelect()}>{getText("Load")}</Button>
                <Button size="sm"  title={getText("Save Document")}  style={{marginLeft: "5px", marginBottom: "2px"}} disabled={!isSaveEnabled()} onClick={() => onSaveDocument()}>{getText("Save")}</Button>
                <Button size="sm"  title={getText("New Document")} style={{marginLeft: "5px", marginBottom: "2px"}} onClick={() => onNewDocument()}>{getText("New")}</Button>
                <span className="cobaltBlue-f">{getDocumentInfo()}</span>
                <Splitter style={{height: "calc(100% - 90px)"}} onResizeEnd={onResizeEnd}  gutterSize={SPLITTER_GUTTER_SIZE}>
                    <SplitterPanel minSize={5} size={splitter1Sizes[0]} className="flex align-items-center justify-content-center">
                        <label className="ck-label">{getText("Datasource")}</label>
                        <select className="ds-sel" title={getText("Select a datasource")} onChange={e => onDatasourceChange(e)}>
                            <option value="" selected={!datasource}></option>                           
                            {loadDatasourceOptions()}
                        </select>
                        <DataSelectTree/>
                    </SplitterPanel>
                    <SplitterPanel size={splitter1Sizes[1]} className="query-design-cont">
                        <Tabs defaultActiveKey="dsel" id="qd1" className="mb-3">
                            <Tab eventKey="dsel" title={getText("Data")}>
                                <SelectColumnList className="select-column-list"/>
                            </Tab> 
                            <Tab eventKey="fil" title={getText("Filter")}>
                                <QueryFilter/>
                            </Tab>
                            {isSqlAvailable() &&
                            <Tab eventKey="sql" title={getText("SQL")}>
                                <QuerySql />
                            </Tab>}
                        </Tabs>
                    </SplitterPanel>
                </Splitter>
            </div>);

};

export default QueryDesign;
