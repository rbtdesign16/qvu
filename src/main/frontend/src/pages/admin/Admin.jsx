import React, {useContext, useState, useEffect} from "react";
import { Tabs, Tab }from "react-bootstrap";
import useAuth from "../../context/AuthContext";
import useDataHandler from "../../context/DataHandlerContext";
import useMessage from "../../context/MessageContext";
import EditableDataList from "../../widgets/EditableDataList"
import EditObjectModal from "../../widgets/EditObjectModal";
import { confirm } from "../../utils/helper";

import {INFO, WARN, ERROR} from "../../utils/helper";

const Admin = (props) => {
    const {authData} = useAuth();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const {datasources} = useDataHandler();
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
            key: true
        },
        {
            label: "Name:",
            name: "datasourceName",
            type: "input",
            key: true
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
            key: true
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
                onClick: () => {alert("test");}
                }]
        };
    };
    
    const getRoleConfig = (title, isNew, dataObject) => {
        return {
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
        }
    };

    const addRole = () => {
         setEditModal(getRoleConfig("Create new role", true, {}));
    };

    const editRole = (indx) => {
        let r = authData.allRoles[indx];
        setEditModal(getRoleConfig("Update role " + r.name, true, {...r}));
    };

    const deleteRole = (indx) => {
        let r = authData.allRoles[indx];
        if (window.confirm("delete role " + r.name + "?", "Cancel")) {

        }

    };

    const addUser = () => {
         setEditModal(getUserConfig("Create new user", true, {}));
    };

    const editUser = (indx) => {
        let u = authData.allUsers[indx];
        setEditModal(getUserConfig("Update user " + u.userId, true, {...u}));
    };

    const deleteUser = (indx) => {
        let u = authData.allUsers[indx];
        if (window.confirm("delete user " + u.userId + "?", "Cancel")) {

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

    const saveDatasource = (ds) => {
    };

    const saveRole = (r) => {
    };

    const saveUser = (u) => {
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