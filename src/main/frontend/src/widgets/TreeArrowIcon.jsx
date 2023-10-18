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