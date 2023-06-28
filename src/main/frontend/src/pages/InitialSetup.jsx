import React, {useContext, useState} from "react";
import Button from "react-bootstrap/Button"
import EntryPanel from "../widgets/EntryPanel";
import useAuth from "../context/AuthContext";
import useDataHandler from "../context/DataHandlerContext";
import useMessage from "../context/MessageContext";

const InitialSetup = (props) => {
    const {authData} = useAuth();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const {setDatasources} = useDataHandler();
    const [data, setData] = useState({
        repository: "",
        adminPassword: "",
        securityType: "basic",
        securityServiceClass: ""
    });

    const entryConfig1 = [{
            label: "Repository Folder:",
            name: "repository",
            type: "input",
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
            label: "New Admin Password:",
            name: "adminPassword",
            type: "password",
            required: true

        },
        {
            label: "Custom Security Class:",
            name: "securityServiceClass",
            type: "input"

        }];
    
    const onCancel = () => {
        setData({
            repository: "",
            adminPassword: "",
            securityType: "basic",
            securityServiceClass: ""
        });
    };
    
    const onDataChange = (e) => {
        let d = {...data};
        if (e.target.options) {
           d[e.target.name] = e.target.options[e.target.selectedIndex].value;
        } else if (e.target.type === "checkbox") {
            d[e.target.name] = e.target.checked;
        } else {
            d[e.target.name] = e.target.value;
        }
        
        setData(d);
    };
    
    const getConfig1 = () => {
        return {
            entryConfig: entryConfig1,
            dataObject: data,
            idPrefix: "init",
            gridClass: "entrygrid-175-225",
            changeHook: onDataChange};
    };
    
    const saveSetup = () => {
    };
    
    const canSave = () => {
        return data.repository && data.securityType && data.adminPassword;
    };
    
    return (
            <div className="initial-setup">
                <div className="title">Qvu Initial Setup</div>
                <div><EntryPanel config={getConfig1()}/></div>
                <div id="init-error-msg"></div>
                <div className="btn-bar bord-top">
                    <Button size="sm" onClick={() => onCancel()}>Cancel</Button>
                    &nbsp;&nbsp;&nbsp;
                    <Button size="sm"  variant="primary" disabled={!canSave()} onClick={() => saveSetup()}>Save Setup</Button>
                </div>
            </div>);
};

export default InitialSetup;