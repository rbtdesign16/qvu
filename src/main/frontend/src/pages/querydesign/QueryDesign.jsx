/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, {useEffect} from "react";
import { Tabs, Tab }from "react-bootstrap";
import useMessage from "../../context/MessageContext";
import {INFO, WARN, ERROR} from "../../utils/helper";

const QueryDesign = (props) => {
    const {messageInfo, showMessage, hideMessage} = useMessage();
    
    return (
            <div>
   <button onClick={(e) => showMessage(WARN, "this is a test", "Warning")}>show</button>
           
           <button onClick={(e) => alert("xxx")}>test</button>
   
            </div>
            );
}

export default QueryDesign;
