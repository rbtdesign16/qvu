import React from "react";
import PropTypes from "prop-types";
import {isAlphanumeric, isEditKey} from "../utils/helper";

const TextEntry = (props) => {
  const {name, onChange, defaultValue, checkKey} = props;
  
  
  return (
    <span>
      <input type="text" name={name} onKeyPress={e => checkKey(e.key)} size={25} onBlur={e => onChange(e)} defaultValue={defaultValue}/>
    </span>
  );
};

TextEntry.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    checkKey: PropTypes.func.isRequired
};

export default TextEntry;
