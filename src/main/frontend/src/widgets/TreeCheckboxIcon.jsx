import React from "react";
import { FaSquare, FaCheckSquare } from "react-icons/fa";

const TreeCheckboxIcon = ({ checked, ...rest }) => {
        if (checked) {
            return <FaCheckSquare {...rest} />;
        } else {
            return <FaSquare {...rest} />;
    }
};

export default TreeCheckboxIcon;