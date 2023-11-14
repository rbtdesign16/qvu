import React, {useState} from "react";

//define a functional component for the right-click context menu 
const ContextMenu = (props) => {
    //state variables
    const {config} = props;

    const getMenuItems = () => {
        return config.menuItems.map(m => {
            return <div className="context-menu-element" onClick={() => config.handleContextMenu(m.action, config.id)}>
                {m.text}
            </div>;
        });
    };

    if (config.show) {
        return <div style={{top: config.y, left: config.x}} 
            className="context-menu">
            {getMenuItems()}
        </div>;
    } else {
        return "";
    }
};

export default ContextMenu;