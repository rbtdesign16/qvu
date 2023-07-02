import React, { useLocation } from "react-router-dom";
import useLang from "../../context/LangContext";

import PropTypes from "prop-types";

const InitializationComplete = () => {
  const location = useLocation();
    const {getText} = useLang();
  
  return (
    <div style={{padding: "30px"}}>
        <div style={{width: "75%"}}><h2>{getText("Initialization Complete")}</h2></div>
        <pre>{location.state.message}</pre>
    </div>
  );
};

InitializationComplete.propTypes = {
    message: PropTypes.string.isRequired
};


export default InitializationComplete;
