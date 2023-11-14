import React, {useEffect}from "react";
import useMenu from "../context/MenuContext";

const ContextMenu = (props) => {
    const {menuConfig} = useMenu();
    const getMenuItems = () => {
        return menuConfig.menuItems.map(m => {
            return <div className="context-menu-element" onClick={() => menuConfig.handleContextMenu(m.action, menuConfig.id)}>
                {m.text}
            </div>;
        });
    };
    
    if (menuConfig.show) {
        return <div style={{top: menuConfig.y, left: menuConfig.x}} 
             className="context-menu">
            {getMenuItems()}
        </div>;
    } else {
        return "";
    }
};

export default ContextMenu;