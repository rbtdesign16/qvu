import React, {useContext, useState, useEffect} from "react";
import { Tabs, Tab }from "react-bootstrap";
import useAuth from "../../context/AuthContext";
import useMessage from "../../context/MessageContext";
import EditableDataList from "../../widgets/EditableDataList"
import {INFO, WARN, ERROR} from "../../utils/helper";

const Admin = (props) => {
    const {authData} = useAuth();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    
    const getDatasourcesConfig = () => {
        return {
            title: "Datasources",
            width: "400px",
            height: "500px",
            addTitle: "Add datasource",
            canAdd: true,
            data: []
        };
    }
    
    const getRolesConfig = () => {
        return {
            title: "Roles",
            width: "150px",
            height: "500px",
            addTitle: "Add role",
            data: []
        };
    }
    
    const getUsersConfig = () => {
        return {
            title: "Users",
            width: "200px",
            height: "500px",
            addTitle: "Add user",
            data: []
        };
    }
    
    return (
            <div className="admin-tab">
                <EditableDataList listConfig={getDatasourcesConfig()}/>
                <EditableDataList listConfig={getRolesConfig()}/>
                <EditableDataList listConfig={getUsersConfig()}/>
            </div>
            );
}

export default Admin;