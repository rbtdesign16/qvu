import React, { useState } from "react";
import PropTypes from "prop-types";
import useAuth from "../context/AuthContext";
import { MdHelpOutline } from "react-icons/md";
import { AiOutlineLogout } from "react-icons/ai";
import {GiCarKey} from "react-icons/gi";
import useLang from "../context/LangContext";
import useMessage from "../context/MessageContext";
import {
    SUCCESS,
    ERROR,
    SMALL_ICON_SIZE, 
    showDocumentFromBlob, 
    BASIC_SECURITY_TYPE} from "../utils/helper"
import {loadHelpDocument, 
    loadGettingStartedDocument, 
    updateUserPassword,
    isApiError, 
    logout} from "../utils/apiHelper";
import logo from "../images/logo.png";
import UpdatePasswordModal from "./UpdatePasswordModal";

const Header = (props) => {
    const {getText} = useLang();
    const {version} = props;
    const {showMessage} = useMessage();
    const [showMenu, setShowMenu] = useState(false);
    const [showUpdatePassword, setShowUpdatePassword] = useState({show: false});
    const {authData, setAuthData} = useAuth();

    const onMenuItem = (key, data) => {
        switch (key) {
            case "doch":
                showHelp();
                break;
            case "docgs":
                showGettingStarted();
                break;
        }
    };

    const showGettingStarted = async () => {
        setShowMenu(false);
        let res = await loadGettingStartedDocument();

        let blob = new Blob([res], {
            type: "application/pdf"
        });

        showDocumentFromBlob(blob);
    };

    const showHelp = async () => {
        setShowMenu(false);
        let res = await loadHelpDocument();

        let blob = new Blob([res], {
            type: "application/pdf"
        });

        showDocumentFromBlob(blob);
    };

    const popupMenu = () => {
        return <div className="popup-menu" >
            <div  onClick={e => onMenuItem("docgs")} >{getText("Getting started")}</div>
            <div  onClick={e => onMenuItem("doch")} style={{borderBottom: "solid 1px darkslategray"}}>{getText("Help documentation")}</div>
            <a target="_blank" href="mailto:qvu@rbtdesign.org?subject=Qvu%20issue">{getText("Report an Issue")}</a>
        </div>;
    };

    const isBasicAuth = () => {
        return (authData && !authData.initializingApplication && (authData.securityType === BASIC_SECURITY_TYPE));
    };

    const isHelpVisible = () => {
        return authData && !authData.initializingApplication;
    };

    const hideUpdatePassword = () => {
        setShowUpdatePassword({show: false});
    };
    
    const onLogout = async () => {
        logout(authData.securityType === BASIC_SECURITY_TYPE);
        setAuthData(null);
    };
    
    const updatePassword = async (newPassword) => {
        let res = await updateUserPassword(newPassword);
        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            hideUpdatePassword();
            showMessage(SUCCESS, getText("password-update-msg"));
        }
    };
    
    const onUpdatePassword = () => {
        setShowUpdatePassword({show: true, hide: hideUpdatePassword, updatePassword: updatePassword});
    };

    return (
            <div className="header">
                <UpdatePasswordModal config={showUpdatePassword}/>
                <div className="logo">
                    <img height="28" src={logo} />
                    <span>{"Qvu " + version}</span>
                    <span className="header-menu">
                        {isHelpVisible() &&
                            <span onClick={(e) => setShowMenu(!showMenu)}>
                                <MdHelpOutline className="icon yellow-f" size={SMALL_ICON_SIZE}/>
                                <span>{getText("Help")}</span>
                                {showMenu && popupMenu()}
                            </span>}
                        {isBasicAuth() &&
                            <span onClick={(e) => onUpdatePassword()}>
                                <GiCarKey className="icon yellow-f" size={SMALL_ICON_SIZE}/>
                                <span>{getText("Update Password")}</span>
                            </span>}
                            
                            <span onClick={(e) => onLogout()}>
                                <AiOutlineLogout className="icon yellow-f" size={SMALL_ICON_SIZE}/>
                                <span>{getText("Logout")}</span>
                            </span>
                    </span>
                </div>
            </div>
            );
};

Header.propTypes = {
    version: PropTypes.string.isRequired
};

export default Header;
