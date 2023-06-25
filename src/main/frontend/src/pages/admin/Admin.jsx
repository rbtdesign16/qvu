import React, {useContext, useState, useEffect} from "react";
import { Tabs, Tab }from "react-bootstrap";
import useAuth from "../../context/AuthContext";
import useDataHandler from "../../context/DataHandlerContext";
import useMessage from "../../context/MessageContext";
import EditableDataList from "../../widgets/EditableDataList"
import EditObjectModal from "../../widgets/EditObjectModal";
import { confirm, 
    isEmpty, 
    setFieldError, 
    setErrorMessage, 
    checkEntryFields,
    updateJsonArray} from "../../utils/helper";

import {INFO, WARN, ERROR} from "../../utils/helper";

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
                options: ["MySQL", "Microsoft SQL Server", "Oracle", "PostgreSQL"],
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
                type: "integer"
            },
            {
                label: "Max Life Time:",
                name: "maxLifeTime",
                type: "integer"
            },
            {
                label: "Max Pool Size:",
                name: "maxPoolSize",
                type: "integer"
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
    }

    const getUserEntryConfig = () => {
        return [
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
            }];
    };

    const getDatasourceConfig = (title, isNew, dataObject) => {
        return {
            idPrefix: "emo-",
            show: true,
            newObject: isNew,
            title: title,
            labelWidth: "150px",
            fieldWidth: "200px",
            cancel: hideEdit,
            save: saveDatasource,
            dataObject: dataObject,
            entryConfig: getDatasourceEntryConfig(),
            buttons: [{
                    text: "test",
                    className: "btn btn-primary",
                    onClick: () => {
                        alert("test");
                    }
                }]
        };
    };

    const getRoleConfig = (title, isNew, dataObject) => {
        return {
            idPrefix: "emo-",
            show: true,
            newObject: isNew,
            title: title,
            labelWidth: "100px",
            fieldWidth: "150px",
            cancel: hideEdit,
            save: saveRole,
            dataObject: dataObject,
            entryConfig: getRoleEntryConfig()
        };
    };


    const getUserConfig = (title, isNew, dataObject) => {
        return {
            idPrefix: "emo-",
            show: true,
            newObject: isNew,
            title: title,
            labelWidth: "150px",
            fieldWidth: "200px",
            cancel: hideEdit,
            save: saveUser,
            dataObject: dataObject,
            entryConfig: getUserEntryConfig()
        };
    };

    const addDatasource = () => {
        setEditModal(getDatasourceConfig("Create new datasource", true, {}));
    };

    const editDatasource = (indx) => {
        setEditModal(getDatasourceConfig("Update datasource " + datasources[indx].datasourceName, false, {...datasources[indx]}));
    };

    const deleteDatasource = (indx) => {
        let ds = datasources[indx];
        if (handleOnClick("delete datasource " + ds.datasourceName + "?", () => alert("do delete"))) {
            let indx = datasources.findIndex((cds) => ds.datasourceName === ds.datasourceName);
            let newDatasouces = [...datasources];
            if (indx > -1) { 
                newDatasources.splice(indx, 1); 
                setDatasources(newDatasources);
            }
        }
    };

    const addRole = () => {
        setEditModal(getRoleConfig("Create new role", true, {}));
    };

    const editRole = (indx) => {
        let r = authData.allRoles[indx];
        setEditModal(getRoleConfig("Update role " + r.name, false, {...r}));
    };

    const deleteRole = (indx) => {
        let r = authData.allRoles[indx];
        if (window.confirm("delete role " + r.name + "?", "Cancel")) {
            let newRoles = [...authData.allRoles];
            let indx = newRoles.findIndex((cr) => cr.name === r.name);
            if (indx > -1) { 
                newRoles.splice(indx, 1); 
                setAuthData({...authData, allRoles: newRoles});
            }
        }
    };

    const addUser = () => {
        setEditModal(getUserConfig("Create new user", true, {}));
    };

    const editUser = (indx) => {
        let u = authData.allUsers[indx];
        setEditModal(getUserConfig("Update user " + u.userId, false, {...u}));
    };

    const deleteUser = (indx) => {
        let u = authData.allUsers[indx];
        if (window.confirm("delete user " + u.userId + "?", "Cancel")) {
            let newUsers = [...authData.allUsers];
            let indx = newUsers.findIndex((cu) => cu.userId === u.userId);
            if (indx > -1) { 
                newUsers.splice(indx, 1); 
                setAuthData({...authData, allUsers: newUsers})
            }
        }
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
        onDelete: deleteDatasource,
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
        onDelete: authData.allowUserRoleEdit ? deleteRole : null,
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
        onDelete: authData.allowUserRoleEdit ? deleteUser : null,
        labelStyle: {
            width: "85px"
        },
        fieldStyle: {
            width: "100px"
        },
        displayConfig: [
            {
                label: "User ID:",
                field: "userId"
            }
        ],
        data: authData.allUsers
    };

    const hideEdit = () => {
        setEditModal({show: false});
    };

   
    const saveDatasource = (config) => {
        let ok = checkEntryFields(config);

        if (ok) {
            setErrorMessage(config.idPrefix, "");
            let newDatasources = [...datasources];
            updateJsonArray("datasourceName", config.dataObject, newDatasources);
            setDatasources(newDatasources)
            setEditModal({show: false});

        } else {
            setErrorMessage(config.idPrefix, "please complete all required entries");
        }
    };

    const saveRole = (config) => {
       let ok = checkEntryFields(config);

        if (ok) {
            setErrorMessage(config.idPrefix, "");
            let newRoles = [... authData.allRoles];
            updateJsonArray("name", config.dataObject, newRoles);
            setAUthData({...authData, allRoles: newRoles});
            setEditModal({show: false});
        } else {
            setErrorMessage(config.idPrefix, "please complete all required entries");
        }
    };

    const saveUser = (config) => {
       let ok = checkEntryFields(config);

        if (ok) {
            setErrorMessage(config.idPrefix, "");
            let newUsers = [...authData.allUsers]
            updateJsonArray("userId", config.dataObject,newUsers );
            setAuthData({...authData, allUsers: newUsers});
            setEditModal({show: false});
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