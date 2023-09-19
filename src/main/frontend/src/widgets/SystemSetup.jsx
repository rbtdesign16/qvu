import React, {useContext, useState, useEffect} from "react";
import { Tabs, Tab } from "react-bootstrap";
import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import EntryPanel from "./EntryPanel";
import useAuth from "../context/AuthContext";
import useLang from "../context/LangContext";
import useMessage from "../context/MessageContext";
import useHelp from "../context/HelpContext";
import {
INFO,
        SUCCESS,
        ERROR,
        replaceTokens,
        MODAL_TITLE_SIZE
} from "../utils/helper";

import {
SECURITY_TYPE_BASIC,
        SECURITY_TYPE_OIDC,
        SECURITY_TYPES
} from "../utils/authHelper";

import {
isApiError,
        isApiSuccess,
        getSystemSettings} from "../utils/apiHelper";

const SystemSetup = (props) => {
    const {authData} = useAuth();
    const {config} = props;
    const [systemSettings, setSystemSettings] = useState(null);
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const {showHelp} = useHelp();

    const showHelpMessage = (txt) => {
        showHelp(getText(txt));
    };

    const onHide = () => {
        config.hide();
    };

    const getEmailConfig = () => {
        return {
            gridClass: "entrygrid-225-350",
            dataObject: {...systemSettings.emailConfig},
            idPrefix: "email-",
            afterChange: onEmailChange,
            entryConfig: [
                {
                    label: getText("SMTP Host"),
                    name: "smtpHost",
                    type: "input",
                    size: 60,
                    required: true
                },
                {
                    label: getText("SMTP Port"),
                    name: "smtpPort",
                    type: "number",
                    size: 40,
                    required: true,
                },
                {
                    label: getText("SMTP Auth"),
                    name: "smtpAuth",
                    type: "checkbox",
                },
                {
                    label: getText("Start TTLS Enable"),
                    name: "smtpStartTtlsEnable ",
                    type: "checkbox",
                    showHelp: showHelpMessage,
                    helpText: getText("mtpStartTtlsEnable-help")
                },
                {
                    label: getText("Use Email for User Id"),
                    name: "useEmailForUserId",
                    type: "checkbox"
                },
                {
                    label: getText("Mail User"),
                    name: "mailUser",
                    type: "input",
                    size: 40,
                },
                {
                    label: getText("Mail Password"),
                    name: "mailPassword",
                    type: "password",
                    size: 40
                },
                {
                    label: getText("Mail From"),
                    name: "mailFrom",
                    type: "input",
                    size: 40
                },
                {
                    label: getText("Mail Subject"),
                    name: "mailSubject",
                    type: "input",
                    size: 40
                }]
        };
    };

    const getOidcConfig = () => {
        return {
            gridClass: "entrygrid-225-350",
            dataObject: {...systemSettings.authConfig.oidcConfiguration},
            idPrefix: "oidc-",
            afterChange: onOidcChange,
            entryConfig: [
                {
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
                },
                {
                    label: getText("Admin Role Mapping"),
                    name: "incomingAdminRoles",
                    type: "input",
                    size: 50,
                    showHelp: showHelpMessage,
                    helpText: getText("adminRoleMapping-help")
                },
                {
                    label: getText("Use Email for User Id"),
                    name: "useEmailForUserId",
                    type: "checkbox"
                }]
        };
    };

    const getBasicConfig = () => {
        return {
            gridClass: "entrygrid-225-350",
            idPrefix: "bas-",
            dataObject: {...systemSettings.authConfig.basicConfiguration},
            afterChange: onBasicChange,
            entryConfig: [
                {
                    label: getText("Custom Security Service"),
                    name: "securityServiceClass",
                    type: "input",
                    size: 50,
                    showHelp: showHelpMessage,
                    helpText: getText("securityServiceClass-help")
                }]
        };
    };


    const onBasicChange = (e, entryConfig, dataObject) => {
        let ss = {...systemSettings};
        ss.authConfig.basicConfiguration = dataObject;
        setSystemSettings(ss);
    };

    const onOidcChange = (e, entryConfig, dataObject) => {
        let ss = {...systemSettings};
        ss.authConfig.oidcConfiguration = dataObject;
        setSystemSettings(ss);
    };

    const onEmailChange = (e, entryConfig, dataObject) => {
        let ss = {...systemSettings};
        ss.emailConfig = dataObject;
        setSystemSettings(ss);
    };

    const checkData = () => {
        let retval = "";
        if (systemSettings.authConfig.securityType === SECURITY_TYPE_OIDC) {
            if (!checkOidcData()) {
                retval = replaceTokens(getText("complete-required-entries"), ["OIDC"]);
            }
        }

        return retval;
    };

    const saveSetup = async () => {
        let err = checkData();
        if (!err) {
            config.save(systemSettings);
        } else {
            showMessage(ERROR, err);
        }
    };

    const checkOidcData = () => {
        let retval = true;

        if (systemSettings.authConfig.oidcConfiguration) {
            let ok = true;

            let entryConfig = getOidcConfig().entryConfig;
            for (let i = 0; i < entryConfig.length; ++i) {
                if (entryConfig[i].required && !systemSettings.authConfig.oidcConfiguration[entryConfig[i].name]) {
                    ok = false;
                    break;
                }
            }

            retval = ok;
        }

        return retval;
    };

    const getDefaultActiveTabKey = () => {
        let retval = SECURITY_TYPE_BASIC;
        switch (systemSettings.authConfig.securityType) {
            case  SECURITY_TYPE_BASIC:
                retval = "key-" + SECURITY_TYPE_BASIC;
                break;
            case SECURITY_TYPE_OIDC:
                retval = "key-" + SECURITY_TYPE_OIDC;
                break;
        }

        return retval;
    };


    const onShow = async () => {
        showMessage(INFO, getText("Loading system settings", "..."), null, true);

        let res = await getSystemSettings();

        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            res.newRecord = false;
            hideMessage();
            setSystemSettings(res.result);
        }
    };

    const loadSecurityTypes = () => {
        if (systemSettings && systemSettings.authConfig && systemSettings.authConfig.securityType) {
            return SECURITY_TYPES.map(t => {
                if (t === systemSettings.authConfig.securityType) {
                    return <option value={t} selected>{t}</option>;
                } else {
                    return <option value={t}>{t}</option>;
                }
            });
        }
    };

    const onSecurityTypeChange = (e) => {
        let ss = {...systemSettings};
        let type = e.target.value;

        ss.authConfig.securityType = type;
        setSystemSettings(ss);
    };

    const getTabPanel = () => {
        if (systemSettings) {
            return (<Tabs defaultActiveKey={getDefaultActiveTabKey()} id="t2" className="mb-3">
                <Tab eventKey={"key-" + SECURITY_TYPE_BASIC} title="Basic">
                    <EntryPanel config={getBasicConfig()}/>
                </Tab>
                <Tab eventKey={"key-" + SECURITY_TYPE_OIDC} title="Oidc">
                    <EntryPanel config={getOidcConfig()}/>
                </Tab>
            </Tabs>);
        } else {
            return "";
        }
    };

    const getTitle = () => {
        return getText("System Settings");
    };


    return  (<Modal animation={false} 
           size={config.dlgsize ? config.dlgsize : ""}
           show={config.show} 
           onShow={onShow}
           onHide={onHide}
           backdrop={true} 
           keyboard={true}>
        <Modal.Header closeButton>
            <Modal.Title as={MODAL_TITLE_SIZE}>{getTitle()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div style={{height: "400px"}}>   
                <Tabs id="t1" className="mb-3">
                    <Tab eventKey="auth" title={getText("Authentication")}>
                        <div style={{textAlign: "center"}} className="entrygrid-225-225">
                            <label className="label">{getText("Default Security Type")}</label>
                            <select onChange={e => onSecurityTypeChange(e)}> 
                                {loadSecurityTypes()}
                            </select>   
                        </div>
                        { getTabPanel() }
                    </Tab>
                    <Tab eventKey="mail"  title={getText("Email")}>
                    {systemSettings &&
                        <EntryPanel config={getEmailConfig()}/>
                        }
                    </Tab>
                    <Tab eventKey="misc"  title={getText("Misc")}>
                        <div>Misc</div>
                    </Tab>
                </Tabs>
            </div>
        </Modal.Body>
        <Modal.Footer>
            <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
            <Button size="sm" variant="primary" type="submit" onClick={() => saveSetup()}>{getText("Save")}</Button>
        </Modal.Footer>
    </Modal>
            );
};

SystemSetup.propTypes = {
    config: PropTypes.object.isRequired
};


export default SystemSetup;