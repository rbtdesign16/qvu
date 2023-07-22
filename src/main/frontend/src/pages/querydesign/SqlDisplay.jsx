/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from 'react';
import useQueryDesign from "../../context/QueryDesignContext";
import useLang from "../../context/LangContext";
import PropTypes from "prop-types";
import useHelp from "../../context/HelpContext";
import {
    isDataTypeString,
    isDataTypeNumeric,
    isDataTypeDateTime
} from "../../utils/helper";


const SqlDisplay = (props) => {
    return <span>this is sql</span>;
};

SqlDisplay.propTypes = {
    sql: PropTypes.string.isRequired
};

export default SqlDisplay;