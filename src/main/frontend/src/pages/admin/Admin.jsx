import React, {useContext, useState, useEffect} from "react";
import { Tabs, Tab }from "react-bootstrap";
import useAuth from "../../context/AuthContext";
import useLang from "../../context/LangContext";
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
        testDatasource,
        isApiSuccess,
        isApiError} from "../../utils/apiHelper";

const Admin = () => {
    const {authData, setAuthData} = useAuth();
    const {getText} = useLang();
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
                label: getText("Database Type:"),
                name: "databaseType",
                type: "select",
                options: ["", "MySQL", "Microsoft SQL Server", "Oracle", "PostgreSQL"],
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
                label: getText("Connection Timeout:"),
                name: "connectionTimeout",
                type: "integer"
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
            }, {
                label: getText("Email:"),
                name: "email",
                type: "email",
                validator: {type: "email"}
            }];

        if (isnew) {
            retval.splice(1, 0, {label: getText("Password:"), name: "password", type: "password", required: true, validator: {type: "password"}});
        }

        return retval;
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
            entryConfig: getDatasourceEntryConfig(),
            buttons: [{
                    text: "test",
                    className: "btn btn-primary",
                    onClick: () => {
                        showMessage(INFO, getText("Attempting to connect..."), null, true);
                        if (testDatasource(dataObject)) {
                            showMessage(SUCCESS, getText("Successfully connected to datasoure", "  ") + dataObject.datasourceName, getText(DEFAULT_SUCCESS_TITLE));
                        } else {
                            showMessage(ERROR, getText("Connection failed to datasoure", " ") + dataObject.datasourceName, getText(DEFAULT_ERROR_TITLE));
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
                showMessage(SUCCESS, getText("Datasource", " ") + ds.datasourceName + " " + getText("deleted"), getText(DEFAULT_SUCCESS_TITLE));
            } else {
                showMessage(ERROR, getText("Failed to delete datasource", " ") + ds.datasourceName + " " + getText(res.message), getText(DEFAULT_ERROR_TITLE));
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
                showMessage(SUCCESS, getText("Deleted role", " ") + r.name, getText(DEFAULT_SUCCESS_TITLE));
            } else {
                showMessage(ERROR, formatErrorResponse(res, getText("Failed to delete role", " ") + r.name), getText(DEFAULT_ERROR_TITLE));
            }
        };

        handleOnClick(getText("delete role", " ") + r.name + getText("?"), okFunc);
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
                showMessage(SUCCESS, getText("Deleted user", " ") + u.userId, getText(DEFAULT_SUCCESS_TITLE));
            } else {
                showMessage(ERROR, formatErrorResponse(res, getText("Failed to delete user", " ") + u.userId), getText(DEFAULT_ERROR_TITLE));
            }
        };

        handleOnClick(getText("delete user", " ") + u.name + getText("?"), okFunc);
    };

    const datasourcesConfig = {
        title: "Datasources",
        width: "300px",
        height: "500px",
        addTitle: "Add datasource",
        editTitle: "Edit datasource",
        delTitle: "Delete datasource",
        className: "entrygrid-100-150",
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

    const rolesConfig = {
        title: "Roles",
        width: "300px",
        height: "500px",
        className: "entrygrid-100-150",
        addTitle: "Add role",
        editTitle: "Edit role",
        delTitle: "Delete role",
        onAdd: authData.allowUserRoleEdit ? addRole : null,
        onEdit: authData.allowUserRoleEdit ? editRole : null,
        onDelete: authData.allowUserRoleEdit ? deleteSelectedRole : null,
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
        data: authData.allRoles
    };


    const usersConfig = {
        title: "Users",
        width: "300px",
        height: "500px",
        addTitle: "Add user",
        editTitle: "Edit user",
        delTitle: "Delete user",
        className: "entrygrid-100-150",
        onAdd: authData.allowUserRoleEdit ? addUser : null,
        onEdit: authData.allowUserRoleEdit ? editUser : null,
        onDelete: authData.allowUserRoleEdit ? deleteSelectedUser : null,
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
                setDatasources(await loadDatasources());
                setEditModal({show: false});
                showMessage(SUCCESS, getText("Datasource", " ") + config.dataObject.datasourceName + " " + getText("saved"), getText(DEFAULT_SUCCESS_TITLE));

            } else {
                showMessage(ERROR, formatErrorResponse(res, getText("Failed to save datasource:", " ") + config.dataObject.datasourceName), getText(DEFAULT_ERROR_TITLE));
            }

        } else {
            setErrorMessage(config.idPrefix, getText("please complete all required entries"));
        }
    };

    const saveModifiedRole = async (config) => {
        let ok = checkEntryFields(config);

        if (ok) {
            showMessage(INFO, "Saving role " + config.dataObject.name + "...", null, true);
            let res = await saveRole(config.dataObject);
            if (isApiSuccess(res)) {
                setErrorMessage(config.idPrefix, "");
                setAuthData(await loadAuth());
                setEditModal({show: false});
                showMessage(SUCCESS, "Role " + config.dataObject.name + " saved", getText(DEFAULT_SUCCESS_TITLE));
            } else {
                showMessage(ERROR, formatErrorResponse(res, getText("Failed to save role:", " ") + config.dataObject.name), getText(DEFAULT_ERROR_TITLE));
            }
        } else {
            setErrorMessage(config.idPrefix, getText("please complete all required entries"));
        }
    };

    const saveModifiedUser = async (config) => {
        let ok = checkEntryFields(config);

        if (ok) {
            setErrorMessage(config.idPrefix, "");
            showMessage(INFO, "Saving user " + config.dataObject.userId + "...", null, true);
            let res = await saveUser(config.dataObject);
            if (isApiSuccess(res)) {
                setErrorMessage(config.idPrefix, "");
                setAuthData(await loadAuth());
                setEditModal({show: false});
                showMessage(SUCCESS, getText("User", " ") + config.dataObject.userId + " " + getText("saved"), getText(DEFAULT_SUCCESS_TITLE));
            } else {
                showMessage(ERROR, formatErrorResponse(res, getText("Failed to save user:", " ") + config.dataObject.userId),getText( DEFAULT_ERROR_TITLE));
            }
        } else {
            setErrorMessage(config.idPrefix, getText("please complete all required entries"));
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