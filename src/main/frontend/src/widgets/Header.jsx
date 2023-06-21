import React from "react";
import PropTypes from "prop-types";

const Header = (props) => {
    const {version} = props;
    return (
            <div className="header">
                <div className="logo">
                    <img height="24" src="logo.png" />
                    <span>{"Qvu " + version}</span>
                </div>
            </div>
            );
};

Header.propTypes = {
    version: PropTypes.string.isRequired
};

export default Header;
