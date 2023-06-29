import React, {useContext, useState} from "react";
import Button from "react-bootstrap/Button"
import EntryPanel from "../widgets/EntryPanel";
import useAuth from "../context/AuthContext";
import EditObjectModal from "../widgets/EditObjectModal";
import useMessage from "../context/MessageContext";
import {
INFO,
        checkEntryFields,
        setErrorMessage,
        SECURITY_TYPE_BASIC,
        SECURITY_TYPE_SAML,
        SECURITY_TYPE_OIDC
        } from "../utils/helper";

const InitialSetup = (props) => {
    const {authData} = useAuth();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const [editModal, setEditModal] = useState({show: false});

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

    const hideEdit = () => {
        setEditModal({show: false});
    };

    const saveBasicConfiguratione = (config) => {
        setData({...data, securityConfiguration: null, oidcConfiguration: null, fileBasedSecurity: config.dataObject.fileBaseSecurity});
    };

    const getBasicSecurityConfig = () => {
        return {
            idPrefix: "bsc-",
            show: true,
            title: "Basic Configuration",
            labelWidth: "100px",
            fieldWidth: "150px",
            cancel: hideEdit,
            save: saveBasicConfiguratione,
            dataObject: {fileBasedSecurity: false},
            entryConfig: [{
                    label: "Use File Based Security",
                    name: "allowServiceSave",
                    type: "checkbox",
                    style: {verticalAlign: "middle"},
                    showHelp: showHelp,
                    helpText: "If check, security information such as users and roles will be stored on locally as JSON files"
                }]
        };
    };

    const saveSamlConfiguratione = (config) => {
        setData({...data, fileBasedSecurity: false, oidcConfiguration: null, samlConfiguration: config.dataObject});
    };

    const getSamlSecurityConfig = () => {
        return {
            idPrefix: "bsc-",
            show: true,
            title: "SAML Configuration",
            labelWidth: "100px",
            fieldWidth: "150px",
            gridClass: "entrygrid-200-425",
            cancel: hideEdit,
            save: saveSamlConfiguratione,
            dataObject: {
                idpUrl: "",
                signAssertions: false,
                spEntityId: "",
                signingCertFileName: "",
                signingKeyFileName: ""
            },
            entryConfig: [{
                    label: "IDP URL",
                    name: "idpUrl",
                    type: "input",
                    showHelp: showHelp,
                    helpText: "Identity provider URL"
                },
                {
                    label: "Sign Assertions",
                    name: "signAssertions",
                    type: "checkbox"
                },
                {
                    label: "SP Entity ID",
                    name: "spEntityId",
                    type: "input",
                    showHelp: showHelp,
                    helpText: "Service provider entity id"
                },
                {
                    label: "Signing Cert File",
                    name: "signingCertFileName",
                    type: "input",
                    showHelp: showHelp,
                    helpText: "Path to signing cert file"
                },
                {
                    label: "Signing Key File",
                    name: "signingKeyFileName",
                    type: "input",
                    showHelp: showHelp,
                    helpText: "Path to signing key file"
                }]
        };
    };

    const saveOidcConfiguratione = (config) => {
        setData({...data, fileBasedSecurity: false, oidcConfiguration: config.data, samlConfiguration: null});
    };

    const getOidcSecurityConfig = () => {
        return {
            idPrefix: "bsc-",
            show: true,
            title: "OIDC Configuration",
            labelWidth: "100px",
            fieldWidth: "150px",
            gridClass: "entrygrid-200-425",
            cancel: hideEdit,
            save: saveOidcConfiguratione,
            dataObject: {
                issuerLocationUrl: "",
                clientId: "",
                clientSecret: ""
            },
            entryConfig: [{
                    label: "Issuer Location URL",
                    name: "issuerLocationUrl",
                    type: "input",
                    showHelp: showHelp,
                    helpText: "Issuer Location URL"
                },
                {
                    label: "Client ID",
                    name: "clientId",
                    showHelp: showHelp,
                    helpText: "Issuer Location URL"
                },
                {
                    label: "Client Secret",
                    name: "clientSecret",
                    type: "input",
                    showHelp: showHelp,
                    helpText: "Client Secret"
                }]
        };
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
            entryConfig: [{
                    label: "Configure Security",
                    type: "button",
                    onClick: (c) => {
                        showSecurityConfig(data.securityType);
                    }
                }]

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
            helpText: "If a custom security service is configured then checking this will allow the service to save and delete users and roles"
        }];

    const showSecurityConfig = (type) => {
        switch (type) {
            case SECURITY_TYPE_BASIC:
                setEditModal(getBasicSecurityConfig());
                break;
            case SECURITY_TYPE_SAML:
                setEditModal(getSamlSecurityConfig());
                break;
            case SECURITY_TYPE_OIDC:
                setEditModal(getOidcSecurityConfig());
                break;
        }
    };

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
            setErrorMessage(cfg.idPrefix, "Please ensure valid data is entered in highlighted fields");
        }
    };

    const canSave = () => {
        return data.repository && data.securityType && data.adminPassword;
    };

    return (
            <div className="initial-setup">
                <EditObjectModal config={editModal}/>
            
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