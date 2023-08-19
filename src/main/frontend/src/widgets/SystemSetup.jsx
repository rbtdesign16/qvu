import React, {useContext, useState} from "react";
import { Tabs, Tab } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import EntryPanel from "../../widgets/EntryPanel";
import useAuth from "../../context/AuthContext";
import useLang from "../../context/LangContext";
import EditObjectModal from "../../widgets/EditObjectModal";
import useMessage from "../../context/MessageContext";
import useHelp from "../../context/HelpContext";
import {
INFO,
        SUCCESS,
        ERROR,
        replaceTokens
} from "../../utils/helper";

import {
    SECURITY_TYPE_BASIC,
    SECURITY_TYPE_SAML,
    SECURITY_TYPE_OIDC,
} from "../../utils/authHelper";

import {
    isApiError,
    isApiSuccess,
    getSecurityConfig} from "../../utils/apiHelper";

const AuthenticationSetup = (props) => {
    const {authData} = useAuth();
    const {config} = props;
    const {samlConfiguration, basicConfiguration, oauthConfiguration, useOauth, useSaml, useBasic} = config;
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const {showHelp} = useHelp();
    const [editModal, setEditModal] = useState({show: false});
    const [initComplete, setInitComplete] = useState(false);
    const [toggle, setToggle] = useState(false);
    const [data, setData] = useState({
        repository: "",
        securityType: SECURITY_TYPE_BASIC
    });

    const showHelpMessage = (txt) => {
        showHelp(getText(txt));
    };

    const onHide = () => {
        config.hide();
    };


    const getSamlConfig = () => {
        return {
            dataObject: samlConfiguration,
            gridClass: "entrygrid-200-425",
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

    const getOauthConfig = () => {
        return {
            gridClass: "entrygrid-200-425",
            dataObject: oauthConfiguration,
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

    const getBasicConfig = () => {
        return {
            gridClass: "entrygrid-200-425",
            dataObject: basicConfiguration,
            entryConfig: [{
                    label: getText("Custom Security Service"),
                    name: "securityServiceClass",
                    type: "input",
                    size: 60,
                    required: true,
                    showHelp: showHelpMessage,
                    helpText: getText("securityServiceClass-help")
                }]
        };
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
        if (useSaml) {
            let ok = true;

            let entryConfig = getSamlConfig().entryConfig;
            for (let i = 0; i < entryConfig.length; ++i) {
                if (entryConfig[i].required && !samlConfiguration[entryConfig[i].name]) {
                    ok = false;
                    break;
                }
            }

            retval = ok;
        }

        return retval;
    };

    const checkOAuthData = () => {
        let retval = false;

        if (useOauth) {
            let ok = true;

            let entryConfig = getOauthConfig().entryConfig;
            for (let i = 0; i < entryConfig.length; ++i) {
                if (entryConfig[i].required && !oauthConfiguration[entryConfig[i].name]) {
                    ok = false;
                    break;
                }
            }

            retval = ok;
        }

        return retval;
    };

    const canSave = () => {
        let retval = false;

        return retval;
    };

    const getDefaultActiveTabKey = () => {
        switch (config.defaultSecurityType) {
            case  SECURITY_TYPE_BASIC:
                return "key" + SECURITY_TYPE_BASIC;
            case SECURITY_TYPE_SAML:
                return  "key" + SECURITY_TYPE_BASIC;
            case SECURITY_TYPE_OIDC:
                return "key" + SECURITY_TYPE_BASIC;
        }
    }
    
    
    const onShow = () => {
        config.hideMessage();
    }
    
    return (
            <div>
                <Modal animation={false} 
                       size={config.dlgsize ? config.dlgsize : ""}
                       show={config.show} 
                       onShow={onShow}
                       onHide={onHide}
                       backdrop={true} 
                       keyboard={true}>
                    <Modal.Header closeButton>
                        <Modal.Title as={MODAL_TITLE_SIZE}>{config.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Tabs defaultActiveKey={getDefaultActiveTabKey()} id="t1" className="mb-3">
                            <Tab bsPrefix="ssbasic" eventKey={"key-" + SECURITY_TYPE_BASIC} title="Basic">
                                <div><EntryPanel config={getBasicConfig()}/></div>
                            </Tab>
                            <Tab eventKey={"key-" + SECURITY_TYPE_SAML} title="SAML">
                                <div><EntryPanel config={getSamlConfig()}/></div>
                            </Tab>
                            <Tab eventKey={"key-" + SECURITY_TYPE_OIDC} title="OAuth">
                                <div><EntryPanel config={getOauthConfig()}/></div>
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                        <Button size="sm" variant="primary" type="submit" onClick={() => config.save(config)}>{getText("Save")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            );

};

export default AuthenticationSetup;