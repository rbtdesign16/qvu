import React, {useContext, useState, useEffect} from "react";
import { Tabs, Tab }from "react-bootstrap";
import useAuth from "../../context/AuthContext";
import useMessage from "../../context/MessageContext";
import Message from "../../widgets/Message"
import {INFO, WARN, ERROR} from "../../utils/helper";

const Admin = (props) => {
    const {authenticatedUser, setAuthenticatedUser} = useAuth();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    
    useEffect(() => {  
       showMessage(INFO, "this is a text");
    });
    
    return (
            <div>
                admin
            </div>
            );
}

export default Admin;