import React, {useContext, useState} from "react";
import useAuth from "../../context/AuthContext";
import useLang from "../../context/LangContext";
import useDataHandler from "../../context/DataHandlerContext";
import useMessage from "../../context/MessageContext";
import useHelp from "../../context/HelpContext";
import {FcServices, FcDataBackup, FcPlanner} from "react-icons/fc";
import EditableDataList from "../../widgets/EditableDataList"
import EditObjectModal from "../../widgets/EditObjectModal";
import TableSettings from "./TableSettings";
import DocumentScheduleTable from "./DocumentScheduleTable";
import SystemSetup from "../../widgets/SystemSetup";
import CustomForeignKeys from "./CustomForeignKeys";
import {
    INFO,
    WARN,
    ERROR,
    SUCCESS,
    confirm,
    isEmpty,
    setFieldError,
    setErrorMessage,
    checkEntryFields,
    updateJsonArray,
    findInArray,
    replaceTokens,
    SMALL_ICON_SIZE,
    DEFAULT_EXPORTED_KEY_DEPTH,
    DEFAULT_IMPORTED_KEY_DEPTH,
    copyObject
    } from "../../utils/helper";

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
    loadDatasourceTableNames,
    getSecurityConfig,
    saveSystemSettings,
    backupRepository,
    saveDocumentSchedules} from "../../utils/apiHelper";
import {
    isAdministrator,
    isQueryDesigner,
    isReportDesigner,
    ADMINISTRATOR_ROLE,
    QUERY_DESIGNER_ROLE,
    REPORT_DESIGNER_ROLE,
    BASE_ROLES,
    ADMIN_USER_ID
    } from "../../utils/authHelper";


