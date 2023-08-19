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
    SMALL_ICON_SIZE
} from "../utils/helper";


import {
    verifyInitialRepositoryFolder,
    initializeRepository,
    isApiError,
    isApiSuccess} from "../utils/apiHelper";

const RepositorySetup = () => {
    const {authData} = useAuth();
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const {showHelp} = useHelp();
    const [initComplete, setInitComplete] = useState(false);
    const [repositoryFolder, setRepositoryFolder] = useState(null);

    const saveSetup = async () => {
        if (repositoryFolder) {
            let res = await verifyInitialRepositoryFolder(repositoryFolder);
            if (isApiSuccess(res)) {
                let res = await initializeRepository(repositoryFolder);

                if (isApiError(res)) {
                    showMessage(ERROR, getText(res.message));
                } else {
                    setInitComplete(true);
                }
            } else {
                showMessage(ERROR, getText(res.message));
            }
        } 
    };


    if (initComplete) {
        return <Splash title={getText("Initialization Complete")} premessage={replaceTokens(getText("repositoryInitializationSucces-msg"), [repositoryFolder])}/>;
    } else {
        return (
                <div className="repository-setup">
                    <div className="title">{getText("Initialize Qvu Repository")}</div>
                    <div>
                        <MdHelpOutline className="icon" size={SMALL_ICON_SIZE} onClick={(e) => showHelp(getText("repositorySetup-help"))}/>
                        <label className="ck-label">{getText("Repository Folder")}</label>
                        <input type="text" size={50} onChange={e => setRepositoryFolder(e.target.value)} />
                    </div>
                    <div className="btn-bar bord-t">
                        <Button size="sm"  variant="primary" disabled={!repositoryFolder} onClick={() => saveSetup()}>{getText("Save Setup")}</Button>
                    </div>
                </div>);
        }
};

export default RepositorySetup;