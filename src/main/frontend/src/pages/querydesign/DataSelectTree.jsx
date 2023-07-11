import React, { useState, useEffect } from "react";
import TreeView from "react-accessible-treeview";
import {FcDataSheet, FcTimeline, FcDatabase, FcTreeStructure, FcKey} from "react-icons/fc";
import { FaSquare, FaCheckSquare, FaMinusSquare } from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";
import cx from "classnames";
import PropTypes from "prop-types";
import {
    NODE_TYPE_ROOT,
        NODE_TYPE_TABLE,
        NODE_TYPE_COLUMN,
        NODE_TYPE_IMPORTED_FOREIGNKEY,
        NODE_TYPE_EXPORTED_FOREIGNKEY,
        SMALL_ICON_SIZE} from "../../utils/helper";

const DataSelectTree = (props) => {
    const {data, selectedIds} = props;
    const ArrowIcon = ({ isOpen, className }) => {
        const baseClass = "arrow";
        const classes = cx(
                baseClass,
                {[`${baseClass}--closed`]: !isOpen},
                {[`${baseClass}--open`]: isOpen},
                className
                );
        return <IoMdArrowDropright className={classes} />;
    };

    const getSelectedIds = () => {
        if (!selectedIds) {
            return [];
        } else {
            return selectedIds;
        }
    };
    
    const CheckBoxIcon = ({ checked, ...rest }) => {
        if (checked) {
            return <FaCheckSquare {...rest} />;
        } else {
            return <FaSquare {...rest} />;
        }
    };
    
    const getIcon = (element) => {
        if (element.metadata && element.metadata.type) {
            switch (String(element.metadata.type)) {
                case NODE_TYPE_ROOT:
                    return <FcDatabase className="icon-s" size={SMALL_ICON_SIZE}/>;
                case NODE_TYPE_TABLE:
                    return <FcDataSheet className="icon-s" size={SMALL_ICON_SIZE}/>;
                case NODE_TYPE_COLUMN:
                    if (element.metadata.pk) {
                        return <FcKey className="icon-s" size={SMALL_ICON_SIZE}/>;
                    } else {    
                        return <FcTimeline className="icon-s" size={SMALL_ICON_SIZE}/>;
                    }    
                case NODE_TYPE_IMPORTED_FOREIGNKEY:
                    return <FcTreeStructure className="icon-s" style = {{transform: "rotate(180deg)" }}size={SMALL_ICON_SIZE}/>;
                case NODE_TYPE_EXPORTED_FOREIGNKEY:
                    return <FcTreeStructure className="icon-s" size={SMALL_ICON_SIZE}/>;

            }
        } else {
            return "";
        }
    };

    const nodeRenderer = (p) => {
        const {element,
            isBranch,
            isExpanded,
            isSelected,
            isHalfSelected,
            getNodeProps,
            level,
            handleSelect,
            handleExpand} = p;
        return <div
            {...getNodeProps({onClick: handleExpand})}
            style={{marginLeft: 40 * (level - 1)}}
            >
            {isBranch && <ArrowIcon isOpen={isExpanded} />}
            {!isBranch && <CheckBoxIcon
                className="checkbox-icon"
                onClick={(e) => {
                    handleSelect(e);
                    e.stopPropagation();
                            }}
                checked={isSelected} />}
            <span className="name">{getIcon(element)}{element.name}</span>
        </div>
    };

    if (data) {
        return (<div className="tree-view">
            <TreeView
                data={data}
                propagateCollapse={true}
                multiSelect={true}
                selectedIds={getSelectedIds()}
                nodeRenderer={nodeRenderer}
                />
        </div>);
    } else {
        return <div></div>;
    }
};

DataSelectTree.propTypes = {
    data: PropTypes.object
};

export default DataSelectTree;