import React from "react";
const Footer = (props) => {
  return (
    <div className="footer">
      <span className="footer-text">{props.text}</span>
    </div>
  );
};

export default Footer;
