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
    const {data} = props;
    const [currentTable, setCurrentTable] = useState(null);
    const [selectedIds, setSelectedIds] = useState(props.selectedIds ? props.selectedIds : []);

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

    const CheckBoxIcon = ({ checked, ...rest }) => {
        if (checked) {
            return <FaCheckSquare {...rest} />;
        } else {
            return <FaSquare {...rest} />;
        }
    };
    
    const getColumnLinks = (md) => {
        if (md.fromdiscols && md.todiscols) {
            return ": [" + md.fromdiscols + " -> " + md.todiscols + "]";
        } else {
            return "";
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
                    return <FcTreeStructure   size={SMALL_ICON_SIZE} className="icon-s" style={{transform: "rotate(180deg)" }}/>;
                case NODE_TYPE_EXPORTED_FOREIGNKEY:
                    return <FcTreeStructure className="icon-s" size={SMALL_ICON_SIZE}/>;

            }
        } else {
            return "";
        }
    };

    const onClick = (e, element, handleSelect, isSelected) => {
        // if currently unselected to we are selecting
        if (!isSelected) {
            if (element.metadata && element.metadata.roottable) {
                if (!currentTable) {
                    setCurrentTable( element.metadata.roottable);
                }
                
                if (currentTable !== element.metadata.roottable) {
                    setSelectedIds([element.id]);
                    setCurrentTable(element.metadata.roottable);
                } else {
                    let sids = [...selectedIds];
                    sids.push(element.id);
                    setSelectedIds(sids);
                }
                    
            }
        } else { // unselect - remove id
            let sids = [...selectedIds];
            let indx = sids.indexOf(element.id);
            if (indx > -1) {
                sids.splice(indx, 1);
                setSelectedIds(sids);
            }
        }   
 
        handleSelect(e);
        e.stopPropagation();
    };

    const getNode = (element, handleSelect, isSelected, isBranch, isExpanded) => {
        if (isBranch) {
            return <span><ArrowIcon isOpen={isExpanded}/><span className="name">{getIcon(element)}{element.name}{getColumnLinks(element.metadata)}</span></span>;
         } else {
             return <span><CheckBoxIcon
                className="checkbox-icon"
                onClick={(e) => onClick(e, element, handleSelect, isSelected)}
                checked={isSelected}/><span className="name" onClick={(e) => onClick(e, element, handleSelect, isSelected)}>{getIcon(element)}{element.name}</span></span>;
         }       
    };
    
    const nodeRenderer = (p) => {
        const {element,
            isBranch,
            isExpanded,
            isSelected,
            getNodeProps,
            level,
            handleSelect,
            handleExpand} = p;
        return <div
            {...getNodeProps({onClick: handleExpand})}
            style={{marginLeft: 40 * (level - 1)}}
            >
            {getNode(element, handleSelect, isSelected, isBranch, isExpanded )}

        </div>
    };

    if (data) {
        return (<div className="tree-view">
            <TreeView
                data={data}
                propagateCollapse={true}
                multiSelect={true}
                selectedIds={selectedIds}
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