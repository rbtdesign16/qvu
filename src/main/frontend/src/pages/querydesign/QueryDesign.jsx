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
import { isQueryDesigner } from "../../utils/authHelper";
import {
SUCCESS,
        INFO,
        WARN,
        ERROR,
        DEFAULT_ERROR_TITLE,
        DEFAULT_DOCUMENT_GROUP,
        QUERY_DOCUMENT_TYPE,
        replaceTokens,
        SPLITTER_GUTTER_SIZE,
        NODE_TYPE_TABLE,
        NODE_TYPE_COLUMN,
        NODE_TYPE_IMPORTED_FOREIGNKEY,
        NODE_TYPE_EXPORTED_FOREIGNKEY
        } from "../../utils/helper";

import { getDatasourceTreeViewData,
        isApiError,
        saveDocument,
        getAvailableDocuments,
        isApiSuccess,
        getDocument} from "../../utils/apiHelper"

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
        setDocument,
        clearData,
        setSelectedTableIds,
        setSelectedColumnIds,
        setBaseTable,
        setSelectColumns,
        setFilterColumns,
        setFromClause,
        setCurrentDocument,
        updateSelectColumns,
        setTreeViewExpandedIds} = useQueryDesign();
    const {getText} = useLang();
    const {showMessage, hideMessage} = useMessage();
    const {datasources, setDatasources, getDatasourceSchema} = useDataHandler();
    const [showSaveDocument, setShowSaveDocument] = useState({show: false, type: QUERY_DOCUMENT_TYPE});
    const [showDocumentSelect, setShowDocumentSelect] = useState({show: false, type: QUERY_DOCUMENT_TYPE});
    const [tabKey, setTabKey] = useState("dsel");

    const getDatasourceDisplayName = (d) => {
        return d.datasourceName + " [" + d.databaseType + "]";
    };
    
    const loadDatasourceOptions = () => {
        if (datasources) {
            return datasources.map(d => {
                // handle acces by role if required
                if (d.enabled && hasRoleAccess(d.roles, authData.currentUser.roles)) {
                    if (treeViewData && datasource && (d.datasourceName === datasource)) {
                        return <option value={d.datasourceName} selected>{getDatasourceDisplayName(d)}</option>;
                    } else {
                        return <option value={d.datasourceName}>{getDatasourceDisplayName(d)}</option>;
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
        setShowSaveDocument({show: true, type: QUERY_DOCUMENT_TYPE, saveDocument: saveQueryDocument, hide: hideShowSave, currentDocument: currentDocument});
    };

    const saveQueryDocument = async (name, group) => {
        let userId = authData.currentUser.userId;
        let actionTimestamp = new Date().toISOString();
        showMessage(INFO, replaceTokens(getText("Saving document", "..."), [name]), null, true);
        let docWrapper = {
            user: userId,
            actionTimestamp: actionTimestamp,
            queryDocument: {
                name: name,
                newRecord: currentDocument.newdoc,
                createdBy: userId,
                updatedBy: userId,
                createDate: actionTimestamp,
                lastUpdated: actionTimestamp,
                datasource: datasource,
                schema: getDatasourceSchema(datasource),
                baseTable: baseTable,
                documentGroupName: group,
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
        setNewDocument();
        let ds = e.target.options[e.target.selectedIndex].value;
        if (ds) {
            updateTreeView(ds);
        }
    };

    const updateTreeView = async (ds) => {
        showMessage(INFO, getText("Loading datasource information", "..."), null, true);
        let res = await getDatasourceTreeViewData(ds);
        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            setTreeViewData(flattenTree(res.result));
            setDatasource(ds);
            hideMessage();
        }
    };

    const isSqlAvailable = () => {
        return (filterColumns && (filterColumns.length > 0));
    };


    const onResizeEnd = (e) => {
        setSplitter1Sizes(e.sizes);
    };

    const getForeignTableFromPathPart = (part) => {
        let pos = part.indexOf("{");
        return part.substring(0, pos);
    };
    
    const getForeignKeyNameFromPathPart = (part) => {
        let pos = part.indexOf("{");
        let pos2 = part.indexOf("@");
        return part.substring(pos + 1, pos2);
    };

    const findNodeId = (parent, path) => {
        let retval;
        let parts = path.split("|");

        for (let i = 0; !retval && (i < parent.children.length); ++i) {
            switch (String(parent.children[i].metadata.type)) {
                case NODE_TYPE_TABLE:
                    if (parts[0] === parent.children[i].metadata.dbname) {
                        retval = findNodeId(parent.children[i], path.substring(path.indexOf("|") + 1));
                    }
                    break;
                case NODE_TYPE_COLUMN:
                    if (parts[0] === parent.children[i].metadata.dbname) {
                        retval = parent.children[i].id;
                    }
                    break;
                case NODE_TYPE_IMPORTED_FOREIGNKEY:
                case NODE_TYPE_EXPORTED_FOREIGNKEY:
                {
                    let fktable = getForeignTableFromPathPart(parts[0]);
                    let fkname = getForeignKeyNameFromPathPart(parts[0]);
                    if ((fktable === parent.children[i].metadata.dbname)
                        && (fkname === parent.children[i].metadata.fkname)) {
                        retval = findNodeId(parent.children[i], path.substring(path.indexOf("|") + 1));
                    }
                }
                break;
            }
        }

        return retval;
    };

    const loadDocument = (group, name) => {
        setNewDocument();
        populateDocument(group, name);
    };

    const populateDocument = async (group, name) => {
        hideDocumentSelect();
        showMessage(INFO, getText("Loading document", " " + name + "..."), null, true);
        
        let res = await getDocument(QUERY_DOCUMENT_TYPE, group, name);
        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            clearData();
            let doc = res.result;
            res = await getDatasourceTreeViewData(doc.datasource);
            if (isApiError(res)) {
                showMessage(ERROR, res.message);
            } else {
                let treeData = res.result;

                let selIds = [];

                for (let i = 0; i < doc.selectColumns.length; ++i) {
                    let nid = findNodeId(treeData, doc.selectColumns[i].path);
                    if (nid) {
                        if (!selIds.includes(nid)) {
                            selIds.push(nid);
                        }
                    }
               }

                treeData = flattenTree(treeData);
                let tids = [];
                let expandedIds = [];
                for (let i = 0; i < selIds.length; ++i) {
                    let pid = treeData[selIds[i]].parent;
                    while (pid) {
                        if (!tids.includes(pid)) {
                            expandedIds.push(pid);
                            tids.push(pid);
                        }
                        pid = treeData[pid].parent;
                    }
                }

                let innerJoins = [];

                for (let i = 0; i < doc.fromClause.length; ++i) {
                    if (doc.fromClause[i].joinType && (doc.fromClause[i].joinType === "inner")) {
                        innerJoins.push(doc.fromClause[i].foreignKeyName);
                    }
                }

                for (let i = 0; i < tids.length; ++i) {
                    if (innerJoins.includes(treeData[tids[i]].metadata.fkname)) {
                        treeData[tids[i]].metadata.jointype = "inner";
                    }
                }

                setDatasource(doc.datasource);
                setTreeViewData(treeData);
                setBaseTable(doc.baseTable);
                setSelectColumns(doc.selectColumns);
                setFromClause(doc.fromClause);
                setSelectedColumnIds(selIds);
                setSelectedTableIds([...tids]);
                setTreeViewExpandedIds(expandedIds);
                setFilterColumns(doc.filterColumns);

                setCurrentDocument({
                    name: doc.name,
                    group: doc.documentGroupName,
                    newRecord: false
                });

                hideMessage();

            }
        }
     };

    const hideDocumentSelect = () => {
        setShowDocumentSelect({show: false});
    };

    const onShowDocumentSelect = async () => {
        showMessage(INFO, replaceTokens(getText("Loading available documents", "..."), QUERY_DOCUMENT_TYPE), null, true);

        let res = await getAvailableDocuments(QUERY_DOCUMENT_TYPE);

        hideMessage();

        if (isApiSuccess(res)) {
            setShowDocumentSelect({show: true, type: QUERY_DOCUMENT_TYPE, hide: hideDocumentSelect, loadDocument: loadDocument, treeRoot: flattenTree(res.result)});
        } else {
            showMessage(ERROR, res.message);
        }
    };

    const onNewDocument = () => {
        setNewDocument();
        setTabKey("dsel");
    };

    const getDocumentInfo = () => {
        return  <span style={{marginLeft: "10px"}} className="cobaltBlue-f">
            <span style={{color: "darkslategray"}}>{getText("Group", ":  ")}</span>
            {currentDocument.group} 
            <span style={{paddingLeft: "15px", color: "darkslategray"}}>{getText("Document", ":  ")}</span>
            {currentDocument.name}
            </span>
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
                {isQueryDesigner(authData) && <Button size="sm"  title={getText("Save Document")}  style={{marginLeft: "5px", marginBottom: "2px"}} disabled={!isSaveEnabled()} onClick={() => onSaveDocument()}>{getText("Save")}</Button>}
                <Button size="sm"  title={getText("New Document")} style={{marginLeft: "5px", marginBottom: "2px"}} onClick={() => onNewDocument()}>{getText("New")}</Button>
                {getDocumentInfo()}
                <Splitter style={{height: "calc(100% - 90px)"}} onResizeEnd={onResizeEnd}  gutterSize={SPLITTER_GUTTER_SIZE}>
                    <SplitterPanel minSize={0} size={splitter1Sizes[0]}>
                        <label className="ck-label">{getText("Datasource")}</label>
                        <select className="ds-sel" title={getText("Select a datasource")} onChange={e => onDatasourceChange(e)}>
                            <option value="" selected={!datasource}></option>                           
                            {loadDatasourceOptions()}
                        </select>
                        <DataSelectTree/>
                    </SplitterPanel>
                    <SplitterPanel size={splitter1Sizes[1]} className="query-design-cont">
                        <Tabs 
                            activeKey={tabKey}
                            onSelect={(k) => setTabKey(k)}
                            id="qd1" className="mb-3">
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
