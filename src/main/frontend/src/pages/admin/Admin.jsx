import React, {useContext, useState, useEffect} from "react";
import useAuth from "../../context/AuthContext";
import useLang from "../../context/LangContext";
import useDataHandler from "../../context/DataHandlerContext";
import useMessage from "../../context/MessageContext";
import useHelp from "../../context/HelpContext";
import EditableDataList from "../../widgets/EditableDataList"
import EditObjectModal from "../../widgets/EditObjectModal";
import TableSettings from "./TableSettings";
import CustomForeignKeys from "./CustomForeignKeys";
import {
        INFO,
        WARN,
        ERROR,
        SUCCESS,
        DEFAULT_SUCCESS_TITLE,
        DEFAULT_ERROR_TITLE,
        ERROR_TEXT_COLOR,
        INFO_TEXT_COLOR,
        confirm,
        isEmpty,
        setFieldError,
        setErrorMessage,
        checkEntryFields,
        updateJsonArray,
        findInArray,
        replaceTokens,
        BASE_ROLES} from "../../utils/helper";

import {
        saveDatasource,
        saveDocumentGroup,
        deleteDocumentGroup,
        saveUser,
        saveRole,
        deleteDatasource,
        deleteRole,
        deleteUser,
        loadDatasources,
        loadDocumentGroups,
        loadAuth,
        formatErrorResponse,
        testDatasource,
        isApiSuccess,
        isApiError,
        loadTableSettings,
        loadDatasourceTableNames} from "../../utils/apiHelper";
import {
    isAdministrator, 
    isQueryDesigner, 
    isReportDesigner,
    DEFAULT_ADMINISTRATOR_ROLE,
    DEFAULT_QUERY_DESIGNER_ROLE,
    DEFAULT_REPORT_DESIGNER_ROLE} from "../../utils/authHelper";


