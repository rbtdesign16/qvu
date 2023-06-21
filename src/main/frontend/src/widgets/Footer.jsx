import React from "react";
import PropTypes from "prop-types";

const Footer = (props) => {
  const {copyright} = props;
  
  return (
    <div className="footer">
      <span className="footer-copyright">{copyright}</span>
    </div>
  );
};

Footer.propTypes = {
    copyright: PropTypes.string.isRequired
};

export default Footer;
