import React, {useContext, useState} from "react";
import Button from "react-bootstrap/Button";
import useAuth from "../context/AuthContext";
import useLang from "../context/LangContext";
import { MdHelpOutline } from 'react-icons/md';
import Splash from "./Splash";
import useMessage from "../context/MessageContext";
import useHelp from "../context/HelpContext";
import {
INFO,
        ERROR,
        ERROR_TEXT_COLOR,
        SUCCESS_TEXT_COLOR,
        DEFAULT_ERROR_TITLE,
        replaceTokens,
        SMALL_ICON_SIZE,
        isValidPassword
        } from "../utils/helper";
import {
verifyInitialRepositoryFolder,
        initializeRepository,
        isApiError,
        isApiSuccess} from "../utils/apiHelper";
import appinfo from "../appinfo.json";

const RepositorySetup = () => {
    const {authData} = useAuth();
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const {showHelp} = useHelp();
    const [initComplete, setInitComplete] = useState(false);
    const [repositoryFolder, setRepositoryFolder] = useState(null);
    const [adminPassword, setAdminPassword] = useState({password: "", repeatPassword: ""});

    const saveSetup = async () => {
        if (repositoryFolder) {
            if (adminPassword.password !== adminPassword.repeatPassword) {
                showMessage(ERROR, getText("Passwords do not match"));
            } else if (!isValidPassword(adminPassword.password)) {
                showMessage(ERROR, getText("Invalid password"));
            } else {
                let res = await verifyInitialRepositoryFolder(repositoryFolder);
                if (isApiSuccess(res)) {
                    let res = await initializeRepository(repositoryFolder, adminPassword.password);

                    if (isApiError(res)) {
                        showMessage(ERROR, getText(res.message));
                    } else {
                        setInitComplete(true);
                    }
                } else {
                    showMessage(ERROR, getText(res.message));
                }
            }
        }
    };

    const onPassword = (e) => {
        let p = {...adminPassword};

        p[e.target.name] = e.target.value;

        setAdminPassword(p);
    }

    if (initComplete) {
        return <Splash title={getText("Initialization Complete")} premessage={replaceTokens(getText("repositoryInitializationSuccess-msg"), [repositoryFolder, appinfo.version])}/>;
    } else {
        return (
                <div className="repository-setup">
                    <div className="title">{getText("Initialize Qvu Repository")}</div>
                    <div>
                        <div className="ck-label">{getText("New Admin Password")}</div>
                        <input name="password" type="password" size={20} onChange={e => onPassword(e)} />
                        <div style={{marginTop: "3px"}} className="ck-label">{getText("Repeat Password")}</div>
                        <input name="repeatPassword" type="password" size={20} onChange={e => onPassword(e)} />
                        
                        <div className="small-msg">{getText("password-validation-msg")}</div>
                        <div style={{marginTop: "3px"}}>
                            <MdHelpOutline className="icon" size={SMALL_ICON_SIZE} onClick={(e) => showHelp(getText("repositorySetup-help"))}/>
                            <label className="ck-label">{getText("Repository Folder")}</label>
                        </div>
                        <input type="text" size={50} onChange={e => setRepositoryFolder(e.target.value)} />
                    </div>
                    <div className="btn-bar bord-t">
                        <Button size="sm"  variant="primary" disabled={!repositoryFolder || !adminPassword.password || !adminPassword.repeatPassword} onClick={() => saveSetup()}>{getText("Save Setup")}</Button>
                    </div>
                </div>);
    }
};

export default RepositorySetup;