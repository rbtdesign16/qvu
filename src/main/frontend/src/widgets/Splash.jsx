import React from "react";
import PropTypes from "prop-types";

const Splash = (props) => {
  const {image, imageWidth, message} = props;
  
  return (
    <div className="splash">
      <img width={imageWidth} src={image}/>
        <span className="splash-message">{message}</span>
    </div>
  );
};

Splash.propTypes = {
    image: PropTypes.string.isRequired,
    imageWidth: PropTypes.string,
    message: PropTypes.string.isRequired
};

Splash.defaultProp = {
    imageWidth: "100"
}

export default Splash;
