import React, {useContext, useState} from "react";
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

    const onBasicChange = (e, entryConfig, dataObject) => {
        let ss = {...systemSettings};
        ss.authConfig.basicConfiguration = dataObject;
        ss.authConfig.modified = true;
        setSystemSettings(ss);
    };

    const onSslChange = (e, entryConfig, dataObject) => {
        let ss = {...systemSettings};
        ss.sslConfig = dataObject;
        ss.sslConfig.modified = true;
        setSystemSettings(ss);
    };

    const onMiscChange = (e, entryConfig, dataObject) => {
        let ss = {...systemSettings};
        ss.miscConfig = dataObject;
        ss.miscConfig.modified = true;
        setSystemSettings(ss);
    };

    const onOidcChange = (e, entryConfig, dataObject) => {
        let ss = {...systemSettings};
        ss.authConfig.oidcConfiguration = dataObject;
        ss.authConfig.modified = true;
        setSystemSettings(ss);
    };

    const onSchedulerChange = (e, entryConfig, dataObject) => {
        let ss = {...systemSettings};
        ss.schedulerConfig = dataObject;
        ss.schedulerConfig.modified = true;
        setSystemSettings(ss);
    };

    const getMiscConfig = () => {
        return {
            gridClass: "entrygrid-225-350",
            dataObject: {...systemSettings.miscConfig},
            idPrefix: "misc-",
            afterChange: onMiscChange,
            entryConfig: [
                {
                    label: getText("Server Port"),
                    name: "serverPort",
                    type: "number",
                    required: true,
                    restartRequired: true,
                    showHelp: showHelpMessage,
                    helpText: getText("serverPort-help")
                },
                {
                    label: getText("Backup Folder"),
                    name: "backupFolder",
                    type: "input",
                    size: 60,
                    required: true,
                    showHelp: showHelpMessage,
                    helpText: getText("backupFolder-help")
                },
                {
                    label: getText("CORS Allowed Origins"),
                    name: "corsAllowedOrigins",
                    type: "input",
                    size: 60,
                    required: true,
                    showHelp: showHelpMessage,
                    helpText: getText("corsAllowedOrigins-help")
                },
                {
                    label: getText("Default Report Units"),
                    name: "defaultPageUnits",
                    type: "select",
                    options: systemSettings.miscConfig.pageUnits
                },
                {
                    label: getText("Default Report Orientation"),
                    name: "defaultPageOrientation",
                    type: "select",
                    options: systemSettings.miscConfig.pageOrientations
                },
                {
                    label: getText("Default Report Size"),
                    name: "defaultPageSize",
                    type: "select",
                    options: systemSettings.miscConfig.pageSizes
                }
            ]
        };
    };

    const getSchedulerConfig = () => {
        return {
            gridClass: "entrygrid-225-350",
            dataObject: {...systemSettings.schedulerConfig},
            idPrefix: "sched-",
            afterChange: onSchedulerChange,
            entryConfig: [
                {
                    label: getText("SMTP Host"),
                    name: "smtpHost",
                    type: "input",
                    size: 60,
                    restartRequired: true,
                    required: true
                },
                {
                    label: getText("SMTP Port"),
                    name: "smtpPort",
                    type: "number",
                    size: 40,
                    required: true
                },
                {
                    label: getText("SMTP Auth"),
                    name: "smtpAuth",
                    type: "checkbox",
                    showHelp: showHelpMessage,
                    helpText: getText("smtpAuth-help")
                },
                {
                    label: getText("Start TTLS Enable"),
                    name: "smtpStartTlsEnable",
                    type: "checkbox",
                    showHelp: showHelpMessage,
                    helpText: getText("smtpStartTlsEnable-help")
                },
                {
                    label: getText("SSL Trust"),
                    name: "smtpSslTrust",
                    type: "input",
                    size: 60,
                    showHelp: showHelpMessage,
                    helpText: getText("smtpSslTrust-help")
                },
                {
                    label: getText("Mail User"),
                    name: "mailUser",
                    type: "input",
                    size: 40
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
                    required: true,
                    size: 40
                },
                {
                    label: getText("Mail Subject"),
                    name: "mailSubject",
                    type: "input",
                    required: true,
                    size: 40,
                    showHelp: showHelpMessage,
                    helpText: getText("mailSubject-help")
                },
                {
                    label: getText("Enable Scheduler"),
                    name: "enabled",
                    type: "checkbox",
                    size: 40
                }
            ]
        };
    };

    const getSslConfig = () => {
        return {
            gridClass: "entrygrid-225-350",
            dataObject: {...systemSettings.sslConfig},
            idPrefix: "ssl-",
            afterChange: onSslChange,
            entryConfig: [
                {
                    label: getText("SSL Key Store"),
                    name: "sslKeyStore",
                    type: "input",
                    size: 60,
                    required: true,
                    restartRequired: true,
                    showHelp: showHelpMessage,
                    helpText: getText("sslKeyStore-help")
                },
                {
                    label: getText("Keystore Type"),
                    name: "sslKeyStoreType",
                    type: "input",
                    size: 40,
                    required: true,
                    showHelp: showHelpMessage,
                    helpText: getText("sslKeyStoreType-help")
                },
                {
                    label: getText("Key Alias"),
                    name: "sslKeyAlias",
                    type: "input",
                    size: 40,
                    showHelp: showHelpMessage,
                    helpText: getText("sslKeyAlias-help")
                },
                {
                    label: getText("Keystore Password"),
                    name: "sslKeyStorePassword",
                    type: "password",
                    size: 40,
                    showHelp: showHelpMessage,
                    helpText: getText("sslKeyStorePassword-help")
                },
                {
                    label: getText("Key Password"),
                    name: "sslKeyPassword",
                    type: "password",
                    size: 40,
                    showHelp: showHelpMessage,
                    helpText: getText("sslKeyPassword-help")
                },
                {
                    label: getText("Enable SSL"),
                    name: "enabled",
                    type: "checkbox",
                    size: 40
                }
            ]
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
                    label: getText("Role Claim Property Name"),
                    name: "roleClaimPropertyName",
                    type: "input",
                    size: 50,
                    showHelp: showHelpMessage,
                    helpText: getText("roleClaimPropertyName-help")
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


    const checkData = () => {
        let retval = "";
        if (systemSettings.authConfig.securityType === SECURITY_TYPE_OIDC) {
            if (!checkOidcData()) {
                retval = replaceTokens(getText("complete-required-entries"), ["OIDC"]);
            }
        }

        if (systemSettings.schedulerConfig.enabled) {
            if (!checkSchedulerData()) {
                retval = replaceTokens(getText("complete-required-entries"), ["scheduler"]);
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

    const checkSchedulerData = () => {
        let retval = true;

        let entryConfig = getSchedulerConfig().entryConfig;
        for (let i = 0; i < entryConfig.length; ++i) {
            if (entryConfig[i].required && !systemSettings.schedulerConfig[entryConfig[i].name]) {
                retval = false;
                break;
            }
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
            <div style={{height: "375px"}}>   
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
                    <Tab eventKey="sched"  title={getText("Scheduler")}>
                        { systemSettings && <EntryPanel config={getSchedulerConfig()}/> }
                    </Tab>
                    <Tab eventKey="ssl"  title={getText("SSL")}>
                        { systemSettings && <EntryPanel config={getSslConfig()}/> }
                    </Tab>
                    <Tab eventKey="misc"  title={getText("Misc")}>
                        { systemSettings && <EntryPanel config={getMiscConfig()}/> }
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