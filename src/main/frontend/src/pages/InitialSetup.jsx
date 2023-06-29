import React, {useContext, useState} from "react";
import Button from "react-bootstrap/Button"
import EntryPanel from "../widgets/EntryPanel";
import useAuth from "../context/AuthContext";
import useLang from "../context/LangContext";
import EditObjectModal from "../widgets/EditObjectModal";
import useMessage from "../context/MessageContext";
import useHelp from "../context/HelpContext"
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
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const {showHelp} = useHelp();
    const [editModal, setEditModal] = useState({show: false});

    const [data, setData] = useState({
        repository: "",
        adminPassword: "",
        securityType: "basic",
        securityServiceClass: "",
        fileBasedSecurity: true,
        allowServiceSave: false
    });

    const showHelpMessage = (txt) => {
        showHelp(getText(txt));
    };

    const hideEdit = () => {
        setEditModal({show: false});
    };

    const saveBasicConfiguration = (config) => {
        setData({...data, securityConfiguration: null, oidcConfiguration: null, fileBasedSecurity: config.dataObject.fileBaseSecurity});
        hideEdit();
    };

    const getBasicSecurityConfig = () => {
        return {
            idPrefix: "bsc-",
            show: true,
            title: getText("Basic Configuration"),
            labelWidth: "100px",
            fieldWidth: "150px",
            cancel: hideEdit,
            save: saveBasicConfiguration,
            dataObject: {fileBasedSecurity: false},
            entryConfig: [{
                    label: getText("Use File Based Security"),
                    name: "allowServiceSave",
                    type: "checkbox",
                    style: {verticalAlign: "middle"},
                    showHelp: showHelpMessage,
                    helpText: getText("allowServiceSave-help")
                }]
        };
    };

    const saveSamlConfiguration = (config) => {
        let ok = checkEntryFields(config);

        if (ok) {
            setData({...data, fileBasedSecurity: false, oidcConfiguration: null, samlConfiguration: config.dataObject});
            hideEdit();
        } else {
            setErrorMessage(config.idPrefix, getText("Please complete all required entries"));
        }
    };

    const getSamlSecurityConfig = () => {
        return {
            idPrefix: "smlc-",
            show: true,
            title: getText("SAML Configuration"),
            gridClass: "entrygrid-150-425",
            cancel: hideEdit,
            save: saveSamlConfiguration,
            dataObject: {
                idpUrl: "",
                signAssertions: false,
                spEntityId: "",
                signingCertFileName: "",
                signingKeyFileName: ""
            },
            entryConfig: [{
                    label: getText("IDP URL"),
                    name: "idpUrl",
                    type: "input",
                    required: true,
                    showHelp: showHelpMessage,
                    helpText: getText("idpUrl-help")
                },
                {
                    label: getText("SP Entity ID"),
                    name: "spEntityId",
                    type: "input",
                    required: true,
                    showHelp: showHelpMessage,
                    helpText: getText("spEntityId-help")
                },
                {
                    label: getText("Sign Assertions"),
                    name: "signAssertions",
                    type: "checkbox"
                },
                {
                    label: getText("Signing Cert File"),
                    name: "signingCertFileName",
                    type: "input",
                    showHelp: showHelpMessage,
                    helpText: getText("signingCertFileName-help")
                },
                {
                    label: getText("Signing Key File"),
                    name: "signingKeyFileName",
                    type: "input",
                    showHelp: showHelpMessage,
                    helpText: getText("signingKeyFileName-help")
                }]
        };
    };

    const saveOidcConfiguration = (config) => {
        let ok = checkEntryFields(config);
        if (ok) {
            setData({...data, fileBasedSecurity: false, oidcConfiguration: config.data, samlConfiguration: null});
            hideEdit();
        } else {
            setErrorMessage(config.idPrefix, getText("Please complete all required entries"));
        }
    };

    const getOidcSecurityConfig = () => {
        return {
            idPrefix: "oic-",
            show: true,
            title: getText("OIDC Configuration"),
            labelWidth: "100px",
            fieldWidth: "150px",
            gridClass: "entrygrid-200-425",
            cancel: hideEdit,
            save: saveOidcConfiguration,
            dataObject: {
                issuerLocationUrl: "",
                clientId: "",
                clientSecret: ""
            },
            entryConfig: [{
                    label: getText("Issuer Location URL"),
                    name: "issuerLocationUrl",
                    type: "input",
                    required: true,
                    showHelp: showHelpMessage,
                    helpText: getText("issuerLocationUrl-help")
                },
                {
                    label: getText("Client ID"),
                    name: "clientId",
                    type: "input",
                    required: true,
                    showHelp: showHelpMessage,
                    helpText: getText("clientId-help")
                },
                {
                    label: getText("Client Secret"),
                    name: "clientSecret",
                    type: "input",
                    required: true,
                    showHelp: showHelpMessage,
                    helpText: getText("clientSecret-help")
                }]
        };
    };


    const entryConfig1 = [{
            label: getText("Repository Folder:"),
            name: "repository",
            style: {width: "100%"},
            type: "input",
            showHelp: showHelpMessage,
            helpText: getText("repository-help"),
            required: true
        },
        {
            label: getText("Authentication Type:"),
            name: "securityType",
            type: "select",
            options: ["basic", "saml", "oidc"],
            entryConfig: [{
                    label: getText("Configure Security"),
                    type: "button",
                    onClick: (c) => {
                        showSecurityConfig(data.securityType);
                    }
                }]

        },
        {
            label: getText("New Admin Password:"),
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
            text: getText("password-validation-msg"),
            name: "adminPassword"
        },
        {
            label: getText("Custom Security Class:"),
            name: "securityServiceClass",
            type: "input",
            style: {width: "100%"},
            showHelp: showHelpMessage,
            helpText: getText("securityServiceClass-help")

        },
        {
            label: getText("Allow Custom Service Save"),
            name: "allowServiceSave",
            type: "checkbox",
            style: {verticalAlign: "middle"},
            showHelp: showHelpMessage,
            disabled: true,
            helpText: getText("allowServiceSave-help")
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
            setErrorMessage(cfg.idPrefix, getText("please complete all required entries"));
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