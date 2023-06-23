import React, {useContext, useState, useEffect} from "react";
import { Tabs, Tab }from "react-bootstrap";
import useAuth from "../../context/AuthContext";
import useMessage from "../../context/MessageContext";
import ObjectArrayPanel from "../../widgets/ObjectArrayPanel"
import {INFO, WARN, ERROR} from "../../utils/helper";

const Admin = (props) => {
    const {authData} = useAuth();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    
    return (
            <div className="admin-tab">
                <ObjectArrayPanel title="Datasources" width="400px" height="500px"/>
                <ObjectArrayPanel title="Roles" width="150px"  height="500px"/>
                <ObjectArrayPanel title="Users" width="200px"  height="500px"/>
            </div>
            );
}

export default Admin;