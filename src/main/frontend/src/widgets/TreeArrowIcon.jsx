/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React from "react";
import cx from "classnames";
import { IoMdArrowDropright } from "react-icons/io";

const TreeArrowIcon = ({ isOpen, className }) => {
     const baseClass = "arrow";
     const classes = cx(
             baseClass,
             {[`${baseClass}--closed`]: !isOpen},
             {[`${baseClass}--open`]: isOpen},
             className
             );
     return <IoMdArrowDropright className={classes} />;
 };
 
export default TreeArrowIcon;