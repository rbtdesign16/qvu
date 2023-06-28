import React, {useContext, useState} from "react";
import Button from "react-bootstrap/Button"
import EntryPanel from "../widgets/EntryPanel";
import useAuth from "../context/AuthContext";
import useDataHandler from "../context/DataHandlerContext";
import useMessage from "../context/MessageContext";
import {INFO, checkEntryFields, setErrorMessage} from "../utils/helper";

const InitialSetup = (props) => {
    const {authData} = useAuth();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const {setDatasources} = useDataHandler();
    const [data, setData] = useState({
        repository: "",
        adminPassword: "",
        securityType: "basic",
        securityServiceClass: "",
        fileBasedSecurity: true,
        allowServiceSave: false
    });

    const showHelp = (txt) => {
        showMessage(INFO, txt, "Help");
    };


    const entryConfig1 = [{
            label: "Repository Folder:",
            name: "repository",
            style: {width: "100%"},
            type: "input",
            showHelp: showHelp,
            helpText: "The root folder location where Qvu configuration files and document artifacts will be stored",
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
            label: "File Based Security",
            name: "fileBasedSecurity",
            type: "checkbox",
            style: {verticalAlign: "middle"},
            showHelp: showHelp,
            helpText: "If checked, user and role information will be handled via local json files",
        },
        {
            label: "New Admin Password:",
            name: "adminPassword",
            style: {width: "50%"},
            type: "password",
            required: true,
            validator: {type: "password"}

        },
        {
            label: "",
            type: "label",
            style: {width: "100%"},
            text: "8 characters minimum, mixed case, at leat 1 special character",
            name: "adminPassword"
        },
        {
            label: "Custom Security Class:",
            name: "securityServiceClass",
            type: "input",
            style: {width: "100%"},
            showHelp: showHelp,
            helpText: "To enable custom authetication/security processing implement interface org.rbt.client.utils.Security service and put class name here."

        },
        {
            label: "Allow Custom Service Save",
            name: "allowServiceSave",
            type: "checkbox",
            style: {verticalAlign: "middle"},
            showHelp: showHelp,
            disabled: true,
            helpText: "If a custom security service is configured then checking this will allow the service to save and delete users and roles",
        }];


    const onCancel = () => {
        setData({
            repository: "",
            adminPassword: "",
            securityType: "basic",
            securityServiceClass: "",
            fileBasedSecurity: true,
            allowServiceSave: false
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

        if (e.target.name === "securityType") {
            let el = document.getElementById("init-fileBasedSecurity");
            if (el) {
                el.disabled = (d[e.target.name] !== "basic");
                if (el.disabled) {
                    d.fileBasedSecurity = el.checked = false;
                }
            }
        } else if (e.target.name === "securityServiceClass") {
            let el = document.getElementById("init-allowServiceSave");
            if (el) {
                el.disabled = !d[e.target.name];
                if (el.disabled) {
                    d.allowServiceSave = el.checked = false;
                    el.disabled = true;
                }
            }
        }
        setData(d);
    };

    const getConfig1 = () => {
        return {
            entryConfig: entryConfig1,
            dataObject: data,
            idPrefix: "init-",
            gridClass: "entrygrid-200-425",
            changeHandler: onDataChange};
    };

    const saveSetup = () => {
        let cfg = getConfig1();
        if (checkEntryFields(cfg)) {
            alert("good entries");
        } else {
            setErrorMessage(cfg.idPrefix, "Please ensure valid data is entered in highlighted fields")
        }
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