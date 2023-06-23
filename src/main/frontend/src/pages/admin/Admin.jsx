import React, {useContext, useState, useEffect} from "react";
import { Tabs, Tab }from "react-bootstrap";
import useAuth from "../../context/AuthContext";
import useDataHandler from "../../context/DataHandlerContext";
import useMessage from "../../context/MessageContext";
import EditableDataList from "../../widgets/EditableDataList"
import {INFO, WARN, ERROR} from "../../utils/helper";

const Admin = (props) => {
    const {authData} = useAuth();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const {datasources} = useDataHandler();
    
    const addDatasource = () => {
        alert("add datasource");
    };
    
    const editDatasource = (indx) => {
        
    };
    
    const deleteDatasource = (indx) => {
        let ds = datasources[indx];
        if (window.confirm("delete datasource " + ds.datasourceName + "?")) {
            
        }
        
    };
    
    const addRole = () => {
        
    };
    
    const editRole = (indx) => {
        
    };
    
    const deleteRole = (indx) => {
        let r = authData.allRoles[indx];
        if (window.confirm("delete role " + r.name+ "?")) {
            
        }
        
    };
    
    const addUser = () => {
        
    };
    
    const editUser = (indx) => {
        
    };
    
    const deleteUser = (indx) => {
       let u = authData.allUsers[indx];
        if (window.confirm("delete user " + u.userId + "?")) {
            
        }
        
    };

    const getDatasourcesConfig = () => {
        return {
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
    };
    
    const getRolesConfig = () => {
        let retval = {
            title: "Roles",
            width: "300px",
            height: "500px",
            addTitle: "Add role",
            editTitle: "Edit role",
            delTitle: "Delete role",
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
        
        if (authData.canAddUsersAndRoles) {
            retval.onAdd = addRole;
            retval.onEdit = editRole;
            retval.onDelete = deleteRole;
        }
        
        return retval;
    };
    
    const getUsersConfig = () => {
        let retval = {
            title: "Users",
            width: "300px",
            height: "500px",
            addTitle: "Add user",
            editTitle: "Edit user",
            delTitle: "Delete user",
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
        
        if (authData.canAddUsersAndRoles) {
            retval.onAdd = addUser;
            retval.onEdit = editUser;
            retval.onDelete = deleteUser;
        }

        return retval;
    };
    
    return (
            <div className="admin-tab">
                <EditableDataList listConfig={getDatasourcesConfig()}/>
                <EditableDataList listConfig={getRolesConfig()}/>
                <EditableDataList listConfig={getUsersConfig()}/>
            </div>
            );
}

export default Admin;