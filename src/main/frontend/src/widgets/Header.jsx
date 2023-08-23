import React from "react";
import PropTypes from "prop-types";
import { MdHelpOutline } from 'react-icons/md';
import useLang from "../context/LangContext";
import {SMALL_ICON_SIZE, loadDocumentFromBlob} from "../utils/helper"
import {loadHelpDocument} from "../utils/apiHelper";

const Header = (props) => {
    const {getText} = useLang();
    const {version} = props;

    const showHelpDocument = async () => {
        let res = await loadHelpDocument();
        
        console.log("------->" + JSON.stringify(res));
        let blob = new Blob([res], {
            type: "application/pdf"
        });

        loadDocumentFromBlob("qvu-help.pdf", blob);
   };

    return (
            <div className="header">
                <div className="logo">
                    <img height="24" src="logo.png" />
                    <span>{"Qvu " + version}</span>
                    <span className="help-control" onClick={(e) => showHelpDocument()}>
                        <MdHelpOutline className="icon yellow-f" size={SMALL_ICON_SIZE}/>
                        <span style={{color: "white"}} >{getText("Help")}</span>
                    </span>
                </div>
            </div>
            );
};

Header.propTypes = {
    version: PropTypes.string.isRequired
};

export default Header;
