import React, { useState } from "react";
import PropTypes from "prop-types";
import useAuth from "../context/AuthContext";
import { MdHelpOutline } from 'react-icons/md';
import useLang from "../context/LangContext";
import {SMALL_ICON_SIZE, showDocumentFromBlob} from "../utils/helper"
import {loadHelpDocument, loadGettingStartedDocument} from "../utils/apiHelper";
import logo from "../images/logo.png";

const Header = (props) => {
    const {getText} = useLang();
    const {version} = props;
    const [showMenu, setShowMenu] = useState(false);
    const {authData} = useAuth();

    const onMenuItem = (key, data) => {
        switch(key) {
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
        </div>
    };

    const isHelpVisible = () => {
        return authData && !authData.initializingApplication;
    };
    
    return (
            <div className="header">
                <div className="logo">
                    <img height="28" src={logo} />
                    <span>{"Qvu " + version}</span>
                    {isHelpVisible() && 
                    <span className="help-control" onClick={(e) => setShowMenu(!showMenu)}>
                        <MdHelpOutline className="icon yellow-f" size={SMALL_ICON_SIZE}/>
                        <span>{getText("Help")}</span>
                        {showMenu && popupMenu()}
                    </span>}
                </div>
            </div>
            );
};

Header.propTypes = {
    version: PropTypes.string.isRequired
};

export default Header;
