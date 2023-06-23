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
        
    };
    
    const addRole = () => {
        
    };
    
    const editRole = (indx) => {
        
    };
    
    const deleteRole = (indx) => {
        
    };
    
    const addUser = () => {
        
    };
    
    const editUser = (indx) => {
        
    };
    
    const deleteUser = (indx) => {
        
    };

    const getDatasourcesConfig = () => {
        return {
            title: "Datasources",
            width: "400px",
            height: "500px",
            addTitle: "Add datasource",
            canAdd: true,
            onAdd: addDatasource,
            onEdit: editDatasource,
            onDelete: deleteDatasource,
            data: datasources
        };
    };
    
    const getRolesConfig = () => {
        return {
            title: "Roles",
            width: "150px",
            height: "500px",
            addTitle: "Add role",
            canAdd: authData.canAddUsersAndRoles,
            onAdd: addRole,
            onEdit: editRole,
            onDelete: deleteRole,
            data: authData.allRoles
        };
    };
    
    const getUsersConfig = () => {
        return {
            title: "Users",
            width: "200px",
            height: "500px",
            addTitle: "Add user",
            canAdd: authData.canAddUsersAndRoles,
            onAdd: addUser,
            onEdit: editUser,
            onDelete: deleteUser,
            data: authData.allUsers
        };
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