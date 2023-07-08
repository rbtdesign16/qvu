import React, {useContext, useState} from "react";
import Button from "react-bootstrap/Button";
import EntryPanel from "../../widgets/EntryPanel";
import useAuth from "../../context/AuthContext";
import useLang from "../../context/LangContext";
import EditObjectModal from "../../widgets/EditObjectModal";
import Splash from "../../widgets/Splash";
import useMessage from "../../context/MessageContext";
import useHelp from "../../context/HelpContext";
import {
    INFO,
    ERROR,
    checkEntryFields,
    setErrorMessage,
    ERROR_TEXT_COLOR,
    SUCCESS_TEXT_COLOR,
    DEFAULT_ERROR_TITLE,
    replaceTokens
} from "../../utils/helper";

import {
    SECURITY_TYPE_BASIC,
    SECURITY_TYPE_SAML,
    SECURITY_TYPE_OIDC,
} from "../../utils/authHelper";

import {
    verifyInitialRepositoryFolder,
    doInitialSetup,
    isApiError,
    isApiSuccess} from "../../utils/apiHelper";

const InitialSetup = () => {
    const {authData} = useAuth();
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const {showHelp} = useHelp();
    const [editModal, setEditModal] = useState({show: false});
    const [initComplete, setInitComplete] = useState(false);
    const [toggle, setToggle] = useState(false);
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
        setData({...data, securityConfiguration: null, oidcConfiguration: null, basicConfiguration: config.dataObject});
        hideEdit();
    };

    const onBasicDataChange = (e, cfg, dobj) => {
        if (e.target.name === "fileBasedSecurity") {
            cfg[1].disabled = !e.target.checked;
            cfg[1].required = !cfg[1].disabled;
            if (cfg[1].disabled) {
                let el = document.getElementById("bsc-adminPassword");
                if (el) {
                    el.value = "";
                }
                dobj.adminPassword = "";
            }

            return true;
        }
    };

    const getBasicSecurityConfig = () => {
        return {
            idPrefix: "bsc-",
            show: true,
            title: getText("Basic Configuration"),
            cancel: hideEdit,
            gridClass: "entrygrid-200-425",
            save: saveBasicConfiguration,
            afterChange: onBasicDataChange,
            dataObject: data.basicConfiguration ? data.basicConfiguration : {fileBasedSecurity: true, adminPassword: ""},
            entryConfig: [{
                    label: getText("Use File Based Security"),
                    name: "fileBasedSecurity",
                    type: "checkbox",
                    style: {verticalAlign: "middle"},
                    showHelp: showHelpMessage,
                    helpText: getText("fileBasedSecurty-help")
                },
                {
                    label: getText("Admin Password:"),
                    name: "adminPassword",
                    size: 25,
                    type: "password",
                    required: true,
                    disabled: false,
                    validator: {type: "password"},
                    showHelp: showHelpMessage,
                    helpText: getText("adminPassword-help")
                },
                {
                    label: "",
                    type: "label",
                    style: {width: "50%"},
                    text: getText("password-validation-msg")
                }
            ]
        };
    };

    const saveSamlConfiguration = (config) => {
        let ok = checkEntryFields(config);

        if (ok) {
            setData({...data, oidcConfiguration: null, samlConfiguration: config.dataObject});
            hideEdit();
        } else {
            setErrorMessage(config.idPrefix, getText("Please complete all required entries"));
        }
    };

    const onSamlDataChange = (e, cfg, dobj) => {
        if (e.target.name === "signAssertions") {
            cfg[3].required = cfg[4].required = e.target.checked;
            cfg[3].disabled = cfg[4].disabled = !e.target.checked;
            if (!e.target.checked) {
                dobj.signingCertFileName = "";
                dobj.signingKeyFileName = "";
            }
            return true;
        }
    };


    const getSamlSecurityConfig = () => {
        return {
            idPrefix: "smlc-",
            show: true,
            title: getText("SAML Configuration"),
            gridClass: "entrygrid-200-425",
            cancel: hideEdit,
            save: saveSamlConfiguration,
            dlgsize: "lg",
            afterChange: onSamlDataChange,
            dataObject: data.samlConfiguration ? data.samlConfiguration : {
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
                    size: 60,
                    required: true,
                    showHelp: showHelpMessage,
                    helpText: getText("idpUrl-help")
                },
                {
                    label: getText("SP Entity ID"),
                    name: "spEntityId",
                    type: "input",
                    size: 40,
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
                    disabled: true,
                    type: "input",
                    size: 60,
                    showHelp: showHelpMessage,
                    helpText: getText("signingCertFileName-help")
                },
                {
                    label: getText("Signing Key File"),
                    name: "signingKeyFileName",
                    type: "input",
                    size: 60,
                    disabled: true,
                    showHelp: showHelpMessage,
                    helpText: getText("signingKeyFileName-help")
                }]
        };
    };

    const saveOidcConfiguration = (config) => {
        let ok = checkEntryFields(config);
        if (ok) {
            setData({...data, fileBasedSecurity: false, oidcConfiguration: config.dataObject, samlConfiguration: null});
            hideEdit();
        } else {
            setErrorMessage(config.idPrefix, getText("Please complete all required entries"));
        }
    };

    const getOidcSecurityConfig = () => {
        return {
            idPrefix: "oic-",
            show: true,
            dlgsize: "lg",
            title: getText("OIDC Configuration"),
            gridClass: "entrygrid-200-425",
            cancel: hideEdit,
            save: saveOidcConfiguration,
            dataObject: data.oidcConfiguration ? data.oidcConfiguration : {
                issuerLocationUrl: "",
                clientId: "",
                clientSecret: ""
            },
            entryConfig: [{
                    label: getText("Issuer Location URL"),
                    name: "issuerLocationUrl",
                    type: "input",
                    size: 60,
                    required: true,
                    showHelp: showHelpMessage,
                    helpText: getText("issuerLocationUrl-help")
                },
                {
                    label: getText("Client ID"),
                    name: "clientId",
                    type: "input",
                    size: 40,
                    required: true,
                    showHelp: showHelpMessage,
                    helpText: getText("clientId-help")
                },
                {
                    label: getText("Client Secret"),
                    name: "clientSecret",
                    type: "input",
                    size: 50,
                    required: true,
                    showHelp: showHelpMessage,
                    helpText: getText("clientSecret-help")
                }]
        };
    };

    const getEntryConfig = () => {
        return [{
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
                        name: "stb1",
                        type: "button",
                        onClick: (c) => {
                            showSecurityConfig(data.securityType);
                        }
                    },
                    {
                        type: "label",
                        name: "stl1",
                        style: getSecurityConfigLabelStyle(),
                        text: getSecurityConfigLabelText()
                    }]

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
    };

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

    const onDataChange = (e, cfg, dobj) => {
        if (e.target.name === "securityType") {
            dobj.fileBasedSecurity = false;
            return true;
        } else if (e.target.name === "securityServiceClass") {
            cfg[5].disabled = !dobj.securityServiceClass;
            dobj.allowServiceSave = !cfg[5].disabled;

            if (!dobj.allowServiceSave) {
                let el = document.getElementById("init-allowServiceSave");
                if (el) {
                    el.checked = false;
                }
            }

            return true;
        }
    };

    const getConfig = () => {
        return {
            entryConfig: getEntryConfig(),
            dataObject: data,
            idPrefix: "init-",
            gridClass: "entrygrid-200-425",
            lankKey: navigator.language,
            afterChange: onDataChange};
    };


    const saveSetup = async () => {
        let cfg = getConfig();
        if (checkEntryFields(cfg)) {
            let res = await verifyInitialRepositoryFolder(data.repository);
            if (isApiSuccess(res)) {
                let res = await doInitialSetup(data);

                if (isApiError(res)) {
                    showMessage(ERROR, getText(res.message));
                } else {
                    setInitComplete(true);
                }
            } else {
                showMessage(ERROR, getText(res.message));
            }
        } else {
            setErrorMessage(cfg.idPrefix, getText("please complete all required entries"));
        }
    };

    const checkSamlData = () => {
        let retval = false;
        if (data.samlConfiguration) {
            let ok = true;

            let entryConfig = getSamlSecurityConfig().entryConfig;
            for (let i = 0; i < entryConfig.length; ++i) {
                if (entryConfig[i].required && !data.samlConfiguration[entryConfig[i].name]) {
                    ok = false;
                    break;
                }
            }

            retval = ok;
        }

        return retval;
    };

    const checkOidcData = () => {
        let retval = false;

        if (data.oidcConfiguration) {
            let ok = true;

            let entryConfig = getOidcSecurityConfig().entryConfig;
            for (let i = 0; i < entryConfig.length; ++i) {
                if (entryConfig[i].required && !data.oidcConfiguration[entryConfig[i].name]) {
                    ok = false;
                    break;
                }
            }

            retval = ok;
        }

        return retval;
    };

    const checkBasicData = () => {
        let retval = false;

        if (data.basicConfiguration) {
            if (data.basiConfiguration.fileBasedSecurity) {
                retval = data.adminPassword;
            }
        }

        return retval;
    };

    const getSecurityConfigLabelStyle = () => {
        switch (data.securityType) {
            case SECURITY_TYPE_SAML:
                if (checkSamlData()) {
                    return {color: SUCCESS_TEXT_COLOR};
                } else {
                    return {color: ERROR_TEXT_COLOR};
                }
            case SECURITY_TYPE_OIDC:
                if (checkOidcData()) {
                    return {color: SUCCESS_TEXT_COLOR};
                } else {
                    return {color: ERROR_TEXT_COLOR};
                }
            case SECURITY_TYPE_BASIC:
                return "";
        }
    };

    const getSecurityConfigLabelText = () => {
        switch (data.securityType) {
            case SECURITY_TYPE_SAML:
                if (checkSamlData()) {
                    return getText("configuration complete");
                } else {
                    return getText("configuration incomplete");
                }
            case SECURITY_TYPE_OIDC:
                if (checkOidcData()) {
                    return getText("configuration complete");
                } else {
                    return getText("configuration incomplete");
                }
            case SECURITY_TYPE_BASIC:
                return "";
        }
    };

    const canSave = () => {
        let retval = false;
        if (data.repository && data.securityType) {
            switch (data.securityType) {
                case SECURITY_TYPE_SAML:
                    retval = checkSamlData();
                    break;
                case SECURITY_TYPE_OIDC:
                    retval = checkOidcData();
                    break;
                case SECURITY_TYPE_BASIC:
                    retval = checkBasicData();
                    break;
            }
        }

        return retval;
    };

    if (initComplete) {
        return <Splash title={getText("Initialization Complete")} premessage={replaceTokens(getText("repositoryInitializationSucces-msg"), [data.repository, data.securityType])}/>;
    } else {
        return (
                <div className="initial-setup">
                    <EditObjectModal config={editModal}/>
                    <div className="title">{getText("Qvu Initial Setup")}</div>
                    <div><EntryPanel config={getConfig()}/></div>
                    <div id="init-error-msg"></div>
                    <div className="btn-bar bord-t">
                        <Button size="sm"  variant="primary" disabled={!canSave()} onClick={() => saveSetup()}>Save Setup</Button>
                    </div>
                </div>);
        }
};

export default InitialSetup;