import React from "react";
import PropTypes from "prop-types";
const TextEntry = (props) => {
  const {id, name, onChange, defaultValue, checkKey} = props;
  
  return (
    <span>
      <input 
        id={id} 
        type="text" 
        name={name} 
        onKeyPress={e => checkKey(e)} 
        size={25} 
        onBlur={e => onChange(e)} 
        defaultValue={defaultValue}/>
    </span>
  );
};

TextEntry.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    checkKey: PropTypes.func.isRequired
};

export default TextEntry;
