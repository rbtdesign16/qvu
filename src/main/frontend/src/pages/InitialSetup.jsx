import React, {useContext, useState} from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button"
import EntryPanel from "../widgets/EntryPanel";
import useAuth from "../context/AuthContext";
import useDataHandler from "../context/DataHandlerContext";
import useMessage from "../context/MessageContext";

const InitialSetup = (props) => {
const {authData, setAuthData} = useAuth();
        const {messageInfo, showMessage, hideMessage} = useMessage();
        const {setDatasources} = useDataHandler();
        
        const navigate = useNavigate ();

        const data = {
            repository: "",
            adminPassword: "",
            securityType: "basic"
        };
        
        const entryConfig1 = [{
            label: "Repository Folder:",
            name: "repository",
            type: "file",
            required: true
        },
        {
            label: "Authentication Type:",
            name: "securityType",
            type: "select",
            options: ["basic", "saml", "oidc"],
            required: true
        },
        {
            label: "Admin Password:",
            name: "adminPassword",
            type: "password"
        }];
    
        const config1 = {
            entryConfig: entryConfig1,
            dataObject: data,
            idPrefix: "init"
        };
        
        const saveSetup = () => {
            
        };
        
        const canSave = () => {
            return data.repository && data.securityType && data.adminPassword;
        };
        
        return (
                <div className="initial-setup">
                    <div className="title">Qvu Initial Setup</div>
                    <div><EntryPanel config={config1}/></div>
                    <div id="init-error-msg"></div>
                        <Button size="sm" onClick={() => navidate("/")}>Cancel</Button>
                        <Button size="sm" variant="primary" disabled={!canSave()} onClick={() => saveSetup()}>Save Setup</Button>
                </div>);
    };

    export default InitialSetup;