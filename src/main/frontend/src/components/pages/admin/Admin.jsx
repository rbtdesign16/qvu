import React, {useContext, useState, useEffect} from "react";
import { Tabs, Tab }from "react-bootstrap";
import MessageContext from "../../../context/message/MessageState";
import AuthContext from "../../../context/auth/AuthState";
import Message from "../../widgets/Message"
import {INFO, WARN, ERROR} from "../../../utils/helper";

const Admin = (props) => {
    /*
    const authContext = useContext(AuthContext);
    const {authenticatedUser} = authContext;
    */
    const messageContext = useContext(MessageContext);
    const {showMessage, hideMessage, currentMessage} = messageContext;
    
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