const Admin = () => {
    const {authData, setAuthData} = useAuth();
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const {datasources, setDatasources, databaseTypes, datasourceTableNames, setDatasourceTableNames, documentGroups, setDocumentGroups} = useDataHandler();
    const [editModal, setEditModal] = useState({show: false});
    const [tableSettings, setTableSettings] = useState({show: false});
    const [customForeignKeys, setCustomForeignKeys] = useState({show: false});

    const handleOnClick = async (message, okFunc) => {
        if (await confirm(message)) {
            okFunc();
        }
    };    
    
    const getDatasourceEntryConfig = () => {
        return [
            {
                label: getText("Database Type:"),
                name: "databaseType",
                type: "select",
                options: databaseTypes,
                key: true,
                required: true
            },
            {
                label: getText("Name:"),
                name: "datasourceName",
                type: "input",
                key: true,
                required: true
            },
            {
                label: getText("Description:"),
                name: "description",
                type: "input"
            },
            {
                label: getText("JDBC Url:"),
                name: "url",
                type: "input",
                required: true
            },
            {
                label: getText("JDBC Driver:"),
                name: "driver",
                type: "input",
                required: true
            },
            {
                label: getText("Schema:"),
                name: "schema",
                type: "input",
                required: true
            },
            {
                label: getText("User Name:"),
                name: "username",
                type: "input",
                required: true
            },
            {
                label: getText("Password:"),
                name: "password",
                type: "password",
                required: true
            },
            {
                label: getText("Max Imported Key Depth:"),
                name: "maxImportedKeyDepth",
                default: 2,
                type: "number",
                required: true,
                showHelp: showHelpMessage,
                helpText: getText("datasourceMaxImportedKey-help")
            },
             {
                label: getText("Max Exported Key Depth:"),
                name: "maxExportedKeyDepth",
                default: 4,
                type: "number",
                required: true,
                showHelp: showHelpMessage,
                helpText: getText("datasourceMaxExportedKey-help")
            },
            {
                label: getText("Connection Timeout:"),
                name: "connectionTimeout",
                type: "number",
            },
            {
                label: getText("Idle Timeout:"),
                name: "idleTimeout",
                type: "number"
            },
            {
                label: getText("Max Life Time:"),
                name: "maxLifeTime",
                type: "number"
            },
            {
                label: getText("Max Pool Size:"),
                name: "maxPoolSize",
                type: "number"
            },
            {
                label: getText("Role Access:"),
                name: "roles",
                type: "multiselect",
                options: getAvailableRoles,
                setSelected: setDatasourceRoles,
                getSelected: getDatasourceRoles,
                valueRenderer: rolesValueRenderer,
                showHelp: showHelpMessage,
                helpText: getText("datasourceRoles-help")
            }];
    };

    const getDocumentGroupEntryConfig = () => {
        return [
            {
                label: getText("Name:"),
                name: "name",
                type: "input",
                key: true,
                required: true
            },
            {
                label: getText("Description:"),
                name: "description",
                type: "input"
            },{
                label: getText("Roles:"),
                name: "roles",
                type: "multiselect",
                options: getAvailableRoles,
                setSelected: setDocumentGroupRoles,
                getSelected: getDocumentGroupRoles,
                valueRenderer: rolesValueRenderer
            }];
    };

    
    const getRoleEntryConfig = () => {
        return [
            {
                label: getText("Name:"),
                name: "name",
                type: "input",
                key: true,
                required: true
            },
            {
                label: getText("Description:"),
                name: "description",
                type: "input"
            }];
    };

    const getAliasMessageIfRequired = (rec) => {
        let retval = "";
        
        if (isAdministrator(authData) && (rec.name === authData.administratorRole) && (rec.name !== DEFAULT_ADMINISTRATOR_ROLE)) {
            retval += ("*" + getText("role alias", " ") + getText(DEFAULT_ADMINISTRATOR_ROLE));
        } else if (isQueryDesigner(authData) && (rec.name === authData.queryDesignerRole)  && (rec.name !== DEFAULT_QUERY_DESIGNER_ROLE)) {
           retval += ("*" + getText("role alias", " ") + getText(DEFAULT_QUERY_DESIGNER_ROLE));
        } else if (isQueryDesigner(authData) && (rec.name === authData.reportDesignerRole)  && (rec.name !== DEFAULT_REPORT_DESIGNER_ROLE)) {
           retval += ("*" + getText("role alias", " ") + getText(DEFAULT_REPORT_DESIGNER_ROLE));
        }
        
        return retval;
            
    };
    
    const getUserEntryConfig = (isnew) => {
        let retval = [
            {
                label: getText("User ID:"),
                name: "userId",
                type: "input",
                required: true,
                key: true
            },
            {
                label: getText("First Name:"),
                name: "firstName",
                type: "input"
            },
            {
                label: getText("Last Name:"),
                name: "lastName",
                type: "input"
            }, {
                label: getText("Email:"),
                name: "email",
                type: "email",
                validator: {type: "email"}
            },
            {
                label: getText("Roles:"),
                name: "roles",
                type: "multiselect",
                options: getAvailableRoles,
                setSelected: setUserRoles,
                getSelected: getUserRoles,
                valueRenderer: rolesValueRenderer
            }];

        if (isnew) {
            retval.splice(1, 0, {label: getText("Password:"), name: "password", type: "password", required: true, validator: {type: "password"}});
        }

        return retval;
    };

    const showHelpMessage = (txt) => {
        showHelp(getText(txt));
    };

    const rolesValueRenderer = (c, dataObject, selected, options) => {
        if (selected.length > 0) {
            return getText("Role(s) selected");
        } else {
            return getText("Select roles", "...");
        }
    };

    const canTestDatasource = (listConfig, data) => {
        let retval = true;
        for (let i = 0; i < listConfig.length; ++i) {
            if (listConfig[i].required) {
                if (!data[listConfig[i].name]) {
                    retval = false;
                    break;
                }
            }
        }

        return retval;
    };

    const setDatasourceRoles = (dataObject, selections) => {
        if (selections) {
            if (!dataObject.roles) {
                dataObject.roles = [];
            } else {
                dataObject.roles.length = 0;
            }
            selections.map(s => dataObject.roles.push(s.value));
        }
    };

    const getDatasourceRoles = (dataObject) => {
        let retval = [];

        if (dataObject.roles) {
            dataObject.roles.map(r => retval.push({label: r, value: r}));
        }

        return retval;
    };

    const setUserRoles = (dataObject, selections) => {
        if (selections) {
            if (!dataObject.roles) {
                dataObject.roles = [];
            } else {
                dataObject.roles.length = 0;
            }
            selections.map(s => dataObject.roles.push(s.value));
        }
    };

    const getUserRoles = (dataObject) => {
        let retval = [];

        if (dataObject.roles) {
            dataObject.roles.map(r => retval.push({label: r, value: r}));
        }

        return retval;
    };
    
    const setDocumentGroupRoles = (dataObject, selections) => {
        if (selections) {
            if (!dataObject.roles) {
                dataObject.roles = [];
            } else {
                dataObject.roles.length = 0;
            }
            selections.map(s => dataObject.roles.push(s.value));
        }
    };

    const getDocumentGroupRoles = (dataObject) => {
        let retval = [];

        if (dataObject.roles) {
            dataObject.roles.map(r => retval.push({label: r, value: r}));
        }

        return retval;
    };

    const getAvailableRoles = () => {
        let retval = [];

        if (authData.allRoles) {
            authData.allRoles.map(r => retval.push({label: r.name, value: r.name}));
        }

        return retval;
    };

    const afterDatasourceChange = (e, listConfig, dataObject) => {
        let el = document.getElementById("testds");
        let el2 = document.getElementById("taccess");

        if (el) {
            el.disabled = !canTestDatasource(listConfig, dataObject);
        }

        
        if (el2) {
           if (!el || el.disabled) {
               el2.disabled = true;
           } else {
                el2.disabled = isDatasourceInaccessible(dataObject);
           }
       }

    };

    const isDatasourceInaccessible = async (dataObject) => {
        let el = document.getElementById("taccess");
        if (el) {
            let res = await testDatasource(dataObject);
            el.disabled = isApiError(res);
        } else {
            return true;
        }
                
    };
    
    const saveTableSettings = (dataObject, datasource) => {
        let utables = [];

        datasource.datasourceTables.map(t => {
            // only save rec with settings
            if (t.displayName 
                || t.hide 
                || (t.toles && t.roles.length > 0) 
                || (t.tableColumnSettings && t.tableColumnSettings.length > 0)) {
                utables.push(t);
            }
        });

        dataObject.datasourceTableSettings = utables;
        hideTableSettings();
    };
    
    const hideTableSettings = () => {
        setTableSettings({show: false});
    };

    const showTableSettings = async (dataObject) => {
        showMessage(INFO, getText("Loading table settings", "..."), null, true);
        let res = await loadTableSettings(dataObject);
       
        if (isApiSuccess(res)) {
             let tsMap = new Map();

            dataObject.datasourceTableSettings.map(t => {
                tsMap.set(t.tableName, t);
            });

            let t = [];

            res.result.map(tres => {
                let curt = tsMap.get(tres.tableName);
                if (curt) {
                    t.push(curt);
                } else {
                    t.push(tres);
                }
            });

             hideMessage();

            let ds = {...dataObject};
            ds.datasourceTables = t;
            setTableSettings({show: true, 
                dataObject: dataObject,
                datasource: ds,
                saveTableSettings: saveTableSettings,
                hideTableSettings: hideTableSettings, tables: t});
        }  else {
            showMessage(ERROR, res.message);
        }
    };
    
   
    const saveCustomForeignKeys = (dataObject, fks) => {
        dataObject.customForeignKeys = fks;
        hideCustomForeignKeys();
    };
    
    const hideCustomForeignKeys = () => {
        setCustomForeignKeys({show: false});
    };

    const showCustomForeignKeys = async (dataObject) => {
        if (!datasourceTableNames[dataObject.datasourceName]) {
            showMessage(INFO, getText("Loading custom foreign keys", "..."), true);
            let res = await loadDatasourceTableNames(dataObject.datasourceName);
            if (isApiError(res)) {
                showMessage(ERROR, res.message);
            } else {
                hideMessage();
                let dsnames = {...datasourceTableNames};
                dsnames[dataObject.datasourceName] = res.result;
                setDatasourceTableNames(dsnames);
            }
        }
        
        setCustomForeignKeys({show: true, 
           dataObject: dataObject,
           datasource: {...dataObject},
           saveCustomForeignKeys: saveCustomForeignKeys,
           hideCustomForeignKeys: hideCustomForeignKeys});
    };

    const getDatasourceConfig = (title, dataObject) => {
        return {
            idPrefix: "emo-",
            show: true,
            title: title,
            cancel: hideEdit,
            save: saveModifiedDatasource,
            delete: deleteSelectedDatasource,
            dataObject: dataObject,
            gridClass: "entrygrid-225-425",
            dlgsize: "ds-admin",
            entryConfig: getDatasourceEntryConfig(),
            afterChange: afterDatasourceChange,
            buttons: [
                {
                    id: "tset",
                    text: getText("Table Settings"),
                    className: "btn",
                    disabled: dataObject.newRecord,
                    onClick: showTableSettings
                },
                {
                    id: "cfket",
                    text: getText("Custom Foreign Keys"),
                    className: "btn",
                    disabled: dataObject.newRecord,
                    onClick: showCustomForeignKeys
                },
                {
                    id: "testds",
                    text: getText("Test Connection"),
                    className: "btn btn-primary",
                    disabled: dataObject.newRecord,
                    onClick: async () => {
                        showMessage(INFO, getText("Attempting to connect", "..."), null, true);
                        let res = await testDatasource(dataObject);
                        if (isApiSuccess(res)) {
                            showMessage(SUCCESS, getText("Successfully connected to datasoure", "  ") + dataObject.datasourceName);
                        } else {
                            showMessage(ERROR, res.message);
                        }
                    }}]
        };
    };

    const getRoleConfig = (title, dataObject) => {
        return {
            idPrefix: "emo-",
            show: true,
            title: title,
            cancel: hideEdit,
            save: saveModifiedRole,
            delete: deleteSelectedRole,
            dataObject: dataObject,
            entryConfig: getRoleEntryConfig()
        };
    };

    const getDocumentGroupConfig = (title, dataObject) => {
        return {
            idPrefix: "emo-",
            show: true,
            title: title,
            cancel: hideEdit,
            save: saveModifiedDocumentGroup,
            delete: deleteSelectedDocumentGroup,
            dataObject: dataObject,
            entryConfig: getDocumentGroupEntryConfig()
        };
    };

    const getUserConfig = (title, dataObject) => {
        return {
            idPrefix: "emo-",
            show: true,
            title: title,
            cancel: hideEdit,
            save: saveModifiedUser,
            delete: deleteSelectedUser,
            dataObject: dataObject,
            entryConfig: getUserEntryConfig(dataObject.newRecord)
        };
    };


    const addDatasource = () => {
        setEditModal(getDatasourceConfig(getText("Create new datasource"), {newRecord: true}));
    };

    const editDatasource = (indx) => {
        setEditModal(getDatasourceConfig(getText("Update datasource", " ") + datasources[indx].datasourceName, {...datasources[indx]}));
    };

    const deleteSelectedDatasource = (indx) => {
        const ds = datasources[indx];

        const okFunc = async () => {
            showMessage(INFO, getText("Deleting datasource") + ds.datasourceName + "...", getText("Deleting"), true);
            let res = await deleteDatasource(ds.datasourceName);
            if (isApiSuccess(res)) {
                setDatasources(await loadDatasources());
                showMessage(SUCCESS, getText("Datasource", " ") + ds.datasourceName + " " + getText("deleted"));
            } else {
                showMessage(ERROR, getText("Failed to delete datasource", " ") + ds.datasourceName + " " + getText(res.message));
            }
        };

        handleOnClick(getText("delete datasource", " ") + ds.datasourceName + "?", okFunc);
    };

    const addRole = () => {
        setEditModal(getRoleConfig(getText("Create new role"), {newRecord: true}));
    };

    const editRole = (indx) => {
        let r = authData.allRoles[indx];
        setEditModal(getRoleConfig(getText("Update role", " ") + r.name, {...r}));
    };

    const deleteSelectedRole = async (indx) => {
        const r = authData.allRoles[indx];
        const okFunc = async () => {
            showMessage(INFO, getText("Deleting role", " ") + r.name + "...", null, true);
            let res = await deleteRole(r.name);

            if (isApiSuccess(res)) {
                setAuthData(await loadAuth());
                showMessage(SUCCESS, getText("Deleted role", " ") + r.name);
            } else {
                showMessage(ERROR, formatErrorResponse(res, getText("Failed to delete role", " ") + r.name));
            }
        };

        handleOnClick(getText("delete role", " ") + r.name + getText("?"), okFunc);
    };

   const addDocumentGroup = () => {
        setEditModal(getDocumentGroupConfig(getText("Create new group"), {newRecord: true}));
    };

    const editDocumentGroup = (indx) => {
        let g = documentGroups[indx];
        setEditModal(getDocumentGroupConfig(getText("Update group", " ") + g.name, {...g}));
    };

    const deleteSelectedDocumentGroup = async (indx) => {
        const g = documentGroups[indx];
        const okFunc = async () => {
            showMessage(INFO, getText("Deleting group", " ") + g.name + "...", null, true);
            let res = await deleteDocumentGroup(g.name);

            if (isApiSuccess(res)) {
                setDocumentGroups(await loadDocumentGroups());
                showMessage(SUCCESS, getText("Deleted group", " ") + g.name);
            } else {
                showMessage(ERROR, formatErrorResponse(res, replaceTokens(getText("Failed to delete group"), [g.name])));
            }
        };

        handleOnClick(getText("Delete group", " ") + g.name + getText("?"), okFunc);
    };

    
    
    const addUser = () => {
        setEditModal(getUserConfig(getText("Create new user"), {newRecord: true}));
    };

    const editUser = (indx) => {
        let u = authData.allUsers[indx];
        setEditModal(getUserConfig(getText("Update user", " ") + u.userId, {...u}));
    };

    const deleteSelectedUser = async (indx) => {
        const u = authData.allUsers[indx];
        const okFunc = async () => {
            showMessage(INFO, getText("Deleting user", " ") + u.userId + "...", null, true);
            let res = await deleteUser(u.userId);

            if (isApiSuccess(res)) {
                setAuthData(await loadAuth());
                showMessage(SUCCESS, getText("Deleted user", " ") + u.userId);
            } else {
                showMessage(ERROR, formatErrorResponse(res, getText("Failed to delete user", " ") + u.userId));
            }
        };

        handleOnClick(getText("delete user", " ") + u.name + getText("?"), okFunc);
    };
    
    const isDocumentGroupDeleteable = (indx) => {
         return !documentGroups[indx].defaultGroup;
    };


    const datasourcesConfig = {
        title: getText("Datasources"),
        width: "325px",
        height: "500px",
        addTitle: getText("Add datasource"),
        editTitle: getText("Edit datasource"),
        delTitle: getText("Delete datasource"),
        className: "entrygrid-100-175",
        onAdd: addDatasource,
        onEdit: editDatasource,
        onDelete: deleteSelectedDatasource,
        data: datasources,
        displayConfig: [
            {
                label: getText("Name:"),
                field: "datasourceName"
            },
            {
                label: getText("Description:"),
                field: "description"
            }
        ]
    };

    const isRoleReadOnly = (indx) => {
        return BASE_ROLES.includes(authData.allRoles[indx].name);
    };
    

    const rolesConfig = {
        title: getText("Roles"),
        width: "325px",
        height: "500px",
        className: "entrygrid-100-175",
        addTitle: getText("Add role"),
        editTitle: getText("Edit role"),
        delTitle: getText("Delete role"),
        onAdd: addRole,
        onEdit: editRole,
        onDelete: deleteSelectedRole,
        isReadOnly: isRoleReadOnly,
        displayConfig: [
            {
                label: getText("Name:"),
                field: "name"
            },
            {
                label: getText("Description:"),
                field: "description"
            },
            {
                field: getAliasMessageIfRequired,
                fieldStyle: {color: INFO_TEXT_COLOR}
            }
        ],
        data: authData.allRoles
    };

    const documentGroupsConfig = {
        title: getText("Document Groups"),
        width: "325px",
        height: "500px",
        className: "entrygrid-100-175",
        addTitle: getText("Add group"),
        editTitle: getText("Edit group"),
        delTitle: getText("Delete group"),
        isDeleteable: isDocumentGroupDeleteable,
        onAdd: addDocumentGroup,
        onEdit: editDocumentGroup,
        onDelete: deleteSelectedDocumentGroup,
        displayConfig: [
            {
                label: getText("Name:"),
                field: "name"
            },
            {
                label: getText("Description:"),
                field: "description"
            }
        ],
        data: documentGroups
    };


    const usersConfig = {
        title: getText("Users"),
        width: "325px",
        height: "500px",
        addTitle: getText("Add user"),
        editTitle: getText("Edit user"),
        delTitle: getText("Delete user"),
        className: "entrygrid-100-175",
        onAdd: authData.allowUserAdd ? addUser : null,
        onEdit: editUser,
        onDelete: authData.allowUserDelete ? deleteSelectedUser : null,
        displayConfig: [
            {
                label: getText("User ID:"),
                field: "userId"
            },
            {
                label: getText("First Name:"),
                field: "firstName"
            },
            {
                label: getText("Last Name:"),
                field: "lastName"
            }
        ],
        data: authData.allUsers
    };

    const hideEdit = () => {
        setEditModal({show: false});
    };

    const saveModifiedDatasource = async (config) => {
        let ok = checkEntryFields(config);

        if (ok) {
            showMessage(INFO, getText("Saving datasource", " ") + config.dataObject.datasourceName + "...", getText("Saving"), true);
            let res = await saveDatasource(config.dataObject);
            
            if (isApiSuccess(res)) {
                setErrorMessage(config.idPrefix, "");
                setDatasources(res.result);
                setEditModal({show: false});
                showMessage(SUCCESS, replaceTokens(getText("Datasource saved"), [config.dataObject.datasourceName]));

            } else {
                showMessage(ERROR, formatErrorResponse(res, getText("Failed to save datasource:", " ") + config.dataObject.datasourceName));
            }

        } else {
            setErrorMessage(config.idPrefix, getText("please complete all required entries"));
        }
    };

    const saveModifiedRole = async (config) => {
        let ok = checkEntryFields(config);

        if (ok) {
            showMessage(INFO, replaceTokens(getText("Saving role", "..."),  [config.dataObject.name]), null, true);
            let res = await saveRole(config.dataObject);
            if (isApiSuccess(res)) {
                setErrorMessage(config.idPrefix, "");
                setAuthData(await loadAuth());
                setEditModal({show: false});
                showMessage(SUCCESS, replaceTokens(getText("Role saved"), [config.dataObject.name ]));
            } else {
                showMessage(ERROR, formatErrorResponse(res, getText("Failed to save role:", " ") + config.dataObject.name));
            }
        } else {
            setErrorMessage(config.idPrefix, getText("please complete all required entries"));
        }
    };
    
     const saveModifiedDocumentGroup = async (config) => {
        let ok = checkEntryFields(config);

        if (ok) {
            showMessage(INFO, replaceTokens(getText("Saving document group", "..."), [config.dataObject.name]), null, true);
            let res = await saveDocumentGroup(config.dataObject);
            if (isApiSuccess(res)) {
                setErrorMessage(config.idPrefix, "");
                setDocumentGroups(await loadDocumentGroups());
                setEditModal({show: false});
                showMessage(SUCCESS, replaceTokens(getText("Document group saved"), [config.dataObject.name]));
            } else {
                showMessage(ERROR, formatErrorResponse(res, getText("Failed to save document group:", " ") + config.dataObject.name));
            }
        } else {
            setErrorMessage(config.idPrefix, getText("please complete all required entries"));
        }
    };
    
    const saveModifiedUser = async (config) => {
        let ok = checkEntryFields(config);

        if (ok) {
            setErrorMessage(config.idPrefix, "");
            showMessage(INFO, replaceTokens(getText("Saving user", "..."), [config.dataObject.userId]), null, true);
            let res = await saveUser(config.dataObject);
            if (isApiSuccess(res)) {
                setErrorMessage(config.idPrefix, "");
                setAuthData(await loadAuth());
                setEditModal({show: false});
                showMessage(SUCCESS, replaceTokens(getText("User saved"), [config.dataObject.userId]));
            } else {
                showMessage(ERROR, formatErrorResponse(res, getText("Failed to save user:", " ") + config.dataObject.userId));
            }
        } else {
            setErrorMessage(config.idPrefix, getText("please complete all required entries"));
        }
    };

    return (
            <div className="admin-tab">
                <EditObjectModal config={editModal}/>
                <TableSettings config={tableSettings}/>
                <CustomForeignKeys config={customForeignKeys}/>
                <EditableDataList listConfig={datasourcesConfig}/>
                <EditableDataList listConfig={rolesConfig}/>
                <EditableDataList listConfig={usersConfig}/>
                <EditableDataList listConfig={documentGroupsConfig}/>
            </div>
            );
};

export default Admin;