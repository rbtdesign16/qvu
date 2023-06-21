import React, {useContext, useState, useEffect} from "react";
import { Tabs, Tab }from "react-bootstrap";
import useAuth from "../../context/AuthContext";
import useMessage from "../../context/MessageContext";
import {INFO, WARN, ERROR} from "../../utils/helper";

const Admin = (props) => {
    const {authenticatedUser, setAuthenticatedUser} = useAuth();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    
    return (
            <div>
    <button onClick={(e) => showMessage(INFO, "this is a test", null, true)}>show</button>
            </div>
            );
}

export default Admin;