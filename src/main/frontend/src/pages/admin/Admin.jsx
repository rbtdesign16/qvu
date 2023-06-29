import React, {useContext, useState, useEffect} from "react";
import { Tabs, Tab }from "react-bootstrap";
import useAuth from "../../context/AuthContext";
import useDataHandler from "../../context/DataHandlerContext";
import useMessage from "../../context/MessageContext";
import EditableDataList from "../../widgets/EditableDataList"
import EditObjectModal from "../../widgets/EditObjectModal";
import {
INFO,
        WARN,
        ERROR,
        SUCCESS,
        DEFAULT_SUCCESS_TITLE,
        DEFAULT_ERROR_TITLE,
        confirm,
        isEmpty,
        setFieldError,
        setErrorMessage,
        checkEntryFields,
        updateJsonArray} from "../../utils/helper";

import {
saveDatasource,
        saveUser,
        saveRole,
        deleteDatasource,
        deleteRole,
        deleteUser,
        loadDatasources,
        loadAuth,
        formatErrorResponse,
        testDatasource} from "../../utils/apiHelper";

const Admin = (props) => {
    const {authData, setAuthData} = useAuth();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const {datasources, setDatasources} = useDataHandler();
    const [editModal, setEditModal] = useState({show: false});

    const handleOnClick = async (message, okFunc) => {
        if (await confirm(message)) {
            okFunc();
        }
    };

    const getDatasourceEntryConfig = () => {
        return [
            {
                label: "Database Type:",
                name: "databaseType",
                type: "select",
                options: ["", "MySQL", "Microsoft SQL Server", "Oracle", "PostgreSQL"],
                key: true,
                required: true
            },
            {
                label: "Name:",
                name: "datasourceName",
                type: "input",
                key: true,
                required: true
            },
            {
                label: "Description:",
                name: "description",
                type: "input"
            },
            {
                label: "JDBC Url:",
                name: "url",
                type: "input",
                required: true
            },
            {
                label: "JDBC Driver:",
                name: "driver",
                type: "input",
                required: true
            },
            {
                label: "User Name:",
                name: "username",
                type: "input",
                required: true
            },
            {
                label: "Password:",
                name: "password",
                type: "password",
                required: true
            },
            {
                label: "Connection Timeout:",
                name: "connectionTimeout",
                type: "integer"
            },
            {
                label: "Idle Timeout:",
                name: "idleTimeout",
                type: "number"
            },
            {
                label: "Max Life Time:",
                name: "maxLifeTime",
                type: "number"
            },
            {
                label: "Max Pool Size:",
                name: "maxPoolSize",
                type: "number"
            }];
    };

    const getRoleEntryConfig = () => {
        return [
            {
                label: "Name:",
                name: "name",
                type: "input",
                key: true,
                required: true
            },
            {
                label: "Description:",
                name: "description",
                type: "input"
            }];
    };

    const getUserEntryConfig = (isnew) => {
        let retval = [
            {
                label: "User ID:",
                name: "userId",
                type: "input",
                required: true,
                key: true
            },
            {
                label: "First Name:",
                name: "firstName",
                type: "input"
            },
            {
                label: "Last Name:",
                name: "lastName",
                type: "input"
            }, {
                label: "Email:",
                name: "email",
                type: "email",
                validator: {type: "email"}
            }];

        if (isnew) {
            retval.splice(1, 0, {label: "Password:", name: "password", type: "password", required: true, validator: {type: "password"}});
        }

        return retval;
    };

    const getDatasourceConfig = (title, dataObject) => {
        return {
            idPrefix: "emo-",
            show: true,
            title: title,
            labelWidth: "150px",
            fieldWidth: "200px",
            cancel: hideEdit,
            save: saveModifiedDatasource,
            delete: deleteSelectedDatasource,
            dataObject: dataObject,
            entryConfig: getDatasourceEntryConfig(),
            buttons: [{
                    text: "test",
                    className: "btn btn-primary",
                    onClick: () => {
                        showMessage(INFO, "Attempting to connect...", null, true);
                        if (testDatasource(dataObject)) {
                            showMessage(SUCCESS, "Successfully connected to datasoure " + dataObject.datasourceName, DEFAULT_SUCCESS_TITLE);
                        } else {
                            showMessage(ERROR, "Connection failed to datasoure " + dataObject.datasourceName, DEFAULT_ERROR_TITLE);
                        }
                    }
                }]
        };
    };

    const getRoleConfig = (title, dataObject) => {
        return {
            idPrefix: "emo-",
            show: true,
            title: title,
            labelWidth: "100px",
            fieldWidth: "150px",
            cancel: hideEdit,
            save: saveModifiedRole,
            delete: deleteSelectedRole,
            dataObject: dataObject,
            entryConfig: getRoleEntryConfig()
        };
    };


    const getUserConfig = (title, dataObject) => {
        return {
            idPrefix: "emo-",
            show: true,
            title: title,
            labelWidth: "150px",
            fieldWidth: "200px",
            cancel: hideEdit,
            save: saveModifiedUser,
            delete: deleteSelectedUser,
            dataObject: dataObject,
            entryConfig: getUserEntryConfig(dataObject.newRecord)
        };
    };


    const addDatasource = () => {
        setEditModal(getDatasourceConfig("Create new datasource", {newRecord: true}));
    };

    const editDatasource = (indx) => {
        setEditModal(getDatasourceConfig("Update datasource " + datasources[indx].datasourceName, {...datasources[indx]}));
    };

    const deleteSelectedDatasource = (indx) => {
        const ds = datasources[indx];

        const okFunc = async () => {
            showMessage(INFO, "Deleting datasource" + ds.datasourceName + "...", "Deleting", true);
            let res = await deleteDatasource(ds.datasourceName);
            if (!res.errorCode) {
                setDatasources(await loadDatasources());
                showMessage(SUCCESS, "Datasource " + ds.datasourceName + " deleted", DEFAULT_SUCCESS_TITLE);
            } else {
                showMessage(ERROR, "Failed to delete datasource " + ds.datasourceName + " " + res.message, DEFAULT_ERROR_TITLE);
            }
        };

        handleOnClick("delete datasource " + ds.datasourceName + "?", okFunc);
    };

    const addRole = () => {
        setEditModal(getRoleConfig("Create new role", {newRecord: true}));
    };

    const editRole = (indx) => {
        let r = authData.allRoles[indx];
        setEditModal(getRoleConfig("Update role " + r.name, {...r}));
    };

    const deleteSelectedRole = async (indx) => {
        const r = authData.allRoles[indx];
        const okFunc = async () => {
            showMessage(INFO, "Deleting role" + r.name + "...", null, true);
            let res = await deleteRole(r.name);

            if (!res.errorCode) {
                setAuthData(await loadAuth());
                showMessage(SUCCESS, "Deleted role " + r.name, DEFAULT_SUCCESS_TITLE);
            } else {
                showMessage(ERROR, formatErrorResponse(res, "Failed to delete role " + r.name), DEFAULT_ERROR_TITLE);
            }
        };

        handleOnClick("delete role " + r.name + "?", okFunc);
    };

    const addUser = () => {
        setEditModal(getUserConfig("Create new user", {newRecord: true}));
    };

    const editUser = (indx) => {
        let u = authData.allUsers[indx];
        setEditModal(getUserConfig("Update user " + u.userId, {...u}));
    };

    const deleteSelectedUser = async (indx) => {
        const u = authData.allUsers[indx];
        const okFunc = async () => {
            showMessage(INFO, "Deleting user" + u.userId + "...", null, true);
            let res = await deleteUser(u.userId);

            if (!res.errorCode) {
                setAuthData(await loadAuth());
                showMessage(SUCCESS, "Deleted user " + u.userId, DEFAULT_SUCCESS_TITLE);
            } else {
                showMessage(ERROR, formatErrorResponse(res, "Failed to delete user " + u.userId), DEFAULT_ERROR_TITLE);
            }
        };

        handleOnClick("delete user " + u.name + "?", okFunc);
    };

    const datasourcesConfig = {
        title: "Datasources",
        width: "300px",
        height: "500px",
        addTitle: "Add datasource",
        editTitle: "Edit datasource",
        delTitle: "Delete datasource",
        onAdd: addDatasource,
        onEdit: editDatasource,
        onDelete: deleteSelectedDatasource,
        data: datasources,
        labelStyle: {
            width: "85px"
        },
        fieldStyle: {
            width: "100px"
        },
        displayConfig: [
            {
                label: "Name:",
                field: "datasourceName"
            },
            {
                label: "Description: ",
                field: "description"
            }
        ]
    };

    const rolesConfig = {
        title: "Roles",
        width: "300px",
        height: "500px",
        addTitle: "Add role",
        editTitle: "Edit role",
        delTitle: "Delete role",
        onAdd: authData.allowUserRoleEdit ? addRole : null,
        onEdit: authData.allowUserRoleEdit ? editRole : null,
        onDelete: authData.allowUserRoleEdit ? deleteSelectedRole : null,
        labelStyle: {
            width: "85px"
        },
        fieldStyle: {
            width: "100px"
        },
        displayConfig: [
            {
                label: "Name:",
                field: "name"
            },
            {
                label: "Description:",
                field: "description"
            }
        ],
        data: authData.allRoles
    };


    const usersConfig = {
        title: "Users",
        width: "300px",
        height: "500px",
        addTitle: "Add user",
        editTitle: "Edit user",
        delTitle: "Delete user",
        onAdd: authData.allowUserRoleEdit ? addUser : null,
        onEdit: authData.allowUserRoleEdit ? editUser : null,
        onDelete: authData.allowUserRoleEdit ? deleteSelectedUser : null,
        labelStyle: {
            width: "85px"
        },
        fieldStyle: {
            width: "120px"
        },
        displayConfig: [
            {
                label: "User ID:",
                field: "userId"
            },
            {
                label: "First Name:",
                field: "firstName"
            },
            {
                label: "Last Name:",
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
            showMessage(INFO, "Saving datasource" + config.dataObject.datasourceName + "...", "Saving", true);
            let res = await saveDatasource(config.dataObject);
            if (!res.errorCode) {
                setErrorMessage(config.idPrefix, "");
                setDatasources(await loadDatasources());
                setEditModal({show: false});
                showMessage(SUCCESS, "Datasource " + config.dataObject.datasourceName + " saved", DEFAULT_SUCCESS_TITLE);

            } else {
                showMessage(ERROR, formatErrorResponse(res, "Failed to save datasource: " + config.dataObject.datasourceName), DEFAULT_ERROR_TITLE);
            }

        } else {
            setErrorMessage(config.idPrefix, "please complete all required entries");
        }
    };

    const saveModifiedRole = async (config) => {
        let ok = checkEntryFields(config);

        if (ok) {
            showMessage(INFO, "Saving role " + config.dataObject.name + "...", null, true);
            let res = await saveRole(config.dataObject);
            if (!res.errorCode) {
                setErrorMessage(config.idPrefix, "");
                setAuthData(await loadAuth());
                setEditModal({show: false});
                showMessage(SUCCESS, "Role " + config.dataObject.name + " saved", DEFAULT_SUCCESS_TITLE);
            } else {
                showMessage(ERROR, formatErrorResponse(res, "Failed to save role: " + config.dataObject.name), DEFAULT_ERROR_TITLE);
            }
        } else {
            setErrorMessage(config.idPrefix, "please complete all required entries");
        }
    };

    const saveModifiedUser = async (config) => {
        let ok = checkEntryFields(config);

        if (ok) {
            setErrorMessage(config.idPrefix, "");
            showMessage(INFO, "Saving user " + config.dataObject.userId + "...", null, true);
            let res = await saveUser(config.dataObject);
            if (!res.errorCode) {
                setErrorMessage(config.idPrefix, "");
                setAuthData(await loadAuth());
                setEditModal({show: false});
                showMessage(SUCCESS, "User " + config.dataObject.userId + " saved", DEFAULT_SUCCESS_TITLE);
            } else {
                showMessage(ERROR, formatErrorResponse(res, "Failed to save user: " + config.dataObject.userId), DEFAULT_ERROR_TITLE);
            }
        } else {
            setErrorMessage(config.idPrefix, "please complete all required entries");
        }
    };

    return (
            <div className="admin-tab">
                <EditObjectModal config={editModal}/>
                <EditableDataList listConfig={datasourcesConfig}/>
                <EditableDataList listConfig={rolesConfig}/>
                <EditableDataList listConfig={usersConfig}/>
            </div>
            );
};

export default Admin;