import React, {useEffect}from "react";
import useMenu from "../context/MenuContext";

const ContextMenu = (props) => {
    const {menuConfig} = useMenu();
    const getMenuItems = () => {
        if (menuConfig.menuItems) {
            return menuConfig.menuItems.map(m => {
                if (m.group) {
                    return <div style={{textDecoration: "underline"}}>
                        {m.group}
                    </div>;
                } else if (m.separator) {
                    return <hr className="h-separator" />;
                } else {
                    let myStyle = {};
                    if (m.style) {
                        myStyle = m.style;
                    }
                        
                    return <div style={myStyle} 
                        className="context-menu-element" 
                        onClick={() => menuConfig.handleContextMenu(m.action, menuConfig.id, menuConfig.section)}>
                                {m.text}
                        </div>;
                }
            });
        } else {
            return "";
        }
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