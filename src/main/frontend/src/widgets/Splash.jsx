import React  from "react";
import useLang from "../context/LangContext";
import logo from "../images/logo.png";
import PropTypes from "prop-types";

const Splash = (props) => {
    const {image, imageWidth, title, message, premessage} = props;
    return (
            <div className="splash">
                {title && <h2>{title}</h2>}
                <div><img width={100} src={logo}/>
                {message && <span className="splash-message">{message}</span>}</div>
                {premessage && <pre style={{paddingTop: "20px"}}>{premessage}</pre>}
            </div>
            );
};

Splash.propTypes = {
    message: PropTypes.string,
    premessage: PropTypes.string,
    title: PropTypes.string
};


export default Splash;