const Admin = () => {
    const {authData, setAuthData} = useAuth();
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const {datasources,
        setDatasources,
        databaseTypes,
        datasourceTableNames,
        setDatasourceTableNames,
        documentGroups,
        setDocumentGroups} = useDataHandler();
    const [editModal, setEditModal] = useState({show: false});
    const [tableSettings, setTableSettings] = useState({show: false});
    const [customForeignKeys, setCustomForeignKeys] = useState({show: false});
    const [showSystemSettings, setShowSystemSettings] = useState({show: false});
    const [showScheduleTable, setShowScheduleTable] = useState({show: false});

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
                size: 40,
                required: true
            },
            {
                label: getText("JDBC Driver:"),
                name: "driver",
                size: 40,
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
                label: getText("Imported Key Depth:"),
                name: "maxImportedKeyDepth",
                defaultValue: DEFAULT_IMPORTED_KEY_DEPTH,
                type: "number",
                required: true,
                showHelp: showHelpMessage,
                helpText: getText("datasourceMaxImportedKey-help")
            },
            {
                label: getText("Exported Key Depth:"),
                name: "maxExportedKeyDepth",
                defaultValue: DEFAULT_EXPORTED_KEY_DEPTH,
                type: "number",
                required: true,
                showHelp: showHelpMessage,
                helpText: getText("datasourceMaxExportedKey-help")
            },
            {
                label: getText("Connection Timeout:"),
                name: "connectionTimeout",
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
            },
            {
                label: getText("Enabled:"),
                name: "enabled",
                type: "checkbox"
            }
        ];
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
            }, {
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
            },
            {
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
            retval.splice(2, 0, {label: getText("Repeat Password:"), name: "repeatPassword", type: "password", required: true, validator: {type: "password"}});
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
            authData.allRoles.map(r => retval.push({label: getText(r.name), value: r.name}));
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
                    || (t.roles && t.roles.length > 0)
                    || (t.foreignKeySettings && t.foreignKeySettings.length > 0)
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

            let ds = copyObject(dataObject);
            ds.datasourceTables = t;
            setTableSettings({show: true,
                dataObject: dataObject,
                datasource: ds,
                saveTableSettings: saveTableSettings,
                hideTableSettings: hideTableSettings, tables: t});
        } else {
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
                let dsnames = copyObject(datasourceTableNames);
                dsnames[dataObject.datasourceName] = res.result;
                setDatasourceTableNames(dsnames);
            }
        }

        setCustomForeignKeys({show: true,
            dataObject: dataObject,
            datasource: copyObject(dataObject),
            saveCustomForeignKeys: saveCustomForeignKeys,
            hideCustomForeignKeys: hideCustomForeignKeys});
    };

    const testConnection = async(ds) => {
        showMessage(INFO, getText("Attempting to connect", "..."), null, true);
        let res = await testDatasource(ds);
        if (isApiSuccess(res)) {
            showMessage(SUCCESS, replaceTokens(getText("Successfully connected to datasoure"), [ds.datasourceName]));
        } else {
            showMessage(ERROR, res.message);
        }
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
            gridClass: "entrygrid-210-425",
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
                    onClick: testConnection
                }]
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
        setEditModal(getDatasourceConfig(replaceTokens(getText("Update datasource"), [datasources[indx].datasourceName]), copyObject(datasources[indx])));
    };

    const deleteSelectedDatasource = (indx) => {
        const ds = datasources[indx];

        const okFunc = async () => {
            showMessage(INFO, replaceTokens(getText("Deleting datasource"), [ds.datasourceName + "..."]), getText("Deleting"), true);
            let res = await deleteDatasource(ds.datasourceName);
            if (isApiSuccess(res)) {
                setDatasources(await loadDatasources());
                showMessage(SUCCESS, replaceTokens(getText("Datasource deleted"), [ds.datasourceName]));
            } else {
                showMessage(ERROR, replaceTokens(getText("Failed to delete datasource", [ds.datasourceName, getText(res.message)])));
            }
        };

        handleOnClick(replaceTokens(getText("delete datasource prompt"), [ds.datasourceName]), okFunc);
    };

    const addRole = () => {
        setEditModal(getRoleConfig(getText("Create new role"), {newRecord: true}));
    };

    const editRole = (indx) => {
        let r = authData.allRoles[indx];
        setEditModal(getRoleConfig(replaceTokens(getText("Update role"), [r.name]), copyObject(r)));
    };

    const deleteSelectedRole = async (indx) => {
        const r = authData.allRoles[indx];
        const okFunc = async () => {
            showMessage(INFO, replaceTokens(getText("Deleting role"), [r.name + "..."]), null, true);
            let res = await deleteRole(r.name);

            if (isApiSuccess(res)) {
                setAuthData(await loadAuth());
                showMessage(SUCCESS, replaceTokens(getText("Deleted role"), [r.name]));
            } else {
                showMessage(ERROR, formatErrorResponse(res, replaceTokens(getText("Failed to delete role"), [r.name, res.message])));
            }
        };

        handleOnClick(replaceTokens(getText("delete role prompt"), [r.name]), okFunc);
    };

    const addDocumentGroup = () => {
        setEditModal(getDocumentGroupConfig(getText("Create new group"), {description: "", newRecord: true}));
    };

    const editDocumentGroup = (indx) => {
        let g = documentGroups[indx];
        setEditModal(getDocumentGroupConfig(replaceTokens(getText("Update group"), [g.name]), copyObject(g)));
    };

    const deleteSelectedDocumentGroup = async (indx) => {
        const g = documentGroups[indx];
        const okFunc = async () => {
            showMessage(INFO, replaceTokens(getText("Deleting group"), [g.name + "..."]), null, true);
            let res = await deleteDocumentGroup(g.name);

            if (isApiSuccess(res)) {
                setDocumentGroups(await loadDocumentGroups());
                showMessage(SUCCESS, replaceTokens(getText("Deleted group"), [g.name]));
            } else {
                showMessage(ERROR, formatErrorResponse(res, replaceTokens(getText("Failed to delete group"), [g.name, res.message])));
            }
        };

        handleOnClick(replaceTokens(getText("delete group prompt", " "), [g.name]), okFunc);
    };



    const addUser = () => {
        setEditModal(getUserConfig(getText("Create new user"), {newRecord: true}));
    };

    const editUser = (indx) => {
        let u = authData.allUsers[indx];
        setEditModal(getUserConfig(replaceTokens(getText("Update user"), [u.userId]), copyObject(u)));
    };

    const deleteSelectedUser = async (indx) => {
        const u = authData.allUsers[indx];
        const okFunc = async () => {
            showMessage(INFO, replaceTokens(getText("Deleting user"), [u.userId + "..."]), null, true);
            let res = await deleteUser(u.userId);

            if (isApiSuccess(res)) {
                setAuthData(await loadAuth());
                showMessage(SUCCESS, replaceTokens(getText("Deleted user"), [u.userId]));
            } else {
                showMessage(ERROR, formatErrorResponse(res, getText("Failed to delete user"), [u.userId, res.message]));
            }
        };

        handleOnClick(replaceTokens(getText("delete user prompt"), [u.name]), okFunc);
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
            },
            {
                label: getText("Enabled:"),
                field: "enabled"
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
                field: "name",
                useLang: true
            },
            {
                label: getText("Description:"),
                field: "description",
                useLang: true
            }
        ],
        data: authData.allRoles
    };

    const isDocumentGroupReadOnly = (indx) => {
        return documentGroups[indx].defaultGroup;
    };


    const documentGroupsConfig = {
        title: getText("Document Groups"),
        width: "325px",
        height: "500px",
        className: "entrygrid-100-175",
        addTitle: getText("Add group"),
        editTitle: getText("Edit group"),
        delTitle: getText("Delete group"),
        isReadOnly: isDocumentGroupReadOnly,
        isDeleteable: isDocumentGroupDeleteable,
        onAdd: addDocumentGroup,
        onEdit: editDocumentGroup,
        onDelete: deleteSelectedDocumentGroup,
        displayConfig: [
            {
                label: getText("Name:"),
                field: "name",
                useLang: true
            },
            {
                label: getText("Description:"),
                field: "description",
                useLang: true
            }
        ],
        data: documentGroups
    };

    const isUserReadOnly = (indx) => {
        return (authData.allUsers[indx].userId === ADMIN_USER_ID);
    };


    const usersConfig = {
        title: getText("Users"),
        width: "325px",
        height: "500px",
        addTitle: getText("Add user"),
        editTitle: getText("Edit user"),
        delTitle: getText("Delete user"),
        className: "entrygrid-100-175",
        isReadOnly: isUserReadOnly,
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
            showMessage(INFO, replaceTokens(getText("Saving datasource"), [config.dataObject.datasourceName]), getText("Saving"), true);
            let res = await saveDatasource(config.dataObject);

            if (isApiSuccess(res)) {
                setErrorMessage(config.idPrefix, "");
                setDatasources(res.result);
                setEditModal({show: false});
                showMessage(SUCCESS, replaceTokens(getText("Datasource saved"), [config.dataObject.datasourceName]));

            } else {
                showMessage(ERROR, formatErrorResponse(res, replaceTokens(getText("Failed to save datasource"), [config.dataObject.datasourceName, res.message])));
            }

        } else {
            setErrorMessage(config.idPrefix, getText("please complete all required entries"));
        }
    };

    const saveModifiedRole = async (config) => {
        let ok = checkEntryFields(config);

        if (ok) {
            showMessage(INFO, replaceTokens(getText("Saving role"), [config.dataObject.name]), null, true);
            let res = await saveRole(config.dataObject);
            if (isApiSuccess(res)) {
                setErrorMessage(config.idPrefix, "");
                setAuthData(await loadAuth());
                setEditModal({show: false});
                showMessage(SUCCESS, replaceTokens(getText("Role saved"), [config.dataObject.name]));
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
            showMessage(INFO, replaceTokens(getText("Saving document group"), [config.dataObject.name]), null, true);
            if (!config.dataObject.roles) {
                config.dataObject.roles = [];
            }
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
        let ok = true;
        if (config.dataObject.newRecord) {
            if (config.dataObject.password !== config.dataObject.repeatPassword) {
                setErrorMessage(config.idPrefix, getText("Passwords do not match"));
                ok = false;
            }
        }
        
       if (ok) {
            setErrorMessage(config.idPrefix, "");
           
       //     config.dataObject.repeatPassword = "";
            ok = checkEntryFields(config);
            if (ok) {
                setErrorMessage(config.idPrefix, "");
                showMessage(INFO, replaceTokens(getText("Saving user"), [config.dataObject.userId]), null, true);
                config.dataObject.repeatPassword = "";
                
                let user = copyObject(config.dataObject);
                
                // get rid of the repeat password field
                if (user.newRecord) {
                    delete user.repeatPassword;
                }
                
                if (!user.roles) {
                    user.roles = [];
                }

                let res = await saveUser(user);
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
        }
    };

    const hideSystemSettings = () => {
        setShowSystemSettings({show: false});
    };

    const updateSystemSettings = async (settings) => {
        hideSystemSettings();
        showMessage(INFO, getText("Saving systems settings", "..."), null, true);
        let res = await saveSystemSettings(settings);

        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            showMessage(SUCCESS, getText("System Settings saved"));
        }

    };

    const runBackup = async () => {
        showMessage(INFO, "Backing up repository", "...", null, true);
        let res = await backupRepository();
        if (isApiSuccess(res)) {
            showMessage(SUCCESS, replaceTokens(getText("repository-backup-success"), [res.result]));
        } else {
           showMessage(ERROR, getText(res.message));
       }
            
    };
    
    const hideScheduleTable = () => {
        setShowScheduleTable({show: false});
    };
    
    const saveSchedules = async (schedules) => {
        try {
            hideScheduleTable();
            showMessage(INFO, getText("Saving schedules..."), null, true);
            let res = await saveDocumentSchedules(schedules);
            if (isApiError(res)) {
                showMessage(ERROR, res.message);
            } else {
                showMessage(SUCCESS, getText("Schedules saved"));
            }
        }
        
        catch (e) {
            showMessage(ERROR, e);
        }
    };
    
    const onShowScheduleTable = () => {
        setShowScheduleTable({show: true, hide: hideScheduleTable, save: saveSchedules});
    };
    
    const onBackup = async() => {
        handleOnClick(getText("Backup repository?"), runBackup);
    };
    
    const onSystemSettings = async () => {
        setShowSystemSettings({show: true, hide: hideSystemSettings, save: updateSystemSettings, dlgsize: "lg"});
    };
    
    return (
            <div className="admin-tab">
                <EditObjectModal config={editModal}/>
                <TableSettings config={tableSettings}/>
                <SystemSetup config={showSystemSettings}/>
                <DocumentScheduleTable config={showScheduleTable}/>
                <CustomForeignKeys config={customForeignKeys}/>
                <div>
                    <span style={{cursor: "pointer"}} onClick={e => onSystemSettings()}><FcServices className="icon" size={SMALL_ICON_SIZE} />&nbsp;{getText("System Settings")}</span>
                    <span style={{cursor: "pointer", marginLeft: "15px"}} onClick={e => onShowScheduleTable()}><FcPlanner className="icon" size={SMALL_ICON_SIZE} />&nbsp;{getText("Scheduling")}</span>
                    <span style={{cursor: "pointer", marginLeft: "15px"}} onClick={e => onBackup()}><FcDataBackup className="icon" size={SMALL_ICON_SIZE} />&nbsp;{getText("Repository Backup")}</span>
                </div>
                <EditableDataList listConfig={datasourcesConfig}/>
                <EditableDataList listConfig={rolesConfig}/>
                <EditableDataList listConfig={usersConfig}/>
                <EditableDataList listConfig={documentGroupsConfig}/>
            </div>
            );
};

export default Admin;