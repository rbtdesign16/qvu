import React, {useContext, useState, useEffect} from "react";
import { Tabs, Tab }from "react-bootstrap";
import useAuth from "../../context/AuthContext";
import useDataHandler from "../../context/DataHandlerContext";
import useMessage from "../../context/MessageContext";
import EditableDataList from "../../widgets/EditableDataList"
import EditDatasource from "./EditDatasource";
import { confirm } from "../../utils/helper";

import {INFO, WARN, ERROR} from "../../utils/helper";

const Admin = (props) => {
    const {authData} = useAuth();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const {datasources} = useDataHandler();
    const [showEdit, setShowEdit] = useState({show: false, datasource: {}});

    const handleOnClick = async (message, okFunc) => {
        if (await confirm(message)) {
            okFunc();
        }
    }
    const addDatasource = () => {
        setShowEdit({show: true, datasource: {}});
    };

    const editDatasource = (indx) => {
        setShowEdit({show: true, datasource: {...datasources[indx]}});
    };

    const deleteDatasource = (indx) => {
        let ds = datasources[indx];
        if (handleOnClick("delete datasource " + ds.datasourceName + "?", () => alert("do delete"))) {
        }

    };

    const addRole = () => {

    };

    const editRole = (indx) => {

    };

    const deleteRole = (indx) => {
        let r = authData.allRoles[indx];
        if (window.confirm("delete role " + r.name + "?", "Cancel")) {

        }

    };

    const addUser = () => {

    };

    const editUser = (indx) => {

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
        onAdd: authData.canAddUsersAndRoles ? addRole : null,
        onEdit: authData.canAddUsersAndRoles ? editRole : null,
        onDelete: authData.canAddUsersAndRoles ? deleteRole : null,
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
        onAdd: authData.canAddUsersAndRoles ? addUser : null,
        onEdit: authData.canAddUsersAndRoles ? editUser : null,
        onDelete: authData.canAddUsersAndRoles ? deleteUser : null,
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
        setShowEdit({show: false, datasource: {}});
    };

    const saveDatasource = (ds) => {
    };
    
    return (
        <div className="admin-tab">
            <EditDatasource show={showEdit.show} datasource={showEdit.datasource} onSave={saveDatasource} onCancel={hideEdit}/>
            <EditableDataList listConfig={datasourcesConfig}/>
            <EditableDataList listConfig={rolesConfig}/>
            <EditableDataList listConfig={usersConfig}/>
        </div>
        );
};

export default Admin;