import React from "react";
import PropTypes from "prop-types";

const Footer = (props) => {
  const {copyright, authData} = props;
  
  const getUserId = () => {
      let retval = "";
      if (authData && authData.currentUser) {
          retval = authData.currentUser.userId;
      }
      return retval;
  }
  
  return (
    <div className="footer">
      <span className="footer-copyright">{copyright}</span>
      <span className="footer-user">user: {getUserId()}</span>
    </div>
  );
};

Footer.propTypes = {
    copyright: PropTypes.string.isRequired,
    authData: PropTypes.object.isRequired
};

export default Footer;
