/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from 'react';
import useMessage from "../../context/MessageContext";
import useQueryDesign from "../../context/QueryDesignContext";
import useLang from "../../context/LangContext";
import {
    INFO, 
    WARN, 
    ERROR, 
    DEFAULT_ERROR_TITLE} from "../../utils/helper";
const SelectColumnEntry = () => {
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage, setMessageInfo} = useMessage();
    const {treeViewData, selectedNodeIds, baseTable, setTreeViewData, setSelectedNodeIds, setBaseTable} = useQueryDesign();

    return <h2>select column entry</h2>
};
    
export default SelectColumnEntry;
