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
        getSecurityConfig} from "../utils/apiHelper";

const SystemSetup = (props) => {
    const {authData} = useAuth();
    const {config} = props;
    const [securityConfig, setSecurityConfig] = useState(null);
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const {showHelp} = useHelp();

    const showHelpMessage = (txt) => {
        showHelp(getText(txt));
    };

    const onHide = () => {
        config.hide();
    };

    const getOidcConfig = () => {
        return {
            gridClass: "entrygrid-225-350",
            dataObject: {...securityConfig.oidcConfiguration},
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
            dataObject: {...securityConfig.basicConfiguration},
            afterChange: onBasicChange,
            entryConfig: [
                {
                    label: getText("Custom Security Service"),
                    name: "securityServiceClass",
                    type: "input",
                    size: 50,
                    showHelp: showHelpMessage,
                    helpText: getText("securityServiceClass-help")
                },
                {
                    label: getText("Enabled"),
                    name: "enabled",
                    type: "checkbox"
                }]
        };
    };


    const onBasicChange = (e, entryConfig, dataObject) => {
        let sc = {...securityConfig};
        sc.basicConfiguration = dataObject;
        setSecurityConfig(sc);
    };

    const onOidcChange = (e, entryConfig, dataObject) => {
        let sc = {...securityConfig};
        sc.oidcConfiguration = dataObject;
        setSecurityConfig(sc);
    };
    
    const checkData = () => {
        return checkOidcData();
    };

    const saveSetup = async () => {
        if (checkData()) {
            config.save(securityConfig);
        } else {
            showMessage(ERROR, getText("please complete all required entries"));
        }
    };

    const checkOidcData = () => {
        let retval = true;

        if (securityConfig.oidcConfiguration && securityConfig.oidcConfiguration.enabled) {
            let ok = true;

            let entryConfig = getOidcConfig().entryConfig;
            for (let i = 0; i < entryConfig.length; ++i) {
                if (entryConfig[i].required && !securityConfig.oidcConfiguration[entryConfig[i].name]) {
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
        let retval = SECURITY_TYPE_BASIC;
        switch (securityConfig.securityType) {
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

        let res = await getSecurityConfig();

        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            res.newRecord = false;
            hideMessage();
            setSecurityConfig(res.result);
        }
    };

    const loadSecurityTypes = () => {
        if (securityConfig && securityConfig.securityType) {
            return SECURITY_TYPES.map(t => {
                if (t === securityConfig.securityType) {
                    return <option value={t} selected>{t}</option>;
                } else {
                    return <option value={t}>{t}</option>;
                }
            });
        }
    };
    
    const onSecurityTypeChange = (e) => {
        let sc = {...securityConfig};
        let type = e.target.value;
        
        sc.securityType = type;
        setSecurityConfig(sc);
    };

    const getTabPanel = () => {
        if (securityConfig) {
            return (<Tabs defaultActiveKey={getDefaultActiveTabKey()} id="t1" className="mb-3">
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

    return  (<Modal animation={false} 
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
            <div>   
                <div style={{textAlign: "center"}} className="entrygrid-225-225">
                    <label className="label">{getText("Default Security Type")}</label>
                    <select onChange={e => onSecurityTypeChange(e)}> 
                        {loadSecurityTypes()}
                    </select>   
                </div>
                { getTabPanel() }
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