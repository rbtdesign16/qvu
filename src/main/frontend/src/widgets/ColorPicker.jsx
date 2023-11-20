import React, { useState } from "react";
import ColorSelectModal from "./ColorSelectModal";
import PropTypes from "prop-types";

const ColorPicker = (props) => {
    const {color, setColor} = props;
    const [showColorSelect, setShowColorSelect] = useState({show: false, color: color});
    
    const saveColor = (color) => {
        setColor(color);
        hideColorSelect();
    };
    
    const hideColorSelect = () => {
        setShowColorSelect({show: false});
    };
    
    const onColorSelect = () => {
        setShowColorSelect({show: true, saveColor: saveColor, hide: hideColorSelect});
    };
    
    return <div>
            <ColorSelectModal config={showColorSelect}/>
        <div className="color-picker" 
            onClick={e => onColorSelect(e)} 
            style={{background: color}}>
            </div>
       </div>;
    
};
    
ColorPicker.propTypes = {
    color: PropTypes.string.isRequired,
    setColor: PropTypes.function.isRequired
};

export default ColorPicker;
