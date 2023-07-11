/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from 'react';
import useMessage from "../../context/MessageContext";
import useLang from "../../context/LangContext";
import {
    INFO, 
    WARN, 
    ERROR, 
    DEFAULT_ERROR_TITLE} from "../../utils/helper";
const QueryFilter = () => {
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage, setMessageInfo} = useMessage();
    return <h2>query filter</h2>
}
    
export default QueryFilter;
